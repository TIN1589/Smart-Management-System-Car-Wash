# SCRUM-49 — Promotion Validation by Tier: Test Cases

**Service:** `BookingService.createBooking()` — promotion validation block (line 242–310)  
**Test class:** `PromotionValidationTest.java`  
**Nhánh:** `test/SCRUM-49-promotion-validation-by-tier`  
**Ngày:** 2026-09-08

---

## Phạm vi kiểm thử

Promotion validation nằm **inline** trong `createBooking()` — không tách ra method riêng. Test đi qua public API đó với các kịch bản promo khác nhau.

### Tier rank system

| Tier | Rank |
|------|------|
| MEMBER | 1 |
| SILVER | 2 |
| GOLD | 3 |
| PLATINUM | 4 |

`targetTiers` lưu dạng CSV (`"SILVER,GOLD,PLATINUM"`). `minRequiredRank` = rank thấp nhất trong list đó.  
Ví dụ: `"SILVER,GOLD"` → minRequiredRank = 2. Customer có rank ≥ 2 mới dùng được.

### Chuỗi validation (theo thứ tự trong code)

```
1. Promo tồn tại trong DB?          → ResourceNotFoundException
2. isActive = true?                 → BusinessException
3. Trong thời hạn startsAt/endsAt? → BusinessException
4. usageCount < usageLimit?         → BusinessException
5. userRank ≥ minRequiredRank?      → BusinessException
6. Chưa dùng promo này trước đó?   → BusinessException (cho phép nếu booking trước CANCELLED)
7. Tính discount
```

### Discount calculation

```
value ≤ 100  → phần trăm: discount = total × value/100
               nếu discount > maxDiscount → discount = maxDiscount

value > 100  → số tiền cố định: discount = value
               nếu discount > total → discount = total
```

---

## Test Cases

| # | Tên test | Kịch bản | Kết quả kỳ vọng | Kết quả thực tế |
|---|----------|----------|-----------------|-----------------|
| 1 | `createBooking_rejectsPromoWhenCustomerTierIsBelowMinimumRequired` | MEMBER + promo `SILVER,GOLD,PLATINUM` | `BusinessException` (rank 1 < 2) | PASS |
| 2 | `createBooking_allowsPromoWhenCustomerTierMeetsMinimumRequired` | GOLD + promo `SILVER,GOLD` | discount=40,000, total=160,000 | PASS |
| 3 | `createBooking_allowsPromoWhenTargetTiersIsEmptyMeaningOpenToAll` | MEMBER + promo `targetTiers=""` | Promo áp dụng được | PASS |
| 4 | `createBooking_rejectsPromoThatHasExpired` | `endsAt` ở quá khứ | `BusinessException` | PASS |
| 5 | `createBooking_rejectsPromoWhenUsageLimitIsReached` | `usageCount == usageLimit` | `BusinessException` | PASS |
| 6 | `createBooking_rejectsPromoWhenCustomerHasAlreadyUsedIt` | `existsByCustomer...` = true | `BusinessException` | PASS |
| 7 | `createBooking_capsPercentageDiscountAtMaxDiscount` | 30% × 200k = 60k > maxDiscount=50k | discount=50,000 (bị cap) | PASS |
| 8 | `createBooking_appliesFixedAmountDiscountWhenPromoValueExceeds100` | value=150,000 (> 100) → fixed | discount=150,000 (capped tại total=200k) | PASS |

**Tổng: 8/8 PASS**

---

## Ghi chú kỹ thuật

- **`targetTiers=""` → minRequiredRank=1**: nhánh `else` trong code set `minRequiredRank = 1` khi `targetTiers` null/blank — tất cả tier đều được. TC-3 cover edge case này.
- **Re-use check**: dùng `existsByCustomer...AndStatusNot(CANCELLED)` — booking bị hủy không tính là đã dùng. Design này cho phép khách thử lại nếu lần đặt trước bị cancel.
- **value ≤ 100 vs value > 100**: phân biệt % và VND cố định bằng ngưỡng 100. Đây là thiết kế trade-off (xem TODO trong DEV_NOTES): nếu giá trị cố định là 50k thì `value=50` sẽ bị nhầm thành 50%. Cần monitor khi thêm promo mới.
- **TC-8**: discount cố định 150,000 > total 200,000 — code có guard `if (discount > total) discount = total`. Test xác nhận booking vẫn được tạo (không ném exception) với discount được cap tại total.

---

## Liên kết

- [PromotionValidationTest.java](../backend/src/test/java/com/autowash/autowash_pro/service/PromotionValidationTest.java)
- [BookingService.java — promo validation block](../backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java)
- [Promotion.java](../backend/src/main/java/com/autowash/autowash_pro/entity/Promotion.java)
