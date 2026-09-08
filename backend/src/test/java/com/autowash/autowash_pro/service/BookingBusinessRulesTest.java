package com.autowash.autowash_pro.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import com.autowash.autowash_pro.dto.request.booking.CreateBookingRequest;
import com.autowash.autowash_pro.dto.request.booking.UpdateBookingStatusRequest;
import com.autowash.autowash_pro.entity.Booking;
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.entity.SystemConfig;
import com.autowash.autowash_pro.entity.Vehicle;
import com.autowash.autowash_pro.entity.WashService;
import com.autowash.autowash_pro.enums.BookingStatus;
import com.autowash.autowash_pro.enums.Tier;
import com.autowash.autowash_pro.exception.BusinessException;
import com.autowash.autowash_pro.repository.BookingRepository;
import com.autowash.autowash_pro.repository.BookingWashServiceRepository;
import com.autowash.autowash_pro.repository.CustomerPointsRepository;
import com.autowash.autowash_pro.repository.CustomerRepository;
import com.autowash.autowash_pro.repository.PromotionRepository;
import com.autowash.autowash_pro.repository.VehicleRepository;
import com.autowash.autowash_pro.repository.WashHistoryRepository;
import com.autowash.autowash_pro.repository.WashServiceRepository;

/**
 * SCRUM-43 — Validate Booking Business Rules
 *
 * validateSchedulableSlot() và validateStatusTransition() là private —
 * test đi qua public entry point createBooking() và updateStatus() tương ứng.
 *
 * Slot rules (08:00–18:00, mốc 30 phút, đặt trước ≥30', booking window theo tier):
 *   kiểm tra thứ tự: mốc phút → giờ mở cửa → khoảng cách now → booking window → capacity
 *
 * Transition rules (state machine):
 *   PENDING → CONFIRMED | CANCELLED
 *   CONFIRMED → IN_PROGRESS | CANCELLED
 *   IN_PROGRESS → DONE
 *   DONE | CANCELLED → terminal (không chuyển được)
 *
 * Dùng LENIENT strictness ở class level: các test kiểm tra rejection path thường ném exception
 * trước khi code đến một số stub — strict mode sẽ báo UnnecessaryStubbing sai.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingBusinessRulesTest {

    @Mock private BookingRepository            bookingRepository;
    @Mock private CustomerRepository           customerRepository;
    @Mock private VehicleRepository            vehicleRepository;
    @Mock private WashServiceRepository        washServiceRepository;
    @Mock private BookingWashServiceRepository bookingWashServiceRepository;
    @Mock private PromotionRepository          promotionRepository;
    @Mock private WashHistoryRepository        washHistoryRepository;
    @Mock private CustomerPointsRepository     customerPointsRepository;
    @Mock private LoyaltyService               loyaltyService;
    @Mock private NotificationService          notificationService;
    @Mock private AdminConfigService           adminConfigService;

    @InjectMocks
    private BookingService bookingService;

    private static final String CUSTOMER_PHONE = "0909123456";

    private UUID        customerId;
    private UUID        vehicleId;
    private UUID        serviceId;
    private UUID        bookingId;
    private Customer    memberCustomer;
    private Vehicle     vehicle;
    private WashService washService;
    private SystemConfig systemConfig;
    private UserDetails  authenticatedCustomer;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        vehicleId  = UUID.randomUUID();
        serviceId  = UUID.randomUUID();
        bookingId  = UUID.randomUUID();

        memberCustomer = Customer.builder()
                .customerId(customerId)
                .fullName("Nguyen Van A")
                .phone(CUSTOMER_PHONE)
                .tier(Tier.MEMBER)   // booking window = 7 ngày
                .totalPoints(0)
                .lifetimePoints(0)
                .totalSpend(BigDecimal.ZERO)
                .build();

        vehicle = Vehicle.builder()
                .vehicleId(vehicleId)
                .customer(memberCustomer)
                .licensePlate("51A-000.11")
                .vehicleType("CAR")
                .build();

        washService = WashService.builder()
                .serviceId(serviceId)
                .name("Rửa xe thường")
                .basePrice(new BigDecimal("30000"))
                .estimatedDuration(30)
                .isActive(true)
                .points(6)
                .isCombo(false)
                .build();

        // pointRate dùng khi tính điểm sau DONE — không liên quan các test slot/transition này
        systemConfig = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of())
                .build();

        authenticatedCustomer = new User(
                CUSTOMER_PHONE, "hashed_pw",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
    }

    // ── Slot validation ───────────────────────────────────────────────────────

    @Test
    void createBooking_rejectsSlotAtOddMinuteMark() {
        // 08:15 vi phạm rule "phải theo mốc 30 phút" (0 hoặc 30)
        LocalDateTime oddMinuteSlot = tomorrow().withHour(8).withMinute(15).withSecond(0).withNano(0);

        stubCustomerAndVehicle();
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        assertThrowsBusinessException(() -> bookingService.createBooking(
                requestFor(oddMinuteSlot), authenticatedCustomer));
    }

    @Test
    void createBooking_rejectsSlotBeforeOpeningHour() {
        // 07:00 nằm ngoài khung 08:00–18:00
        LocalDateTime beforeOpen = tomorrow().withHour(7).withMinute(0).withSecond(0).withNano(0);

        stubCustomerAndVehicle();
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        assertThrowsBusinessException(() -> bookingService.createBooking(
                requestFor(beforeOpen), authenticatedCustomer));
    }

    @Test
    void createBooking_rejectsSlotAfterClosingHour() {
        // 18:00 là giờ đóng cửa — điều kiện là !time.isBefore(CLOSE_TIME), tức 18:00 bị block
        LocalDateTime atClosingTime = tomorrow().withHour(18).withMinute(0).withSecond(0).withNano(0);

        stubCustomerAndVehicle();
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        assertThrowsBusinessException(() -> bookingService.createBooking(
                requestFor(atClosingTime), authenticatedCustomer));
    }

    @Test
    void createBooking_rejectsSlotWithLessThan30MinutesNotice() {
        // 20 phút từ bây giờ — chưa đủ khoảng cách tối thiểu 30 phút
        LocalDateTime tooSoon = LocalDateTime.now()
                .plusMinutes(20).withSecond(0).withNano(0);

        stubCustomerAndVehicle();
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        assertThrowsBusinessException(() -> bookingService.createBooking(
                requestFor(tooSoon), authenticatedCustomer));
    }

    @Test
    void createBooking_rejectsMemberBookingBeyond7DayWindow() {
        // MEMBER chỉ được đặt trong 7 ngày tới; 8 ngày tới vi phạm booking window
        LocalDateTime beyondWindow = LocalDateTime.now()
                .plusDays(8).withHour(9).withMinute(0).withSecond(0).withNano(0);

        stubCustomerAndVehicle();
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        assertThrowsBusinessException(() -> bookingService.createBooking(
                requestFor(beyondWindow), authenticatedCustomer));
    }

    // ── Status transition validation ──────────────────────────────────────────

    @Test
    void updateStatus_rejectsInvalidTransition_pendingToDone() {
        // PENDING → DONE bỏ qua CONFIRMED và IN_PROGRESS — vi phạm state machine
        Booking pendingBooking = bookingInStatus(BookingStatus.PENDING);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));

        assertThrowsBusinessException(() ->
                bookingService.updateStatus(bookingId, BookingStatus.DONE));
    }

    @Test
    void updateStatus_rejectsInvalidTransition_confirmedToDone() {
        // CONFIRMED → DONE bỏ qua IN_PROGRESS
        Booking confirmedBooking = bookingInStatus(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(confirmedBooking));

        assertThrowsBusinessException(() ->
                bookingService.updateStatus(bookingId, BookingStatus.DONE));
    }

    @Test
    void updateStatus_rejectsAnyTransitionFromTerminalStatus() {
        // Booking DONE là terminal — không cho phép bất kỳ chuyển trạng thái nào
        Booking doneBooking = bookingInStatus(BookingStatus.DONE);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(doneBooking));
        // updateStatus với DONE→DONE trả về booking hiện tại (idempotent theo code),
        // nên test transition thực sự sang trạng thái khác
        when(washHistoryRepository.existsByBooking_BookingId(bookingId)).thenReturn(true);

        // DONE → PENDING: không hợp lệ theo state machine
        assertThrowsBusinessException(() ->
                bookingService.updateStatus(bookingId, BookingStatus.PENDING));
    }

    @Test
    void updateStatus_allowsValidTransition_pendingToConfirmed() {
        Booking pendingBooking = bookingInStatus(BookingStatus.PENDING);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = bookingService.updateStatus(bookingId, BookingStatus.CONFIRMED);

        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        verify(notificationService).sendBookingStatusChanged(any(Booking.class));
    }

    @Test
    void updateStatus_allowsValidTransition_confirmedToInProgress() {
        Booking confirmedBooking = bookingInStatus(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(confirmedBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = bookingService.updateStatus(bookingId, BookingStatus.IN_PROGRESS);

        assertEquals(BookingStatus.IN_PROGRESS, response.getStatus());
    }

    @Test
    void updateStatus_allowsValidTransition_inProgressToDone() {
        Booking inProgressBooking = bookingInStatus(BookingStatus.IN_PROGRESS);
        inProgressBooking.setCustomer(memberCustomer);
        inProgressBooking.setBookingServices(List.of());

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(inProgressBooking));
        when(washHistoryRepository.existsByBooking_BookingId(bookingId)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = bookingService.updateStatus(bookingId, BookingStatus.DONE);

        assertEquals(BookingStatus.DONE, response.getStatus());
        // earnPoints phải được gọi khi booking hoàn tất
        verify(loyaltyService).earnPoints(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void stubCustomerAndVehicle() {
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(memberCustomer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        // washServiceRepository được stub lenient vì slot validation có thể fail trước khi đến bước này
        lenient().when(washServiceRepository.findAllById(List.of(serviceId)))
                .thenReturn(List.of(washService));
        lenient().when(bookingRepository.countByScheduledAtAndStatusIn(any(LocalDateTime.class), anyList()))
                .thenReturn(0);
    }

    private Booking bookingInStatus(BookingStatus status) {
        return Booking.builder()
                .bookingId(bookingId)
                .customer(memberCustomer)
                .vehicle(vehicle)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .status(status)
                .usedPoints(0)
                .pointsDiscountAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .bookingServices(List.of())
                .build();
    }

    private CreateBookingRequest requestFor(LocalDateTime slot) {
        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(slot);
        req.setServiceIds(List.of(serviceId));
        return req;
    }

    private static LocalDateTime tomorrow() {
        return LocalDateTime.now().plusDays(1).withSecond(0).withNano(0);
    }

    private static void assertThrowsBusinessException(org.junit.jupiter.api.function.Executable action) {
        assertThrows(BusinessException.class, action);
    }
}
