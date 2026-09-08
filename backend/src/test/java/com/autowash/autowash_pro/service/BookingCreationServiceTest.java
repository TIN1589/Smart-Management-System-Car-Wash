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
 * SCRUM-40 — Booking Creation API
 *
 * Covers the core booking creation flow in BookingService.createBooking().
 * Tests run with Mockito only — no Spring context, no DB.
 */
@ExtendWith(MockitoExtension.class)
class BookingCreationServiceTest {

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

    private UUID         customerId;
    private UUID         vehicleId;
    private UUID         serviceId;
    private UUID         promoId;
    private Customer     customer;
    private Vehicle      vehicle;
    private WashService  premiumWash;
    private SystemConfig systemConfig;
    private UserDetails  authenticatedCustomer;

    // 09:00 hai ngày tới — luôn hợp lệ: đúng mốc 30 phút, trong 08:00–18:00, đặt trước > 30 phút
    private LocalDateTime nextAvailableSlot;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        vehicleId  = UUID.randomUUID();
        serviceId  = UUID.randomUUID();
        promoId    = UUID.randomUUID();

        customer = Customer.builder()
                .customerId(customerId)
                .fullName("Nguyen Van A")
                .phone(CUSTOMER_PHONE)
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

        premiumWash = WashService.builder()
                .serviceId(serviceId)
                .name("Rửa xe cao cấp")
                .basePrice(new BigDecimal("50000"))
                .estimatedDuration(45)
                .isActive(true)
                .points(10)
                .isCombo(false)
                .build();

        // pointRate không ảnh hưởng trong các test này vì customPoints được truyền trực tiếp,
        // nhưng AdminConfigService.getSystemConfig() vẫn được gọi trong validateSchedulableSlot
        systemConfig = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of())
                .build();

        authenticatedCustomer = new User(
                CUSTOMER_PHONE, "hashed_pw",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        nextAvailableSlot = LocalDateTime.now()
                .plusDays(2).withHour(9).withMinute(0).withSecond(0).withNano(0);
    }

    @Test
    void createBooking_chargesFullServicePriceWhenNoDiscounts() {
        Booking persistedBooking = bookingWithAmount(new BigDecimal("50000"), 0, BigDecimal.ZERO);

        stubHappyPath(persistedBooking);

        CreateBookingRequest request = requestFor(vehicleId, nextAvailableSlot, List.of(serviceId));
        BookingResponse response = bookingService.createBooking(request, authenticatedCustomer);

        assertEquals(new BigDecimal("50000"), response.getTotalAmount());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(0, response.getUsedPoints());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_appliesPercentagePromoAndIncrementsUsageCount() {
        Promotion twentyPercentOff = promoOpenToAllTiers(new BigDecimal("20"), null);
        Booking persistedBooking = bookingWithAmount(new BigDecimal("40000"), 0, BigDecimal.ZERO);
        persistedBooking.setPromotion(twentyPercentOff);
        persistedBooking.setDiscountAmount(new BigDecimal("10000"));

        stubHappyPath(persistedBooking);
        when(promotionRepository.findById(promoId)).thenReturn(Optional.of(twentyPercentOff));
        when(bookingRepository.existsByCustomer_CustomerIdAndPromotion_PromoIdAndStatusNot(
                customerId, promoId, BookingStatus.CANCELLED)).thenReturn(false);

        CreateBookingRequest request = requestFor(vehicleId, nextAvailableSlot, List.of(serviceId));
        request.setPromoId(promoId);

        BookingResponse response = bookingService.createBooking(request, authenticatedCustomer);

        assertEquals(new BigDecimal("40000"), response.getTotalAmount());
        assertEquals(new BigDecimal("10000"), response.getDiscountAmount());
        // usageCount deve ser incrementado e persistido
        verify(promotionRepository).save(argThat(p -> p.getUsageCount() == 1));
    }

    @Test
    void createBooking_deductsLoyaltyPointsViaFifoAndLogsRedemption() {
        // 100 pontos × 100 VND/ponto = 10.000 VND de desconto
        Booking persistedBooking = bookingWithAmount(new BigDecimal("40000"), 100, new BigDecimal("10000"));

        stubHappyPath(persistedBooking);

        CreateBookingRequest request = requestFor(vehicleId, nextAvailableSlot, List.of(serviceId));
        request.setUsedPoints(100);

        BookingResponse response = bookingService.createBooking(request, authenticatedCustomer);

        assertEquals(new BigDecimal("40000"), response.getTotalAmount());
        assertEquals(100, response.getUsedPoints());
        verify(loyaltyService).deductPointsFifo(eq(customer), eq(100));
        verify(customerPointsRepository).save(any(CustomerPoints.class));
    }

    @Test
    void createBooking_rejectsRequestWhenNoneOfTheServiceIdsExist() {
        UUID unknownServiceId = UUID.randomUUID();

        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(unknownServiceId))).thenReturn(List.of());
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(nextAvailableSlot), anyList())).thenReturn(0);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);

        CreateBookingRequest request = requestFor(vehicleId, nextAvailableSlot, List.of(unknownServiceId));

        assertThrows(BusinessException.class,
                () -> bookingService.createBooking(request, authenticatedCustomer));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_rejectsRequestWhenSlotHasReachedCapacity() {
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(nextAvailableSlot), anyList())).thenReturn(2);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        // validateSchedulableSlot verifica a capacidade antes de carregar os serviços,
        // por isso washServiceRepository nunca é chamado neste caminho — stub desnecessário evitado
        lenient().when(washServiceRepository.findAllById(List.of(serviceId))).thenReturn(List.of(premiumWash));

        CreateBookingRequest request = requestFor(vehicleId, nextAvailableSlot, List.of(serviceId));

        assertThrows(BusinessException.class,
                () -> bookingService.createBooking(request, authenticatedCustomer));

        verify(bookingRepository, never()).save(any());
    }

    // ── helpers ──────────────────────────────────────────────────────────────────

    private void stubHappyPath(Booking returnedFromSave) {
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(serviceId))).thenReturn(List.of(premiumWash));
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(nextAvailableSlot), anyList())).thenReturn(0);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        when(bookingRepository.save(any(Booking.class))).thenReturn(returnedFromSave);
        when(bookingWashServiceRepository.save(any(BookingWashService.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    private Booking bookingWithAmount(BigDecimal total, int usedPoints, BigDecimal pointsDiscount) {
        return Booking.builder()
                .bookingId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .scheduledAt(nextAvailableSlot)
                .status(BookingStatus.PENDING)
                .priorityScore(customer.getTier().getPriorityScore())
                .totalAmount(total)
                .discountAmount(BigDecimal.ZERO)
                .usedPoints(usedPoints)
                .pointsDiscountAmount(pointsDiscount)
                .bookingServices(List.of())
                .build();
    }

    private Promotion promoOpenToAllTiers(BigDecimal value, BigDecimal maxDiscount) {
        return Promotion.builder()
                .promoId(promoId)
                .name("Ưu đãi " + value + "%")
                .promoType(PromoType.DISCOUNT)
                .value(value)
                .maxDiscount(maxDiscount)
                .targetTiers("MEMBER,SILVER,GOLD,PLATINUM")
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .usageCount(0)
                .usageLimit(100)
                .build();
    }

    private static CreateBookingRequest requestFor(UUID vehicleId, LocalDateTime slot, List<UUID> serviceIds) {
        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(slot);
        req.setServiceIds(serviceIds);
        return req;
    }
}
