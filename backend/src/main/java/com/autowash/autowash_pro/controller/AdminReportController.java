package com.autowash.autowash_pro.controller;

import com.autowash.autowash_pro.exception.BusinessException;
import com.autowash.autowash_pro.service.AdminReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Reports & Analytics", description = "Quản lý Báo cáo & Thống kê")
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/revenue")
    @Operation(
        summary = "Báo cáo doanh thu nâng cao",
        description = "Trả thống kê doanh thu theo khoảng thời gian. " +
                      "Nếu không truyền startDate/endDate sẽ trả toàn bộ lịch sử (TC01). " +
                      "startDate phải trước hoặc bằng endDate (TC13)."
    )
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @Parameter(description = "Độ phân giải: day | week | month", example = "day")
            @RequestParam(value = "granularity", defaultValue = "day") String granularity,
            @Parameter(description = "Ngày bắt đầu (yyyy-MM-dd), không bắt buộc", example = "2026-01-01")
            @RequestParam(value = "startDate", required = false) String startDate,
            @Parameter(description = "Ngày kết thúc (yyyy-MM-dd), không bắt buộc", example = "2026-12-31")
            @RequestParam(value = "endDate", required = false) String endDate) {

        // TC13: validate date range nếu cả hai đều được cung cấp
        if (startDate != null && endDate != null) {
            try {
                LocalDate start = LocalDate.parse(startDate);
                LocalDate end   = LocalDate.parse(endDate);
                if (start.isAfter(end)) {
                    throw new BusinessException("startDate không được sau endDate");
                }
            } catch (DateTimeParseException e) {
                throw new BusinessException("Định dạng ngày không hợp lệ, yêu cầu yyyy-MM-dd");
            }
        }

        return ResponseEntity.ok(adminReportService.getRevenueReport(granularity, startDate, endDate));
    }

    @GetMapping("/customers")
    @Operation(
        summary = "Báo cáo khách hàng & Tăng trưởng",
        description = "Trả thống kê tăng trưởng khách hàng trong khoảng thời gian cho trước."
    )
    public ResponseEntity<Map<String, Object>> getCustomerReport(
            @Parameter(description = "Ngày bắt đầu (yyyy-MM-dd), không bắt buộc")
            @RequestParam(value = "startDate", required = false) String startDate,
            @Parameter(description = "Ngày kết thúc (yyyy-MM-dd), không bắt buộc")
            @RequestParam(value = "endDate", required = false) String endDate) {
        return ResponseEntity.ok(adminReportService.getCustomerReport(startDate, endDate));
    }
}
