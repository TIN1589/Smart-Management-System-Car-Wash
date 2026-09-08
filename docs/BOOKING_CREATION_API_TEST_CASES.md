# SCRUM-40 | Booking Creation API — Test Cases

**Module:** Booking Management  
**Nhánh:** `test/SCRUM-40-booking-creation-api`  
**API Endpoint:** `POST /api/bookings`  
**Service class:** `BookingService.createBooking()`  
**Test class:** `BookingCreationServiceTest.java`  
**Ngày thực hiện:** 2026-09-08  

---

## Mô tả chức năng

API cho phép khách hàng đặt lịch rửa xe. Hỗ trợ:
- Chọn nhiều dịch vụ (multi-service)
- Áp dụng mã khuyến mãi (promotion code)
- Sử dụng điểm tích lũy để giảm giá (loyalty points)

**Công thức tính tiền:**
```
totalAmount = Σ(service.basePrice) − promoDiscount − pointsDiscount
```
Trong đó: `1 điểm = 100 VND`

---

## Test Cases

### TC-01 | Tạo booking thành công — Happy Path

| Trường | Giá trị |
|--------|---------|
| **Mục tiêu** | Tạo booking với customer + vehicle hợp lệ, 1 dịch vụ, không dùng promo hay điểm |
| **Input** | vehicleId: hợp lệ, scheduledAt: slot tương lai, serviceIds: [50k service] |
| **Expected** | HTTP 201, status=PENDING, totalAmount=50,000, usedPoints=0 |
| **Actual** | ✅ PASS |
| **Ghi chú** | `bookingRepository.save()` được gọi đúng 1 lần |

---

### TC-02 | Áp dụng promotion 20% — Discount đúng

| Trường | Giá trị |
|--------|---------|
| **Mục tiêu** | Promo 20% được tính đúng; `usageCount` tăng từ 0 → 1 |
| **Input** | promoId hợp lệ (active, trong hạn, mở cho tất cả tier) |
| **Expected** | discountAmount=10,000 (20% × 50,000), totalAmount=40,000 |
| **Actual** | ✅ PASS |
| **Ghi chú** | `promotionRepository.save()` được gọi với `usageCount=1` |

---

### TC-03 | Sử dụng 100 điểm — Trừ điểm đúng

| Trường | Giá trị |
|--------|---------|
| **Mục tiêu** | 100 điểm = 10,000 VND được trừ khỏi hóa đơn; `deductPointsFifo` được gọi |
| **Input** | usedPoints=100 (customer có 200 điểm) |
| **Expected** | pointsDiscountAmount=10,000, totalAmount=40,000; log REDEEM được lưu |
| **Actual** | ✅ PASS |
| **Ghi chú** | `loyaltyService.deductPointsFifo(customer, 100)` được verify |

---

### TC-04 | Service không tồn tại → BusinessException

| Trường | Giá trị |
|--------|---------|
| **Mục tiêu** | serviceIds chứa UUID không có trong DB → từ chối tạo booking |
| **Input** | serviceIds: [UUID ngẫu nhiên không tồn tại] |
| **Expected** | `BusinessException` với message chứa "không hợp lệ" hoặc "không tồn tại" |
| **Actual** | ✅ PASS |
| **Ghi chú** | `bookingRepository.save()` KHÔNG được gọi |

---

### TC-05 | Slot đã đầy (≥2 booking) → BusinessException

| Trường | Giá trị |
|--------|---------|
| **Mục tiêu** | Slot đã có 2 booking PENDING/CONFIRMED/IN_PROGRESS → từ chối |
| **Input** | `countByScheduledAtAndStatusIn()` trả về 2 |
| **Expected** | `BusinessException` với message chứa "hết chỗ" hoặc "slot" |
| **Actual** | ✅ PASS |
| **Ghi chú** | SLOT_CAPACITY = 2 (hằng số trong BookingService) |

---

## Tổng kết

| Metric | Giá trị |
|--------|---------|
| Tổng test cases | 5 |
| ✅ PASS | 5 |
| ❌ FAIL | 0 |
| Test type | Unit Test (Mockito, không cần DB) |
| Thời gian chạy | < 1 giây |

---

## Liên kết

- **Test file:** [`BookingCreationServiceTest.java`](../backend/src/test/java/com/autowash/autowash_pro/service/BookingCreationServiceTest.java)
- **Service:** [`BookingService.java`](../backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java)
- **Controller:** [`BookingController.java`](../backend/src/main/java/com/autowash/autowash_pro/controller/BookingController.java)
