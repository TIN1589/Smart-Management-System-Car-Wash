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
import com.autowash.autowash_pro.dto.response.booking.BookingResponse;
import com.autowash.autowash_pro.entity.Booking;
import com.autowash.autowash_pro.entity.BookingWashService;
import com.autowash.autowash_pro.entity.Customer;
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
 * SCRUM-49 — Promotion Validation by Tier
 *
 * Promotion validation nằm inline trong createBooking() (line 242–310) — test đi qua
 * public API đó. Các điểm thiết kế cần kiểm chứng:
 *
 *   Tier rank system: MEMBER=1 < SILVER=2 < GOLD=3 < PLATINUM=4
 *   targetTiers (CSV) → minRequiredRank = min(rank của các tier trong list)
 *   Discount: value ≤ 100 → phần trăm (capped bởi maxDiscount nếu có)
 *              value > 100 → số tiền cố định (VND)
 *   Kiểm tra re-use: existsByCustomer...AndStatusNot(CANCELLED) — cho phép dùng lại
 *   nếu booking trước bị hủy.
 * Dùng LENIENT strictness: rejection test ném exception giữa chừng nên nhiều stub
 * trong stubCommonDependencies() không được gọi tới — strict mode báo UnnecessaryStubbing sai.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PromotionValidationTest {

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
    private UUID        promoId;
    private Vehicle     vehicle;
    private WashService washService;       // basePrice = 200,000 VND
    private SystemConfig systemConfig;
    private UserDetails  authenticatedCustomer;
    private LocalDateTime validSlot;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        vehicleId  = UUID.randomUUID();
        serviceId  = UUID.randomUUID();
        promoId    = UUID.randomUUID();

        washService = WashService.builder()
                .serviceId(serviceId)
                .name("Rửa xe cao cấp")
                .basePrice(new BigDecimal("200000"))
                .estimatedDuration(60)
                .isActive(true)
                .points(20)
                .isCombo(false)
                .build();

        systemConfig = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of())
                .build();

        authenticatedCustomer = new User(
                CUSTOMER_PHONE, "hashed_pw",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        validSlot = LocalDateTime.now()
                .plusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0);
    }

    // ── Tier eligibility ──────────────────────────────────────────────────────

    @Test
    void createBooking_rejectsPromoWhenCustomerTierIsBelowMinimumRequired() {
        // Promo targetTiers="SILVER,GOLD,PLATINUM" → minRequiredRank=2 (SILVER)
        // MEMBER rank=1 < 2 → bị block
        Customer member = customerWith(Tier.MEMBER);
        stubCommonDependencies(member);
        stubPromoLookup(promoFor("SILVER,GOLD,PLATINUM", new BigDecimal("20"), null));

        assertThrows(BusinessException.class,
                () -> bookingService.createBooking(requestWithPromo(), authenticatedCustomer));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_allowsPromoWhenCustomerTierMeetsMinimumRequired() {
        // Promo targetTiers="SILVER,GOLD" → minRequiredRank=2 (SILVER)
        // GOLD rank=3 ≥ 2 → pass
        Customer gold = customerWith(Tier.GOLD);
        stubCommonDependencies(gold);

        Promotion twentyPercent = promoFor("SILVER,GOLD", new BigDecimal("20"), null);
        stubPromoLookup(twentyPercent);
        stubPromoNotUsedBefore(gold.getCustomerId());

        Booking saved = bookingWithDiscount(gold, new BigDecimal("160000"), new BigDecimal("40000"));
        saved.setPromotion(twentyPercent);
        when(bookingRepository.save(any())).thenReturn(saved);

        BookingResponse response = bookingService.createBooking(requestWithPromo(), authenticatedCustomer);

        assertEquals(new BigDecimal("160000"), response.getTotalAmount());
        assertEquals(new BigDecimal("40000"), response.getDiscountAmount());
    }

    @Test
    void createBooking_allowsPromoWhenTargetTiersIsEmptyMeaningOpenToAll() {
        // targetTiers="" hoặc null → minRequiredRank=1 → tất cả tier đều dùng được
        Customer member = customerWith(Tier.MEMBER);
        stubCommonDependencies(member);

        Promotion openPromo = promoFor("", new BigDecimal("10"), null);
        stubPromoLookup(openPromo);
        stubPromoNotUsedBefore(member.getCustomerId());

        Booking saved = bookingWithDiscount(member, new BigDecimal("180000"), new BigDecimal("20000"));
        saved.setPromotion(openPromo);
        when(bookingRepository.save(any())).thenReturn(saved);

        BookingResponse response = bookingService.createBooking(requestWithPromo(), authenticatedCustomer);

        assertNotNull(response.getPromoId());
    }

    // ── Promo lifecycle guards ────────────────────────────────────────────────

    @Test
    void createBooking_rejectsPromoThatHasExpired() {
        Customer gold = customerWith(Tier.GOLD);
        stubCommonDependencies(gold);

        // endsAt ở quá khứ → hết hạn
        Promotion expired = Promotion.builder()
                .promoId(promoId)
                .promoType(PromoType.DISCOUNT)
                .value(new BigDecimal("20"))
                .targetTiers("GOLD")
                .startsAt(LocalDateTime.now().minusDays(10))
                .endsAt(LocalDateTime.now().minusDays(1))
                .isActive(true)
                .usageCount(0)
                .usageLimit(100)
                .build();
        stubPromoLookup(expired);

        assertThrows(BusinessException.class,
                () -> bookingService.createBooking(requestWithPromo(), authenticatedCustomer));
    }

    @Test
    void createBooking_rejectsPromoWhenUsageLimitIsReached() {
        Customer gold = customerWith(Tier.GOLD);
        stubCommonDependencies(gold);

        Promotion exhausted = promoFor("GOLD", new BigDecimal("20"), null);
        exhausted.setUsageCount(100);
        exhausted.setUsageLimit(100); // usageCount == usageLimit → hết lượt
        stubPromoLookup(exhausted);

        assertThrows(BusinessException.class,
                () -> bookingService.createBooking(requestWithPromo(), authenticatedCustomer));
    }

    @Test
    void createBooking_rejectsPromoWhenCustomerHasAlreadyUsedIt() {
        // existsByCustomer...AndStatusNot(CANCELLED) = true → khách đã dùng promo này
        Customer gold = customerWith(Tier.GOLD);
        stubCommonDependencies(gold);
        stubPromoLookup(promoFor("GOLD", new BigDecimal("20"), null));

        when(bookingRepository.existsByCustomer_CustomerIdAndPromotion_PromoIdAndStatusNot(
                gold.getCustomerId(), promoId, BookingStatus.CANCELLED)).thenReturn(true);

        assertThrows(BusinessException.class,
                () -> bookingService.createBooking(requestWithPromo(), authenticatedCustomer));
    }

    // ── Discount calculation ──────────────────────────────────────────────────

    @Test
    void createBooking_capsPercentageDiscountAtMaxDiscount() {
        // 30% × 200,000 = 60,000 → vượt maxDiscount=50,000 → bị cap tại 50,000
        Customer gold = customerWith(Tier.GOLD);
        stubCommonDependencies(gold);

        Promotion cappedPromo = promoFor("GOLD", new BigDecimal("30"), new BigDecimal("50000"));
        stubPromoLookup(cappedPromo);
        stubPromoNotUsedBefore(gold.getCustomerId());

        Booking saved = bookingWithDiscount(gold, new BigDecimal("150000"), new BigDecimal("50000"));
        saved.setPromotion(cappedPromo);
        when(bookingRepository.save(any())).thenReturn(saved);

        BookingResponse response = bookingService.createBooking(requestWithPromo(), authenticatedCustomer);

        assertEquals(new BigDecimal("50000"), response.getDiscountAmount(),
                "Discount phải bị cap tại maxDiscount=50,000 dù 30% × 200,000 = 60,000");
        assertEquals(new BigDecimal("150000"), response.getTotalAmount());
    }

    @Test
    void createBooking_appliesFixedAmountDiscountWhenPromoValueExceeds100() {
        // value=150000 > 100 → xử lý như tiền cố định (không phải %)
        Customer gold = customerWith(Tier.GOLD);
        stubCommonDependencies(gold);

        Promotion fixedDiscount = promoFor("GOLD", new BigDecimal("150000"), null);
        stubPromoLookup(fixedDiscount);
        stubPromoNotUsedBefore(gold.getCustomerId());

        Booking saved = bookingWithDiscount(gold, new BigDecimal("50000"), new BigDecimal("150000"));
        saved.setPromotion(fixedDiscount);
        when(bookingRepository.save(any())).thenReturn(saved);

        BookingResponse response = bookingService.createBooking(requestWithPromo(), authenticatedCustomer);

        // Discount cố định 150,000 vượt total 200,000 → bị cap tại total
        assertEquals(new BigDecimal("150000"), response.getDiscountAmount());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Customer customerWith(Tier tier) {
        vehicle = Vehicle.builder()
                .vehicleId(vehicleId)
                .licensePlate("51A-999.99")
                .vehicleType("CAR")
                .build();

        Customer c = Customer.builder()
                .customerId(customerId)
                .fullName("Nguyen Van A")
                .phone(CUSTOMER_PHONE)
                .tier(tier)
                .totalPoints(0)
                .lifetimePoints(0)
                .totalSpend(BigDecimal.ZERO)
                .build();

        vehicle.setCustomer(c);
        return c;
    }

    private void stubCommonDependencies(Customer customer) {
        when(customerRepository.findByPhone(CUSTOMER_PHONE)).thenReturn(Optional.of(customer));
        when(vehicleRepository.findByVehicleIdAndCustomer_CustomerId(vehicleId, customerId))
                .thenReturn(Optional.of(vehicle));
        when(washServiceRepository.findAllById(List.of(serviceId))).thenReturn(List.of(washService));
        when(bookingRepository.countByScheduledAtAndStatusIn(eq(validSlot), anyList())).thenReturn(0);
        when(adminConfigService.getSystemConfig()).thenReturn(systemConfig);
        when(bookingWashServiceRepository.save(any(BookingWashService.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    private void stubPromoLookup(Promotion promo) {
        when(promotionRepository.findById(promoId)).thenReturn(Optional.of(promo));
    }

    private void stubPromoNotUsedBefore(UUID cid) {
        when(bookingRepository.existsByCustomer_CustomerIdAndPromotion_PromoIdAndStatusNot(
                cid, promoId, BookingStatus.CANCELLED)).thenReturn(false);
    }

    private Promotion promoFor(String targetTiers, BigDecimal value, BigDecimal maxDiscount) {
        return Promotion.builder()
                .promoId(promoId)
                .name("Promo Test")
                .promoType(PromoType.DISCOUNT)
                .value(value)
                .maxDiscount(maxDiscount)
                .targetTiers(targetTiers)
                .startsAt(LocalDateTime.now().minusDays(1))
                .endsAt(LocalDateTime.now().plusDays(30))
                .isActive(true)
                .usageCount(0)
                .usageLimit(100)
                .build();
    }

    private Booking bookingWithDiscount(Customer customer, BigDecimal total, BigDecimal discount) {
        return Booking.builder()
                .bookingId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .scheduledAt(validSlot)
                .status(BookingStatus.PENDING)
                .priorityScore(customer.getTier().getPriorityScore())
                .totalAmount(total)
                .discountAmount(discount)
                .usedPoints(0)
                .pointsDiscountAmount(BigDecimal.ZERO)
                .bookingServices(List.of())
                .build();
    }

    private CreateBookingRequest requestWithPromo() {
        CreateBookingRequest req = new CreateBookingRequest();
        req.setVehicleId(vehicleId);
        req.setScheduledAt(validSlot);
        req.setServiceIds(List.of(serviceId));
        req.setPromoId(promoId);
        return req;
    }
}
