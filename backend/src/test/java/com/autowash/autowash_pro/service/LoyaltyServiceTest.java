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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.autowash.autowash_pro.dto.request.loyalty.EarnPointsRequest;
import com.autowash.autowash_pro.dto.request.loyalty.RedeemPointsRequest;
import com.autowash.autowash_pro.dto.response.loyalty.EarnPointsResponse;
import com.autowash.autowash_pro.dto.response.loyalty.RedeemPointsResponse;
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.entity.CustomerPoints;
import com.autowash.autowash_pro.entity.SystemConfig;
import com.autowash.autowash_pro.entity.TierRule;
import com.autowash.autowash_pro.enums.PointType;
import com.autowash.autowash_pro.enums.Tier;
import com.autowash.autowash_pro.exception.BusinessException;
import com.autowash.autowash_pro.repository.CustomerPointsRepository;
import com.autowash.autowash_pro.repository.CustomerRepository;

/**
 * SCRUM-47 — Point Usage and Refund Logic
 *
 * Covers earnPoints(), redeemPoints(), và deductPointsFifo() trong LoyaltyService.
 *
 * Các điểm thiết kế cần kiểm chứng:
 *   - earnPoints với customPoints > 0 bỏ qua công thức amountPaid/vndPerPoint
 *   - Tier multiplier từ fallback enum (khi TierRules rỗng)
 *   - checkAndUpdateTier() dùng totalVisits — ngưỡng SILVER mặc định = 10 visits
 *   - deductPointsFifo() trừ record sắp hết hạn trước (FIFO by expiresAt ASC)
 *   - redeemPoints() ném BusinessException khi totalPoints < cost
 */
@ExtendWith(MockitoExtension.class)
class LoyaltyServiceTest {

    @Mock private CustomerRepository       customerRepository;
    @Mock private CustomerPointsRepository customerPointsRepository;
    @Mock private NotificationService      notificationService;
    @Mock private AdminConfigService       adminConfigService;

    @InjectMocks
    private LoyaltyService loyaltyService;

    private UUID customerId;
    private UUID washId;

    // SystemConfig với TierRules rỗng → service dùng fallback hardcode trong switch
    private SystemConfig defaultConfig;

    @BeforeEach
    void setUp() {
        customerId = UUID.randomUUID();
        washId     = UUID.randomUUID();

        defaultConfig = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of())
                .build();
    }

    // ── earnPoints ────────────────────────────────────────────────────────────

    @Test
    void earnPoints_usesCustomPointsDirectlyWhenProvided() {
        // customPoints > 0 → bỏ qua amountPaid / vndPerPoint và bỏ qua multiplier
        Customer customer = memberWith(0, 0);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(adminConfigService.getSystemConfig()).thenReturn(defaultConfig);
        when(customerRepository.save(any())).thenReturn(customer);

        EarnPointsRequest request = earnRequest(new BigDecimal("50000"), 15);
        EarnPointsResponse response = loyaltyService.earnPoints(request);

        assertEquals(15, response.getPointsEarned());
        assertEquals(15, response.getNewBalance());
        verify(customerPointsRepository).save(argThat(log ->
                log.getType() == PointType.EARN && log.getPoints() == 15));
    }

    @Test
    void earnPoints_appliesTierMultiplierFromFallbackWhenNoTierRulesConfigured() {
        // SILVER fallback multiplier = 1.10 → 50000 / 10000 × 1.10 = 5.5 → (int) 5
        Customer silverCustomer = customerWith(Tier.SILVER, 0, 5);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(silverCustomer));
        when(adminConfigService.getSystemConfig()).thenReturn(defaultConfig);
        when(customerRepository.save(any())).thenReturn(silverCustomer);

        EarnPointsRequest request = earnRequest(new BigDecimal("50000"), null);
        EarnPointsResponse response = loyaltyService.earnPoints(request);

        // 50000 / 10000 = 5.0 × 1.10 = 5.5 → floor → 5
        assertEquals(5, response.getPointsEarned());
    }

    @Test
    void earnPoints_appliesTierMultiplierFromTierRuleWhenConfigured() {
        // TierRule override: SILVER = 120% (multiplier lưu là 120, chia 100 → 1.20)
        TierRule silverRule = new TierRule();
        silverRule.setTier("SILVER");
        silverRule.setMultiplier(120);
        silverRule.setThreshold(10);

        SystemConfig configWithRule = SystemConfig.builder()
                .pointRate("10000")
                .tierRules(List.of(silverRule))
                .build();

        Customer silverCustomer = customerWith(Tier.SILVER, 0, 5);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(silverCustomer));
        when(adminConfigService.getSystemConfig()).thenReturn(configWithRule);
        when(customerRepository.save(any())).thenReturn(silverCustomer);

        EarnPointsRequest request = earnRequest(new BigDecimal("50000"), null);
        EarnPointsResponse response = loyaltyService.earnPoints(request);

        // 50000 / 10000 = 5.0 × 1.20 = 6.0 → 6
        assertEquals(6, response.getPointsEarned());
    }

    @Test
    void earnPoints_returnsZeroAndSkipsLogWhenAmountIsTooSmall() {
        // 500 VND / 10000 = 0.05 → floor → 0 điểm → không lưu log, không gửi notification
        Customer customer = memberWith(0, 0);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(adminConfigService.getSystemConfig()).thenReturn(defaultConfig);

        EarnPointsRequest request = earnRequest(new BigDecimal("500"), null);
        EarnPointsResponse response = loyaltyService.earnPoints(request);

        assertEquals(0, response.getPointsEarned());
        verify(customerPointsRepository, never()).save(any());
        verify(notificationService, never()).sendPointsEarned(any(), anyInt(), anyInt());
    }

    @Test
    void earnPoints_upgradesTierAndSendsNotificationWhenVisitsCrossThreshold() {
        // 10 totalVisits = ngưỡng SILVER (mặc định) → tier phải nâng từ MEMBER lên SILVER
        Customer almostSilver = memberWith(0, 9); // 9 visits, sắp đạt 10
        almostSilver.setTotalVisits(9);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(almostSilver));
        when(adminConfigService.getSystemConfig()).thenReturn(defaultConfig);
        when(customerRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // customPoints = 10 để qua được điều kiện points > 0 và trigger earnPoints flow
        EarnPointsRequest request = earnRequest(new BigDecimal("50000"), 10);
        loyaltyService.earnPoints(request);

        // Sau earnPoints, totalVisits được tăng lên 10 → checkAndUpdateTier → SILVER
        assertEquals(Tier.SILVER, almostSilver.getTier());
        verify(notificationService).sendTierChanged(eq(almostSilver), eq(Tier.MEMBER), eq(Tier.SILVER));
    }

    // ── redeemPoints ──────────────────────────────────────────────────────────

    @Test
    void redeemPoints_throwsWhenCustomerHasInsufficientBalance() {
        Customer customer = memberWith(50, 3); // chỉ có 50 điểm
        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        RedeemPointsRequest request = new RedeemPointsRequest(customerId, 100, UUID.randomUUID());
        assertThrows(BusinessException.class,
                () -> loyaltyService.redeemPoints(request, "0909123456"));
    }

    @Test
    void redeemPoints_deductsCorrectlyAndLogsRedemption() {
        Customer customer = memberWith(200, 5);
        when(customerRepository.findByPhone("0909123456")).thenReturn(Optional.of(customer));
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));

        // FIFO list: 1 record có đủ 200 điểm
        CustomerPoints earnRecord = activeEarnRecord(customer, 200, LocalDateTime.now().plusMonths(6));
        when(customerPointsRepository.findActiveEarnPointsFifo(eq(customerId), any()))
                .thenReturn(List.of(earnRecord));
        when(customerRepository.save(any())).thenReturn(customer);

        RedeemPointsRequest request = new RedeemPointsRequest(customerId, 80, UUID.randomUUID());
        RedeemPointsResponse response = loyaltyService.redeemPoints(request, "0909123456");

        assertEquals(80, response.getPointsUsed());
        assertEquals(120, response.getRemainingBalance()); // 200 - 80

        // Kiểm tra log REDEEM được ghi với points âm
        ArgumentCaptor<CustomerPoints> logCaptor = ArgumentCaptor.forClass(CustomerPoints.class);
        verify(customerPointsRepository, atLeast(1)).save(logCaptor.capture());
        boolean hasRedeemLog = logCaptor.getAllValues().stream()
                .anyMatch(p -> p.getType() == PointType.REDEEM && p.getPoints() == -80);
        assertTrue(hasRedeemLog, "Phải có log REDEEM với points = -80");
    }

    // ── deductPointsFifo ──────────────────────────────────────────────────────

    @Test
    void deductPointsFifo_consumesOldestExpiryRecordFirst() {
        Customer customer = memberWith(150, 3);

        // Record A hết hạn sớm hơn (3 tháng) — phải bị trừ trước
        CustomerPoints expiresSoon  = activeEarnRecord(customer, 80, LocalDateTime.now().plusMonths(3));
        CustomerPoints expiresLater = activeEarnRecord(customer, 70, LocalDateTime.now().plusMonths(9));

        // findActiveEarnPointsFifo trả về theo thứ tự expiresAt ASC (đã được sắp xếp bởi query)
        when(customerPointsRepository.findActiveEarnPointsFifo(eq(customerId), any()))
                .thenReturn(List.of(expiresSoon, expiresLater));

        loyaltyService.deductPointsFifo(customer, 100);

        // Record sắp hết hạn bị trừ hết (80 điểm) → record kia trừ 20 điểm còn lại
        assertEquals(0, expiresSoon.getPoints(),
                "Record sắp hết hạn phải bị trừ hết trước");
        assertEquals(50, expiresLater.getPoints(),
                "Record còn lại chỉ bị trừ phần thiếu (100 - 80 = 20)");
        assertEquals(50, customer.getTotalPoints(),
                "Customer.totalPoints phải giảm đúng 100 điểm");
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Customer memberWith(int totalPoints, int totalVisits) {
        return customerWith(Tier.MEMBER, totalPoints, totalVisits);
    }

    private Customer customerWith(Tier tier, int totalPoints, int totalVisits) {
        return Customer.builder()
                .customerId(customerId)
                .fullName("Nguyen Van A")
                .phone("0909123456")
                .tier(tier)
                .totalPoints(totalPoints)
                .lifetimePoints(totalPoints)
                .totalVisits(totalVisits)
                .totalSpend(BigDecimal.ZERO)
                .build();
    }

    private EarnPointsRequest earnRequest(BigDecimal amountPaid, Integer customPoints) {
        EarnPointsRequest req = new EarnPointsRequest();
        req.setCustomerId(customerId);
        req.setAmountPaid(amountPaid);
        req.setWashId(washId);
        req.setCustomPoints(customPoints);
        return req;
    }

    private CustomerPoints activeEarnRecord(Customer customer, int points, LocalDateTime expiresAt) {
        return CustomerPoints.builder()
                .pointId(UUID.randomUUID())
                .customer(customer)
                .type(PointType.EARN)
                .points(points)
                .balanceAfter(points)
                .expiresAt(expiresAt)
                .description("Tích điểm test")
                .build();
    }
}
