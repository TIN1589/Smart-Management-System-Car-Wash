package com.autowash.autowash_pro.service;

import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.entity.Vehicle;
import com.autowash.autowash_pro.entity.WashHistory;
import com.autowash.autowash_pro.enums.ServiceType;
import com.autowash.autowash_pro.repository.CustomerRepository;
import com.autowash.autowash_pro.repository.WashHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit Tests cho AdminReportService — SCRUM-27
 * Test plan: TC07–TC16 (Tính chính xác dữ liệu + Edge cases)
 *
 * Nguồn dữ liệu doanh thu: WashHistory.amountPaid
 * - WashHistory CHỈ được tạo khi booking DONE → CANCELLED/PENDING tự nhiên không tính (TC08/TC09)
 * - amountPaid lưu số tiền thực nhận sau khi trừ loyalty points (TC10) và promotion (TC11)
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminReportService — SCRUM-27 Revenue Report Tests")
class AdminReportServiceTest {

    @Mock
    private WashHistoryRepository washHistoryRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private AdminReportService adminReportService;

    // ─── Shared test fixtures ───────────────────────────────────────────────

    private Customer customer;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .customerId(UUID.randomUUID())
                .fullName("Nguyễn Văn A")
                .phone("0901234567")
                .build();

        vehicle = Vehicle.builder()
                .vehicleId(UUID.randomUUID())
                .vehicleType("CAR")
                .licensePlate("51A-12345")
                .build();
    }

    /** Tạo WashHistory stub với amountPaid cho trước */
    private WashHistory makeWash(BigDecimal amountPaid) {
        return WashHistory.builder()
                .washId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .serviceType(ServiceType.BASIC)
                .amountPaid(amountPaid)
                .washedAt(LocalDateTime.now().minusDays(1))
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC07: 3 booking hoàn thành → Tổng = tổng giá 3 booking
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC07 - Ba WashHistory hoàn thành → totalRevenue = tổng amountPaid")
    void getRevenueReport_ThreeCompletedWashes_TotalRevenueIsSum() {
        // Arrange: 3 wash lần lượt 100k, 200k, 300k
        List<WashHistory> washes = List.of(
                makeWash(new BigDecimal("100000")),
                makeWash(new BigDecimal("200000")),
                makeWash(new BigDecimal("300000"))
        );
        when(washHistoryRepository.findByWashedAtBetween(any(), any())).thenReturn(washes);

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-01-01", "2026-01-31");

        // Assert
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("600000"));
        assertThat(result.get("totalWashes")).isEqualTo(3);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC08: Booking bị hủy → Không tính vào doanh thu
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC08 - Booking CANCELLED → WashHistory không tồn tại → doanh thu = 0")
    void getRevenueReport_CancelledBookings_NotCountedInRevenue() {
        // Arrange: CANCELLED booking không tạo WashHistory → repository trả empty
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-01-01", "2026-01-31");

        // Assert: doanh thu phải = 0, không ném exception
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.get("totalWashes")).isEqualTo(0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC09: Booking pending (chưa thanh toán) → Không tính vào doanh thu đã thu
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC09 - Booking PENDING → WashHistory không tồn tại → doanh thu = 0")
    void getRevenueReport_PendingBookings_NotCountedInRevenue() {
        // Arrange: PENDING booking không có WashHistory
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-01-01", "2026-01-31");

        // Assert
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(BigDecimal.ZERO);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC10: Dùng loyalty points → Doanh thu = số tiền thực nhận sau trừ điểm
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC10 - Dùng 50 loyalty points → amountPaid đã trừ điểm → doanh thu = amountPaid")
    void getRevenueReport_LoyaltyPointsUsed_RevenueEqualsAmountPaid() {
        // Arrange: Giá gốc 200k, dùng 50 điểm = -50k → amountPaid = 150k
        // BookingService tính toán rồi lưu amountPaid = 150k vào WashHistory
        WashHistory washWithPoints = WashHistory.builder()
                .washId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .serviceType(ServiceType.PREMIUM)
                .amountPaid(new BigDecimal("150000"))   // số tiền THỰC nhận sau trừ điểm
                .pointsRedeemed(50)
                .discountApplied(new BigDecimal("50000"))
                .washedAt(LocalDateTime.now().minusDays(1))
                .build();
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(List.of(washWithPoints));

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-01-01", "2026-01-31");

        // Assert: doanh thu = amountPaid (150k), KHÔNG phải giá gốc 200k
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("150000"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC11: Áp dụng promotion → Doanh thu = giá gốc − chiết khấu
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC11 - Áp dụng promotion 10% → amountPaid = giá gốc − chiết khấu → doanh thu đúng")
    void getRevenueReport_PromotionApplied_RevenueEqualsDiscountedAmount() {
        // Arrange: Giá gốc 300k, promo 10% = -30k → amountPaid = 270k
        WashHistory washWithPromo = WashHistory.builder()
                .washId(UUID.randomUUID())
                .customer(customer)
                .vehicle(vehicle)
                .serviceType(ServiceType.FULL_DETAIL)
                .amountPaid(new BigDecimal("270000"))   // giá gốc 300k - promotion 30k
                .discountApplied(new BigDecimal("30000"))
                .washedAt(LocalDateTime.now().minusDays(1))
                .build();
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(List.of(washWithPromo));

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-01-01", "2026-01-31");

        // Assert: tổng doanh thu = 270k (sau chiết khấu)
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("270000"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC12: Không có booking nào → Doanh thu = 0, không lỗi
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC12 - Không có dữ liệu nào → totalRevenue = 0, không ném exception")
    void getRevenueReport_NoData_ReturnsZeroWithoutException() {
        // Arrange
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // Act & Assert: phải KHÔNG ném bất kỳ exception nào
        assertDoesNotThrow(() -> {
            Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-06-01", "2026-06-30");

            BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
            assertThat(totalRevenue).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(result.get("totalWashes")).isEqualTo(0);
            assertThat(result.get("chartData")).isNotNull();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC13: startDate sau endDate → Lỗi validation hoặc danh sách rỗng
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC13 - startDate sau endDate → trả kết quả rỗng (không lỗi ở service layer)")
    void getRevenueReport_StartDateAfterEndDate_ReturnsEmpty() {
        // Arrange: service nhận startDate > endDate (controller đã validate nhưng service cũng có guard)
        // Service trả empty thay vì ném exception (controller đã ném exception trước đó)

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-12-31", "2026-01-01");

        // Assert: phải trả báo cáo rỗng, không crash
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.get("totalWashes")).isEqualTo(0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC14: startDate = endDate → Đúng doanh thu trong ngày đó
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC14 - startDate = endDate → chỉ lấy doanh thu đúng ngày đó")
    void getRevenueReport_SameDay_ReturnsCorrectDayData() {
        // Arrange: 1 wash trong ngày 2026-06-01
        WashHistory todayWash = makeWash(new BigDecimal("180000"));
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(List.of(todayWash));

        // Act: startDate = endDate = 2026-06-01
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2026-06-01", "2026-06-01");

        // Assert
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("180000"));
        assertThat(result.get("totalWashes")).isEqualTo(1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC15: Khoảng thời gian dài (1 năm) → Trả đúng, không timeout
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC15 - Range 1 năm với nhiều dữ liệu → trả đúng, không exception")
    void getRevenueReport_OneYearRange_CompletesSuccessfully() {
        // Arrange: giả lập 12 wash phân bố trong năm
        List<WashHistory> yearWashes = List.of(
                makeWash(new BigDecimal("150000")),
                makeWash(new BigDecimal("200000")),
                makeWash(new BigDecimal("250000")),
                makeWash(new BigDecimal("180000")),
                makeWash(new BigDecimal("320000")),
                makeWash(new BigDecimal("100000")),
                makeWash(new BigDecimal("270000")),
                makeWash(new BigDecimal("210000")),
                makeWash(new BigDecimal("190000")),
                makeWash(new BigDecimal("300000")),
                makeWash(new BigDecimal("230000")),
                makeWash(new BigDecimal("160000"))
        );
        when(washHistoryRepository.findByWashedAtBetween(any(), any())).thenReturn(yearWashes);

        // Act & Assert: không exception, dữ liệu hợp lệ
        assertDoesNotThrow(() -> {
            Map<String, Object> result = adminReportService.getRevenueReport("month", "2026-01-01", "2026-12-31");
            assertThat(result.get("totalRevenue")).isNotNull();
            BigDecimal total = (BigDecimal) result.get("totalRevenue");
            assertThat(total).isGreaterThan(BigDecimal.ZERO);
            assertThat(result.get("totalWashes")).isEqualTo(12);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC16: Ngày trong tương lai → Doanh thu = 0
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC16 - Khoảng ngày trong tương lai → doanh thu = 0, không lỗi")
    void getRevenueReport_FutureDateRange_ReturnsZero() {
        // Arrange: không có WashHistory nào trong tương lai
        when(washHistoryRepository.findByWashedAtBetween(any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        Map<String, Object> result = adminReportService.getRevenueReport("day", "2099-01-01", "2099-12-31");

        // Assert: phải trả doanh thu = 0, không exception
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.get("totalWashes")).isEqualTo(0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC01 (service layer): Không có filter date → trả toàn bộ lịch sử
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("TC01 (service) - Không có filter date → query với range toàn bộ, trả kết quả")
    void getRevenueReport_NullDates_QueriesAllHistory() {
        // Arrange
        List<WashHistory> allHistory = List.of(
                makeWash(new BigDecimal("500000")),
                makeWash(new BigDecimal("300000"))
        );
        when(washHistoryRepository.findByWashedAtBetween(any(), any())).thenReturn(allHistory);

        // Act: truyền null cho cả startDate và endDate
        Map<String, Object> result = adminReportService.getRevenueReport("day", null, null);

        // Assert: service không crash, trả kết quả hợp lệ
        assertThat(result).containsKey("totalRevenue");
        BigDecimal totalRevenue = (BigDecimal) result.get("totalRevenue");
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("800000"));
    }
}
