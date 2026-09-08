package com.autowash.autowash_pro.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import com.autowash.autowash_pro.dto.response.booking.AvailabilitySlotResponse;
import com.autowash.autowash_pro.dto.response.booking.BookingResponse;
import com.autowash.autowash_pro.entity.Booking;
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.entity.CustomerPoints;
import com.autowash.autowash_pro.entity.SystemConfig;
import com.autowash.autowash_pro.entity.Vehicle;
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
 * SCRUM-41 — Booking Availability and Cancellation API
 *
 * Covers:
 *   - getAvailability: slot listing, remaining capacity, window enforcement by tier
 *   - cancelBooking: state guards, point refund on cancellation, admin override
 */
@ExtendWith(MockitoExtension.class)
class BookingAvailabilityCancellationTest {

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
    private static final String OTHER_CUSTOMER_PHONE = "0900000000";

    private UUID         customerId;
    private UUID         bookingId;
    private Customer     customer;
    private Vehicle      vehicle;
    private SystemConfig systemConfig;
    private UserDetails  authenticatedCustomer;
    private UserDetails  adminUser;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        bookingId  = UUID.randomUUID();

        customer = Customer.builder()
                .customerId(customerId)
                .fullName("Nguyen Van A")
                .phone(CUSTOMER_PHONE)
                .tier(Tier.MEMBER)
                .totalPoints(100)
                .lifetimePoints(100)
                .totalSpend(BigDecimal.ZERO)
                .build();

        vehicle = Vehicle.builder()
                .vehicleId(UUID.randomUUID())
                .customer(customer)
                .licensePlate("51A-123.45")
                .vehicleType("CAR")
                .build();

        systemConfig = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of())
                .build();

        authenticatedCustomer = new User(
                CUSTOMER_PHONE, "hashed_pw",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        adminUser = new User(
                "admin", "hashed_pw",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }

    // ── getAvailability ───────────────────────────────────────────────────────

    @Test
    void getAvailability_returnsSlotAsUnavailableWhenAtFullCapacity() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        // Cada slot consulta a contagem; aqui stubamos "any slot" para retornar 2 (capacidade máxima)
        when(bookingRepository.countByScheduledAtAndStatusIn(any(LocalDateTime.class), anyList()))
                .thenReturn(2);

        List<AvailabilitySlotResponse> slots = bookingService.getAvailability(tomorrow, authenticatedCustomer);

        assertFalse(slots.isEmpty(), "Deve retornar slots mesmo que todos estejam cheios");
        assertTrue(slots.stream().noneMatch(AvailabilitySlotResponse::isAvailable),
                "Nenhum slot deve estar disponível quando capacity=2/2");
    }

    @Test
    void getAvailability_marksSlotAsAvailableWhenCapacityHasRoom() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        when(bookingRepository.countByScheduledAtAndStatusIn(any(LocalDateTime.class), anyList()))
                .thenReturn(0);

        List<AvailabilitySlotResponse> slots = bookingService.getAvailability(tomorrow, authenticatedCustomer);

        assertTrue(slots.stream().anyMatch(AvailabilitySlotResponse::isAvailable),
                "Phải có ít nhất 1 slot trống khi không có booking nào");
        // MEMBER có booking window 7 ngày — ngày mai luôn nằm trong window
        slots.stream()
                .filter(AvailabilitySlotResponse::isAvailable)
                .forEach(slot -> assertEquals(2, slot.getRemainingCapacity(),
                        "Slot trống phải có remainingCapacity = SLOT_CAPACITY (2)"));
    }

    // ── cancelBooking ─────────────────────────────────────────────────────────

    @Test
    void cancelBooking_refundsPointsAndTransitionsStatusToCancelled() {
        int pointsUsedOnBooking = 50;
        Booking pendingBookingWithPoints = bookingInStatus(BookingStatus.PENDING, pointsUsedOnBooking);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBookingWithPoints));
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(bookingId, authenticatedCustomer);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        // Pontos usados na reserva devem ser devolvidos ao saldo do cliente
        assertEquals(customer.getTotalPoints(), 100 + pointsUsedOnBooking,
                "totalPoints deve ser restaurado após o cancelamento");
        verify(customerPointsRepository).save(any(CustomerPoints.class));
        verify(notificationService).sendBookingStatusChanged(any(Booking.class));
    }

    @Test
    void cancelBooking_throwsWhenTryingToCancelACompletedBooking() {
        Booking completedBooking = bookingInStatus(BookingStatus.DONE, 0);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(completedBooking));
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));

        assertThrows(BusinessException.class,
                () -> bookingService.cancelBooking(bookingId, authenticatedCustomer));
    }

    @Test
    void cancelBooking_throwsWhenCustomerAttemptsToAccessAnotherCustomersBooking() {
        Customer otherCustomer = Customer.builder()
                .customerId(UUID.randomUUID())
                .phone(OTHER_CUSTOMER_PHONE)
                .tier(Tier.MEMBER)
                .totalPoints(0)
                .lifetimePoints(0)
                .totalSpend(BigDecimal.ZERO)
                .build();

        Booking bookingOwnedByOther = Booking.builder()
                .bookingId(bookingId)
                .customer(otherCustomer)
                .vehicle(vehicle)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .status(BookingStatus.PENDING)
                .usedPoints(0)
                .pointsDiscountAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .bookingServices(List.of())
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(bookingOwnedByOther));
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));

        assertThrows(BusinessException.class,
                () -> bookingService.cancelBooking(bookingId, authenticatedCustomer));
    }

    @Test
    void cancelBooking_allowsAdminToForceCancel_evenWhenInProgress() {
        Booking inProgressBooking = bookingInStatus(BookingStatus.IN_PROGRESS, 0);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(inProgressBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        // Admin não precisa de findByPhone pois o acesso não é verificado para admins
        BookingResponse response = bookingService.cancelBooking(bookingId, adminUser);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
    }

    @Test
    void cancelBooking_isIdempotentWhenBookingIsAlreadyCancelled() {
        Booking alreadyCancelled = bookingInStatus(BookingStatus.CANCELLED, 0);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(alreadyCancelled));
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));

        BookingResponse response = bookingService.cancelBooking(bookingId, authenticatedCustomer);

        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        // Segunda chamada não deve persistir nada nem enviar notificação
        verify(bookingRepository, never()).save(any());
        verify(notificationService, never()).sendBookingStatusChanged(any());
    }

    // ── helper ────────────────────────────────────────────────────────────────

    private Booking bookingInStatus(BookingStatus status, int usedPoints) {
        return Booking.builder()
                .bookingId(bookingId)
                .customer(customer)
                .vehicle(vehicle)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .status(status)
                .usedPoints(usedPoints)
                .pointsDiscountAmount(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .bookingServices(List.of())
                .build();
    }
}
