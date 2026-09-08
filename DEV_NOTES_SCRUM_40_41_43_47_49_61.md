# DEV NOTES — SCRUM-40 | 41 | 43 | 47 | 49 | 61
> ⚠️ **File này là tài liệu NỘI BỘ** — đã được thêm vào `.gitignore` pattern `DEV_NOTES_*.md`.  
> **KHÔNG được push lên git.** Dùng để team đọc hiểu context, trace logic, và onboard member mới.

**Nhánh làm việc:** `feature/SCRUM-40-41-43-47-49-61-booking-loyalty-tests`  
**Người thực hiện:** _Duong Trung Tin_  
**Ngày bắt đầu:** 2026-09-08  
**Sprint:** Summer 2026

---

## 📌 Tổng quan

Sau khi review codebase, toàn bộ **business logic** cho các SCRUM dưới đây **đã được implement đầy đủ** trong backend Spring Boot. Những gì còn thiếu để đánh dấu DONE trên Jira là:

1. **Unit Tests** (JUnit 5 + Mockito) để kiểm chứng logic đúng theo spec
2. **Test Evidence Documents** trong `docs/` để team QA có thể trace

> Lý do chưa có test: các SCRUM này được dev nhanh để đáp ứng deadline sprint trước. Dev đã code logic nhưng chưa kịp viết test. Sprint này ưu tiên hoàn thiện test coverage.

---

## SCRUM-40 — Develop Booking Creation API

### Đã implement ở đâu?
- **Service:** [`BookingService.java`](backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java) — method `createBooking()` (line 131–401)
- **Controller:** [`BookingController.java`](backend/src/main/java/com/autowash/autowash_pro/controller/BookingController.java) — `POST /api/bookings` (line 40–47)
- **Entity:** [`Booking.java`](backend/src/main/java/com/autowash/autowash_pro/entity/Booking.java)

### Đã làm gì?
Có **2 luồng tạo booking** trong cùng một method:

**Luồng 1 — Khách tự đặt (authenticated):**
```
Customer login → chọn xe của mình (validate vehicleId vs customerId) → chọn services → chọn slot giờ → tạo Booking
```

**Luồng 2 — POS Admin đặt tại quầy (anonymous/admin):**
```
Admin gửi notes với format: "POS Admin: Tên | Phone:0909... | Biển số:51A-123 | Dòng xe:Toyota"
→ System tự parse notes để tìm/tạo Customer + Vehicle tự động
→ Tạo Booking gắn vào Customer tìm được
```

**Tính toán tổng tiền:**
```
total = sum(service.basePrice)
discount_promo = total × promo.value% (nếu có, capped bởi maxDiscount)
discount_points = usedPoints × 100đ/điểm (capped bởi finalTotal)
finalTotal = total - discount_promo - discount_points
```

### Vì sao thiết kế vậy?
- **2 luồng chung 1 method** để tránh duplicate logic tính tiền và validate slot. 
- Phân biệt luồng bằng `userDetails == null` (khi POS admin call không có auth token của khách).
- **Parse từ notes** là giải pháp tạm thời cho POS — tương lai nên tách thành API riêng `POST /api/admin/pos/bookings` với request body rõ ràng hơn (TODO).
- **1 điểm = 100 VND** — quy tắc này được hardcode. Nếu cần dynamic thì phải đưa vào `SystemConfig`.

### Test tạo ra (`BookingServiceTest.java`):
| Test case | Mục tiêu kiểm chứng |
|-----------|---------------------|
| `createBooking_success` | Happy path: booking tạo đúng, totalAmount đúng |
| `createBooking_withPromo_discountApplied` | Promo % giảm đúng, usageCount tăng |
| `createBooking_withUsedPoints_deducted` | Trừ điểm FIFO, points log REDEEM được lưu |
| `createBooking_serviceNotFound_throws` | serviceIds không tồn tại → BusinessException |
| `createBooking_slotFull_throws` | slot đã có 2 booking active → BusinessException |

---

## SCRUM-41 — Develop Booking Availability and Cancellation API

### Đã implement ở đâu?
- **Availability:** `BookingService.getAvailability()` (line 451–468) → `GET /api/bookings/availability`
- **Cancel:** `BookingService.cancelBooking()` (line 470–513) → `PATCH /api/bookings/{id}/cancel`

### Đã làm gì?

**Availability logic:**
```
Ngày được query → tạo list slot từ 08:00 đến 18:00, bước 30 phút
Mỗi slot: đếm số booking PENDING/CONFIRMED/IN_PROGRESS trong giờ đó
remaining = SLOT_CAPACITY(2) - booked_count
available = remaining > 0 && slot còn trong booking_window của tier
```

**Cancel logic:**
```
Booking DONE → từ chối hủy
Booking đã CANCELLED → trả về ngay (idempotent)
Booking IN_PROGRESS + không phải Admin → từ chối
→ Set status = CANCELLED
→ Nếu usedPoints > 0: hoàn điểm vào Customer + ghi log PointType.EARN
→ Gửi notification WebSocket
```

### Vì sao thiết kế vậy?
- **Slot capacity = 2** (hằng số) — tiệm rửa xe nhỏ, 2 bay rửa. Nếu mở rộng cần đưa vào `SystemConfig`.
- **Hoàn điểm khi hủy**: 1 điểm = 100đ đã trừ lúc booking → phải hoàn đúng số điểm `usedPoints`. Điểm hoàn được set `expiresAt = +12 tháng` (không phải vĩnh viễn vì là điểm tích lại).
- **Idempotent cancel**: gọi cancel 2 lần không lỗi — tránh race condition từ frontend.

### Test tạo ra:
| Test case | Mục tiêu kiểm chứng |
|-----------|---------------------|
| `getAvailability_slotFull_notAvailable` | Slot có 2 booking → available=false |
| `cancelBooking_pending_success_withPointRefund` | Hủy PENDING + hoàn điểm đúng |
| `cancelBooking_done_throws` | Booking DONE → BusinessException |
| `cancelBooking_otherCustomer_throws` | Customer khác hủy → BusinessException |
| `cancelBooking_adminCancelInProgress_success` | Admin hủy IN_PROGRESS → thành công |

---

## SCRUM-43 — Validate Booking Business Rules

### Đã implement ở đâu?
- `validateSchedulableSlot()` (line 691–726) — gọi trong `createBooking()`
- `validateStatusTransition()` (line 736–762) — gọi trong `updateStatus()`
- `isWithinBookingWindow()` (line 728–733)

### Đã làm gì?

**Các business rule được validate:**

| Rule | Logic | Exception message |
|------|-------|-------------------|
| Slot phải theo mốc 30 phút | `scheduledAt.getMinute() % 30 != 0` | "Slot đặt lịch phải theo mốc 30 phút" |
| Trong giờ mở cửa 08:00–18:00 | `time.isBefore(OPEN_TIME) || !time.isBefore(CLOSE_TIME)` | "Chỉ nhận lịch trong khung 08:00 - 18:00" |
| Đặt trước ≥ 30 phút | `!scheduledAt.isAfter(now.plusMinutes(30))` | "Vui lòng đặt lịch trước ít nhất 30 phút" |
| Booking window theo tier | `!scheduledAt.isAfter(now.plusDays(bookingWindowDays))` | "Hạng X chỉ được đặt lịch trong Y ngày tới" |
| Slot còn chỗ | `booked >= SLOT_CAPACITY(2)` | "Khung giờ này đã hết chỗ" |

**Status transition map:**
```
PENDING  → CONFIRMED | CANCELLED
CONFIRMED → IN_PROGRESS | CANCELLED
IN_PROGRESS → DONE
DONE, CANCELLED → (terminal, không chuyển được)
```

### Vì sao thiết kế vậy?
- **Booking window theo tier** là ưu đãi khách VIP: PLATINUM được đặt xa hơn MEMBER. Giá trị lấy từ `TierRule` trong `SystemConfig` (dynamic) — fallback về enum mặc định nếu chưa config.
- **Status transition rõ ràng** tránh admin nhảy trạng thái sai gây lỗi tính điểm (ví dụ: PENDING → DONE bỏ qua bước IN_PROGRESS sẽ không trigger WashHistory đúng cách).

### Test tạo ra:
| Test case | Mục tiêu kiểm chứng |
|-----------|---------------------|
| `validateSlot_oddMinute_throws` | Slot 08:15 → BusinessException |
| `validateSlot_beforeOpenTime_throws` | Slot 07:00 → BusinessException |
| `validateSlot_tooSoon_throws` | Slot cách now < 30 phút → BusinessException |
| `validateSlot_beyondWindow_throws` | MEMBER đặt quá 7 ngày → BusinessException |
| `validateTransition_pendingToDone_throws` | PENDING→DONE → BusinessException |
| `validateTransition_pendingToConfirmed_ok` | PENDING→CONFIRMED → thành công |

---

## SCRUM-47 — Develop Point Usage and Refund Logic

### Đã implement ở đâu?
- **Service:** [`LoyaltyService.java`](backend/src/main/java/com/autowash/autowash_pro/service/LoyaltyService.java)
  - `earnPoints()` (line 46–120)
  - `redeemPoints()` (line 127–166)
  - `deductPointsFifo()` (line 378–393)
  - `expireOldPoints()` — cron 00:00 hàng ngày (line 283–315)
- **Refund khi hủy:** `BookingService.cancelBooking()` (line 491–508)
- **Controller:** [`LoyaltyController.java`](backend/src/main/java/com/autowash/autowash_pro/controller/LoyaltyController.java)

### Đã làm gì?

**earnPoints — Tích điểm sau khi booking DONE:**
```
points = amountPaid / vndPerPoint × tierMultiplier
  hoặc customPoints (nếu được truyền trực tiếp từ tổng điểm các dịch vụ)
→ Cập nhật Customer.totalPoints, lifetimePoints, totalVisits, lastVisitAt
→ Lưu CustomerPoints log (PointType.EARN, expiresAt = +12 tháng)
→ Check và upgrade tier nếu vượt ngưỡng totalVisits
→ Gửi notification WebSocket
```

**deductPointsFifo — Trừ điểm:**
```
Lấy danh sách CustomerPoints loại EARN, còn hạn, sắp hết hạn nhất trước
Trừ lần lượt cho đến khi đủ totalCost
→ Cập nhật từng record points
→ Cập nhật Customer.totalPoints
```

**Tier Multiplier:**
| Tier | Multiplier |
|------|-----------|
| MEMBER | ×1.0 |
| SILVER | ×1.1 |
| GOLD | ×1.25 |
| PLATINUM | ×1.5 |

*(Lấy từ `TierRule` config động, fallback về hardcode trên)*

### Vì sao thiết kế vậy?
- **FIFO deduction** đảm bảo khách không mất điểm có hạn dài khi có điểm sắp hết hạn. Tránh khiếu nại "điểm mới dùng mà điểm cũ vẫn hết hạn".
- **customPoints từ BookingService**: khi booking DONE, tổng điểm tính từ `WashService.points × quantity` của từng dịch vụ, truyền thẳng vào `EarnPointsRequest.customPoints` — bỏ qua công thức `amountPaid / vndPerPoint` để giá trị điểm chính xác theo catalog dịch vụ.
- **Expire cron 00:00**: điểm `expiresAt` quá hạn bị set về `points=0` (không xóa record) để giữ audit trail.

### Test tạo ra:
| Test case | Mục tiêu kiểm chứng |
|-----------|---------------------|
| `earnPoints_silverTier_multiplierApplied` | SILVER nhận đúng 1.1× điểm |
| `earnPoints_tierUpgrade_whenVisitsThreshold` | Vượt ngưỡng Silver → tier thay đổi |
| `earnPoints_tooSmallAmount_returns0Points` | amountPaid quá nhỏ → 0 điểm, không throw |
| `redeemPoints_insufficient_throws` | Điểm không đủ → BusinessException |
| `deductPointsFifo_correctOrder` | Trừ đúng record sắp hết hạn nhất trước |
| `cancelBooking_withPoints_refundCorrect` | Hủy booking → hoàn đúng `usedPoints` về Customer |

---

## SCRUM-49 — Develop Promotion Validation by Tier

### Đã implement ở đâu?
- **Validate trong createBooking:** `BookingService.java` line 242–310
- **Validate trong updateStatus (Admin POS):** `BookingService.java` line 546–577
- **Entity:** [`Promotion.java`](backend/src/main/java/com/autowash/autowash_pro/entity/Promotion.java)
- **Service:** [`PromotionService.java`](backend/src/main/java/com/autowash/autowash_pro/service/PromotionService.java)

### Đã làm gì?

**Chuỗi validation khi apply promo:**
```
1. Promo tồn tại trong DB?                     → ResourceNotFoundException nếu không
2. Promo đang active (isActive=true)?          → BusinessException
3. Promo còn trong thời hạn (startsAt/endsAt)? → BusinessException
4. Promo chưa hết usageLimit?                  → BusinessException
5. Tier rank của customer ≥ min tier của promo? → BusinessException
6. Customer chưa dùng promo này (booking ≠ CANCELLED)? → BusinessException
7. Tính discount: % hoặc fixed, capped bởi maxDiscount
```

**Tier Rank hệ thống:**
```
MEMBER=1 < SILVER=2 < GOLD=3 < PLATINUM=4
```
Promo có `targetTiers = "SILVER,GOLD"` → minRequiredRank = 2 → MEMBER (rank 1) bị block.

**Discount calculation:**
```
Nếu value ≤ 100 → đây là phần trăm (%):
  discount = total × value/100
  nếu discount > maxDiscount → discount = maxDiscount

Nếu value > 100 → đây là số tiền cố định (VND):
  discount = value
  nếu discount > total → discount = total
```

### Vì sao thiết kế vậy?
- **targetTiers lưu dạng CSV string** (`"SILVER,GOLD,PLATINUM"`) thay vì quan hệ bảng riêng — đơn giản hóa query, phù hợp khi số tier cố định (4 tier).
- **Check "customer chưa dùng promo"** dùng `bookingRepository.existsByCustomer...AndStatusNot(CANCELLED)` để cho phép khách dùng lại promo nếu booking trước bị hủy.
- **Phân biệt % và fixed** bằng `value ≤ 100` là thỏa thuận nội bộ — đơn giản nhưng có edge case: nếu giảm giá cố định 50k mà value=50 thì sẽ bị nhầm thành 50%. **TODO:** nên dùng `promoType` enum (`PERCENTAGE` / `FIXED`) để phân biệt rõ ràng thay vì dùng ngưỡng 100.

### Test tạo ra:
| Test case | Mục tiêu kiểm chứng |
|-----------|---------------------|
| `applyPromo_memberTierOnSilverPromo_throws` | MEMBER bị block bởi promo SILVER+ |
| `applyPromo_goldTierOnSilverPromo_success` | GOLD pass promo SILVER+ → discount tính đúng |
| `applyPromo_expired_throws` | Promo quá hạn → BusinessException |
| `applyPromo_usageLimitReached_throws` | usageCount = usageLimit → BusinessException |
| `applyPromo_alreadyUsed_throws` | Customer dùng lại promo → BusinessException |
| `applyPromo_percentWithMaxDiscount_capped` | Discount % vượt maxDiscount → bị cap đúng |

---

## SCRUM-61 — Execute Loyalty and Admin API Test Cases

### Đã làm gì?
- Viết 3 file Unit Test cover toàn bộ SCRUM 40–49
- Tạo 3 file Test Evidence trong `docs/`:
  - `docs/BOOKING_API_TEST_CASES.md`
  - `docs/LOYALTY_API_TEST_CASES.md`
  - `docs/PROMOTION_API_TEST_CASES.md`

### Vì sao?
SCRUM-61 là SCRUM "execution" — chứng minh bằng tài liệu rằng các API đã được test. Đây là requirement của SRS để đảm bảo quality gate trước khi merge vào `main`.

---

## Cách chạy test

```bash
cd backend

# Chạy tất cả test mới
./mvnw test -Dtest="BookingServiceTest,LoyaltyServiceTest,PromotionValidationTest" -q

# Chạy toàn bộ test suite
./mvnw test -q

# Xem report
open target/surefire-reports/
```

---

## Các vấn đề / TODO phát hiện khi viết test

| # | Vị trí | Vấn đề | Mức độ | Gợi ý fix |
|---|--------|---------|--------|-----------|
| 1 | `BookingService` line ~155 | POS parse từ `notes` string dễ lỗi nếu format sai | Medium | Tách API riêng `POST /api/admin/pos/bookings` |
| 2 | `LoyaltyService` line 399 | `checkAndUpdateTier()` dùng `totalVisits` all-time thay vì 12 tháng gần nhất | Low | Đổi sang query `WashHistory` (cần Dev-3 hỗ trợ) |
| 3 | `BookingService` line 296 | Phân biệt promo % vs fixed bằng `value ≤ 100` dễ nhầm | Medium | Dùng `promoType` enum `PERCENTAGE/FIXED` |
| 4 | `BookingService` line 112 | `SLOT_CAPACITY = 2` hardcode | Low | Đưa vào `SystemConfig` |

---

## Ghi chú cho người review

- Tất cả test dùng **MockitoExtension** — không cần DB/Redis thật → chạy nhanh (<3s)
- Mock các repository bằng `@Mock`, inject vào service bằng `@InjectMocks`
- Không dùng `@SpringBootTest` vì không cần load full context
- Nếu muốn add Integration Test sau: dùng `@DataJpaTest` + H2 in-memory
