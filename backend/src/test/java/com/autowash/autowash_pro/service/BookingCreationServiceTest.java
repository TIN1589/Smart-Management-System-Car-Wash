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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import com.autowash.autowash_pro.dto.request.booking.CreateBookingRequest;
import com.autowash.autowash_pro.dto.response.booking.BookingResponse;
import com.autowash.autowash_pro.entity.Booking;
import com.autowash.autowash_pro.entity.BookingWashService;
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.entity.CustomerPoints;
import com.autowash.autowash_pro.entity.Promotion;
import com.autowash.autowash_pro.entity.SystemConfig;
import com.autowash.autowash_pro.entity.Vehicle;
import com.autowash.autowash_pro.entity.WashService;
import com.autowash.autowash_pro.enums.BookingStatus;
import com.autowash.autowash_pro.enums.PromoType;
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
 * SCRUM-40 — Develop Booking Creation API
 *
 * Kiểm thử logic tạo lịch đặt xe (createBooking) trong BookingService:
 *   - Happy path: tạo booking thành công với customer & vehicle hợp lệ
 *   - Áp dụng promotion: tính discount đúng, usageCount tăng
 *   - Sử dụng điểm tích lũy: trừ điểm FIFO, ghi log REDEEM
 *   - Service không tồn tại: ném BusinessException
 *   - Slot đã đầy (≥2 booking active): ném BusinessException
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SCRUM-40 | Booking Creation API Tests")
class BookingCreationServiceTest {

    // ─── Repositories (mocked) ─────────────────────────────────────────────────
    @Mock private BookingRepository            bookingRepository;
    @Mock private CustomerRepository           customerRepository;
    @Mock private VehicleRepository            vehicleRepository;
    @Mock private WashServiceRepository        washServiceRepository;
    @Mock private BookingWashServiceRepository bookingWashServiceRepository;
    @Mock private PromotionRepository          promotionRepository;
    @Mock private WashHistoryRepository        washHistoryRepository;
    @Mock private CustomerPointsRepository     customerPointsRepository;

    // ─── Services (mocked) ─────────────────────────────────────────────────────
    @Mock private LoyaltyService     loyaltyService;
    @Mock private NotificationService notificationService;
    @Mock private AdminConfigService  adminConfigService;

    @InjectMocks
    private BookingService bookingService;

    // ─── Shared fixtures ───────────────────────────────────────────────────────
    private UUID         customerId;
    private UUID         vehicleId;
    private UUID         serviceId;
    private UUID         promoId;
    private Customer     customer;
    private Vehicle      vehicle;
    private WashService  washService;
    private SystemConfig systemConfig;
    private UserDetails  userDetails;

    /** Slot hợp lệ: đúng mốc 30 phút, trong giờ mở cửa, cách now ≥ 30 phút */
    private LocalDateTime validSlot;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        vehicleId  = UUID.randomUUID();
        serviceId  = UUID.randomUUID();
        promoId    = UUID.randomUUID();

        // Khách hàng hạng MEMBER, 200 điểm
        customer = Customer.builder()
                .customerId(customerId)
                .fullName("Nguyen Van A")
                .phone("0909123456")
                .tier(Tier.MEMBER)
                .totalPoints(200)
                .lifetimePoints(200)
                .totalVisits(3)
                .totalSpend(BigDecimal.ZERO)
                .build();

        vehicle = Vehicle.builder()
                .vehicleId(vehicleId)
                .customer(customer)
                .licensePlate("51A-123.45")
                .vehicleType("CAR")
                .brand("Toyota")
                .color("Trắng")
                .build();

        // Dịch vụ: giá 50,000 VND, 10 điểm
        washService = WashService.builder()
                .serviceId(serviceId)
                .name("Rửa xe cao cấp")
                .basePrice(new BigDecimal("50000"))
                .estimatedDuration(45)
                .isActive(true)
                .points(10)
                .isCombo(false)
                .build();

        // SystemConfig tối giản (không dùng TierRule trong unit test này)
        systemConfig = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of())
                .build();

        userDetails = new User(
                "0909123456",
                "hashed_pw",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        // Slot 2 ngày tới, 09:00 (đúng mốc 30 phút, trong khung giờ)
        validSlot = LocalDateTime.now().plusDays(2).withHour(9).withMinute(0).withSecond(0).withNano(0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TC-01 | createBooking_success
    // Kịch bản: Customer hợp lệ, vehicle hợp lệ, 1 service, không promo, không điểm
    // Kỳ vọng: Booking được lưu, totalAmount = basePrice của service
    // ═══════════════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("TC-01 | Tạo booking thành công — happy path")
    void createBooking_success() {
        // Arrange
        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(validSlot);
        req.setServiceIds(List.of(serviceId));

        Booking savedBooking = Booking.builder()
                .bookingId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .scheduledAt(validSlot)
                .status(BookingStatus.PENDING)
                .priorityScore(customer.getTier().getPriorityScore())
                .totalAmount(new BigDecimal("50000"))
                .discountAmount(BigDecimal.ZERO)
                .usedPoints(0)
                .pointsDiscountAmount(BigDecimal.ZERO)
                .bookingServices(List.of())
                .build();

        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(serviceId)))
                .thenReturn(List.of(washService));
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(validSlot), anyList()))
                .thenReturn(0); // slot còn trống
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingWashServiceRepository.save(any(BookingWashService.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // Act
        BookingResponse response = bookingService.createBooking(req, userDetails);

        // Assert
        assertNotNull(response, "Response không được null");
        assertEquals(new BigDecimal("50000"), response.getTotalAmount(),
                "totalAmount phải bằng basePrice dịch vụ (50,000 VND)");
        assertEquals(BookingStatus.PENDING, response.getStatus(),
                "Booking mới tạo phải có trạng thái PENDING");
        assertEquals(0, response.getUsedPoints(),
                "Không dùng điểm thì usedPoints = 0");

        verify(bookingRepository).save(any(Booking.class));
        verify(bookingWashServiceRepository, atLeastOnce()).save(any(BookingWashService.class));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TC-02 | createBooking_withPromo_discountApplied
    // Kịch bản: Promo 20% hợp lệ, không có maxDiscount, customer MEMBER (promo mở cho tất cả)
    // Kỳ vọng: discount = 50000 × 20% = 10000, totalAmount = 40000, usageCount + 1
    // ═══════════════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("TC-02 | Tạo booking với promotion 20% — discount được áp dụng đúng")
    void createBooking_withPromo_discountApplied() {
        // Arrange
        Promotion promo = Promotion.builder()
                .promoId(promoId)
                .name("Ưu đãi 20%")
                .promoType(PromoType.DISCOUNT)
                .value(new BigDecimal("20"))       // 20% (value ≤ 100 → xử lý như phần trăm)
                .maxDiscount(null)                  // không giới hạn
                .targetTiers("MEMBER,SILVER,GOLD,PLATINUM") // mở cho tất cả
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .usageCount(0)
                .usageLimit(100)
                .build();

        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(validSlot);
        req.setServiceIds(List.of(serviceId));
        req.setPromoId(promoId);

        Booking savedBooking = Booking.builder()
                .bookingId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .scheduledAt(validSlot)
                .status(BookingStatus.PENDING)
                .priorityScore(customer.getTier().getPriorityScore())
                .totalAmount(new BigDecimal("40000"))
                .promotion(promo)
                .discountAmount(new BigDecimal("10000"))
                .usedPoints(0)
                .pointsDiscountAmount(BigDecimal.ZERO)
                .bookingServices(List.of())
                .build();

        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(serviceId)))
                .thenReturn(List.of(washService));
        when(promotionRepository.findById(promoId)).thenReturn(Optional.of(promo));
        when(bookingRepository.existsByCustomer_CustomerIdAndPromotion_PromoIdAndStatusNot(
                customerId, promoId, BookingStatus.CANCELLED)).thenReturn(false);
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(validSlot), anyList()))
                .thenReturn(0);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingWashServiceRepository.save(any(BookingWashService.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // Act
        BookingResponse response = bookingService.createBooking(req, userDetails);

        // Assert
        assertNotNull(response);
        assertEquals(new BigDecimal("40000"), response.getTotalAmount(),
                "totalAmount = 50000 - 10000 (20% discount)");
        assertEquals(new BigDecimal("10000"), response.getDiscountAmount(),
                "discountAmount phải = 10,000 VND");
        assertEquals(promoId, response.getPromoId(),
                "Booking phải ghi nhận promoId");

        // usageCount phải được tăng lên và lưu lại
        verify(promotionRepository).save(argThat(p -> p.getUsageCount() == 1));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TC-03 | createBooking_withUsedPoints_deducted
    // Kịch bản: Customer có 200 điểm, dùng 100 điểm = 10,000 VND giảm
    // Kỳ vọng: finalTotal = 50000 - 10000 = 40000, gọi deductPointsFifo, lưu log REDEEM
    // ═══════════════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("TC-03 | Tạo booking với 100 điểm — điểm được trừ đúng")
    void createBooking_withUsedPoints_deducted() {
        // Arrange
        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(validSlot);
        req.setServiceIds(List.of(serviceId));
        req.setUsedPoints(100); // 100 điểm = 10,000 VND

        Booking savedBooking = Booking.builder()
                .bookingId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .scheduledAt(validSlot)
                .status(BookingStatus.PENDING)
                .priorityScore(customer.getTier().getPriorityScore())
                .totalAmount(new BigDecimal("40000"))
                .discountAmount(BigDecimal.ZERO)
                .usedPoints(100)
                .pointsDiscountAmount(new BigDecimal("10000"))
                .bookingServices(List.of())
                .build();

        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(serviceId)))
                .thenReturn(List.of(washService));
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(validSlot), anyList()))
                .thenReturn(0);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingWashServiceRepository.save(any(BookingWashService.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // Act
        BookingResponse response = bookingService.createBooking(req, userDetails);

        // Assert
        assertNotNull(response);
        assertEquals(new BigDecimal("40000"), response.getTotalAmount(),
                "50000 - 10000 (100 điểm × 100đ) = 40,000 VND");
        assertEquals(100, response.getUsedPoints(),
                "usedPoints phải được ghi nhận là 100");
        assertEquals(new BigDecimal("10000"), response.getPointsDiscountAmount(),
                "pointsDiscountAmount = 100 × 100đ = 10,000 VND");

        // deductPointsFifo phải được gọi để trừ điểm
        verify(loyaltyService).deductPointsFifo(eq(customer), eq(100));
        // Log REDEEM phải được lưu vào DB
        verify(customerPointsRepository).save(any(CustomerPoints.class));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TC-04 | createBooking_serviceNotFound_throws
    // Kịch bản: serviceIds chứa UUID không tồn tại trong DB
    // Kỳ vọng: ném BusinessException "Các dịch vụ được chọn không hợp lệ..."
    // ═══════════════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("TC-04 | Service không tồn tại → ném BusinessException")
    void createBooking_serviceNotFound_throws() {
        // Arrange
        UUID fakeServiceId = UUID.randomUUID();

        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(validSlot);
        req.setServiceIds(List.of(fakeServiceId));

        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(fakeServiceId)))
                .thenReturn(List.of()); // DB trả về rỗng
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(validSlot), anyList()))
                .thenReturn(0);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> bookingService.createBooking(req, userDetails),
                "Phải ném BusinessException khi service không tồn tại");

        assertTrue(ex.getMessage().contains("không hợp lệ") || ex.getMessage().contains("không tồn tại"),
                "Message phải nêu rõ dịch vụ không hợp lệ. Actual: " + ex.getMessage());

        verify(bookingRepository, never()).save(any());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TC-05 | createBooking_slotFull_throws
    // Kịch bản: Slot đã có đúng SLOT_CAPACITY (2) booking active
    // Kỳ vọng: ném BusinessException "Khung giờ này đã hết chỗ"
    // Ghi chú: dùng lenient().when() cho stub washServiceRepository vì
    //          validate slot xảy ra TRƯỚC khi load services → stub có thể không được gọi
    // ═══════════════════════════════════════════════════════════════════════════
    @Test
    @DisplayName("TC-05 | Slot đã đầy (capacity = 2) → ném BusinessException")
    void createBooking_slotFull_throws() {
        // Arrange
        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(validSlot);
        req.setServiceIds(List.of(serviceId));

        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        // Dùng lenient vì slot check có thể ném exception trước khi stub này được dùng
        lenient().when(washServiceRepository.findAllById(List.of(serviceId)))
                .thenReturn(List.of(washService));
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(validSlot), anyList()))
                .thenReturn(2); // đã đạt giới hạn SLOT_CAPACITY = 2
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        // Act & Assert
        BusinessException ex = assertThrows(BusinessException.class,
                () -> bookingService.createBooking(req, userDetails),
                "Phải ném BusinessException khi slot đầy");

        assertTrue(ex.getMessage().contains("hết chỗ") || ex.getMessage().contains("slot"),
                "Message phải nêu rõ slot đã đầy. Actual: " + ex.getMessage());

        verify(bookingRepository, never()).save(any());
    }
}
