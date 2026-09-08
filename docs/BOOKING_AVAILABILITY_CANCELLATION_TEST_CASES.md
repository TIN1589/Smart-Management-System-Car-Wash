# SCRUM-41 — Booking Availability & Cancellation: Test Cases

**Endpoints:** `GET /api/bookings/availability` · `PATCH /api/bookings/{id}/cancel`  
**Service:** `BookingService.getAvailability()` · `BookingService.cancelBooking()`  
**Test class:** `BookingAvailabilityCancellationTest.java`  
**Nhánh:** `test/SCRUM-41-booking-availability-cancellation`  
**Ngày:** 2026-09-08

---

## Phạm vi kiểm thử

### getAvailability
Trả về danh sách slot trong ngày (08:00–18:00, mỗi 30 phút). Mỗi slot gồm `remainingCapacity` và `available`.

- `SLOT_CAPACITY = 2` — hardcode trong service
- `bookingWindowDays` phụ thuộc tier (MEMBER = 7 ngày, lấy từ `SystemConfig` hoặc fallback `Tier.getBookingWindowDays()`)

### cancelBooking
- Chỉ customer sở hữu booking hoặc ADMIN mới được hủy
- DONE → không hủy được
- Nếu `usedPoints > 0` → hoàn điểm về `Customer.totalPoints`
- Gọi cancel 2 lần → idempotent (trả về CANCELLED, không persist thêm)

---

## Test Cases

| # | Tên test | Điều kiện | Kết quả kỳ vọng | Kết quả thực tế |
|---|----------|-----------|-----------------|-----------------|
| 1 | `getAvailability_returnsSlotAsUnavailableWhenAtFullCapacity` | Tất cả slot đếm được 2 booking | `available=false` trên mọi slot | ✅ PASS |
| 2 | `getAvailability_marksSlotAsAvailableWhenCapacityHasRoom` | Không có booking, ngày mai (trong window MEMBER) | Có slot `available=true`, `remainingCapacity=2` | ✅ PASS |
| 3 | `cancelBooking_refundsPointsAndTransitionsStatusToCancelled` | Booking PENDING, usedPoints=50 | status=CANCELLED, totalPoints+50, log REFUND lưu, notification gửi | ✅ PASS |
| 4 | `cancelBooking_throwsWhenTryingToCancelACompletedBooking` | Booking status=DONE | `BusinessException` | ✅ PASS |
| 5 | `cancelBooking_throwsWhenCustomerAttemptsToAccessAnotherCustomersBooking` | Booking thuộc customer khác | `BusinessException` | ✅ PASS |
| 6 | `cancelBooking_allowsAdminToForceCancel_evenWhenInProgress` | Admin, booking IN_PROGRESS | status=CANCELLED | ✅ PASS |
| 7 | `cancelBooking_isIdempotentWhenBookingIsAlreadyCancelled` | Booking đã CANCELLED | status=CANCELLED, không gọi `save`, không gọi `sendNotification` | ✅ PASS |

**Tổng: 7/7 PASS**

---

## Ghi chú kỹ thuật

- `getAvailability` stub `countByScheduledAtAndStatusIn` với `any(LocalDateTime.class)` để cover tất cả 20 slot trong ngày — test tập trung vào logic `available`, không test giá trị cụ thể của từng giờ.
- Admin bypass không cần `customerRepository.findByPhone()` — `isAdmin()` check authorities trước khi query customer.
- Idempotent test verify `never().save()` và `never().sendBookingStatusChanged()` — quan trọng để tránh double-notification bug.

---

## Liên kết

- [BookingAvailabilityCancellationTest.java](../backend/src/test/java/com/autowash/autowash_pro/service/BookingAvailabilityCancellationTest.java)
- [BookingService.java](../backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java)
