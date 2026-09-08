# SCRUM-43 — Validate Booking Business Rules: Test Cases

**Service:** `BookingService` — `validateSchedulableSlot()` · `validateStatusTransition()`  
**Test class:** `BookingBusinessRulesTest.java`  
**Nhánh:** `test/SCRUM-43-validate-booking-business-rules`  
**Ngày:** 2026-09-08

---

## Phạm vi kiểm thử

Cả hai validator đều là `private` — test đi qua public entry point:
- **Slot rules** → `createBooking()` với các slot không hợp lệ
- **Transition rules** → `updateStatus()` với chuyển trạng thái không hợp lệ

### Slot validation — thứ tự kiểm tra trong code

```
1. Phút phải là 0 hoặc 30
2. Giờ trong khung 08:00 – 18:00 (18:00 bị block, điều kiện !time.isBefore(CLOSE_TIME))
3. scheduledAt > now + 30 phút
4. scheduledAt ≤ now + bookingWindowDays (theo tier)
5. countBookings(slot) < SLOT_CAPACITY (2)
```

### Status transition — state machine

```
PENDING    → CONFIRMED | CANCELLED
CONFIRMED  → IN_PROGRESS | CANCELLED
IN_PROGRESS → DONE
DONE       → terminal (không chuyển được)
CANCELLED  → terminal (không chuyển được)
```

---

## Test Cases

### Slot Validation

| # | Tên test | Slot đầu vào | Lý do reject | Kết quả |
|---|----------|-------------|--------------|---------|
| 1 | `createBooking_rejectsSlotAtOddMinuteMark` | 08:15 | Phút không phải 0 hoặc 30 | ✅ PASS |
| 2 | `createBooking_rejectsSlotBeforeOpeningHour` | 07:00 | Trước giờ mở cửa 08:00 | ✅ PASS |
| 3 | `createBooking_rejectsSlotAfterClosingHour` | 18:00 | Đúng giờ đóng cửa (inclusive) | ✅ PASS |
| 4 | `createBooking_rejectsSlotWithLessThan30MinutesNotice` | now + 20 phút | Chưa đủ 30 phút báo trước | ✅ PASS |
| 5 | `createBooking_rejectsMemberBookingBeyond7DayWindow` | now + 8 ngày | MEMBER window = 7 ngày | ✅ PASS |

### Status Transition

| # | Tên test | Transition | Hợp lệ? | Kết quả |
|---|----------|-----------|---------|---------|
| 6 | `updateStatus_rejectsInvalidTransition_pendingToDone` | PENDING → DONE | ❌ Bỏ qua CONFIRMED + IN_PROGRESS | ✅ PASS |
| 7 | `updateStatus_rejectsInvalidTransition_confirmedToDone` | CONFIRMED → DONE | ❌ Bỏ qua IN_PROGRESS | ✅ PASS |
| 8 | `updateStatus_rejectsAnyTransitionFromTerminalStatus` | DONE → PENDING | ❌ Terminal không chuyển được | ✅ PASS |
| 9 | `updateStatus_allowsValidTransition_pendingToConfirmed` | PENDING → CONFIRMED | ✅ | ✅ PASS |
| 10 | `updateStatus_allowsValidTransition_confirmedToInProgress` | CONFIRMED → IN_PROGRESS | ✅ | ✅ PASS |
| 11 | `updateStatus_allowsValidTransition_inProgressToDone` | IN_PROGRESS → DONE | ✅ + earnPoints được gọi | ✅ PASS |

**Tổng: 11/11 PASS**

---

## Ghi chú kỹ thuật

- **18:00 bị reject**: điều kiện trong code là `!time.isBefore(CLOSE_TIME)` — 18:00 không `isBefore(18:00)` nên bị block. Đây là edge case quan trọng: slot cuối cùng hợp lệ là **17:30**.
- **`stubCustomerAndVehicle()` dùng `lenient()`** cho `washServiceRepository` và `countByScheduledAt` vì slot validation có thể ném exception trước khi code đến bước load services.
- **IN_PROGRESS → DONE** trigger `loyaltyService.earnPoints()` — test verify call này để đảm bảo tích điểm không bị bỏ sót khi admin đánh dấu hoàn tất.

---

## Liên kết

- [BookingBusinessRulesTest.java](../backend/src/test/java/com/autowash/autowash_pro/service/BookingBusinessRulesTest.java)
- [BookingService.java — validateSchedulableSlot()](../backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java)
- [BookingService.java — validateStatusTransition()](../backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java)
