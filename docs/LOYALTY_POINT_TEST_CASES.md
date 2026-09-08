# SCRUM-47 — Point Usage and Refund Logic: Test Cases

**Service:** `LoyaltyService` — `earnPoints()` · `redeemPoints()` · `deductPointsFifo()`  
**Test class:** `LoyaltyServiceTest.java`  
**Nhánh:** `test/SCRUM-47-point-usage-refund-logic`  
**Ngày:** 2026-09-08

---

## Phạm vi kiểm thử

### earnPoints()
```
Nếu customPoints > 0  → dùng trực tiếp, bỏ qua amountPaid và multiplier
Nếu không            → points = floor(amountPaid / vndPerPoint × tierMultiplier)
Nếu points <= 0      → early return, không lưu log, không gửi notification
Sau khi tích điểm   → checkAndUpdateTier(totalVisits) → nâng tier nếu đủ ngưỡng
```

### redeemPoints()
```
totalPoints < cost → BusinessException
Ngược lại         → deductPointsFifo() → lưu log REDEEM (points âm)
```

### deductPointsFifo()
```
Query findActiveEarnPointsFifo → ORDER BY expiresAt ASC
Trừ lần lượt từ record sắp hết hạn nhất → đảm bảo điểm còn hạn dài không bị mất sớm
```

### Tier multiplier fallback (khi TierRules rỗng)
| Tier | Multiplier |
|------|-----------|
| MEMBER | ×1.0 |
| SILVER | ×1.10 |
| GOLD | ×1.25 |
| PLATINUM | ×1.50 |

---

## Test Cases

| # | Tên test | Mục tiêu | Kết quả |
|---|----------|----------|---------|
| 1 | `earnPoints_usesCustomPointsDirectlyWhenProvided` | `customPoints=15` → điểm = 15, không tính theo amountPaid | ✅ PASS |
| 2 | `earnPoints_appliesTierMultiplierFromFallbackWhenNoTierRulesConfigured` | SILVER, TierRules rỗng → multiplier 1.10, 50k → 5 điểm | ✅ PASS |
| 3 | `earnPoints_appliesTierMultiplierFromTierRuleWhenConfigured` | SILVER, TierRule multiplier=120 → 1.20 → 50k → 6 điểm | ✅ PASS |
| 4 | `earnPoints_returnsZeroAndSkipsLogWhenAmountIsTooSmall` | 500 VND → 0 điểm → không lưu log, không gửi notification | ✅ PASS |
| 5 | `earnPoints_upgradesTierAndSendsNotificationWhenVisitsCrossThreshold` | 9 visits + earn → 10 visits → MEMBER→SILVER, notification gửi | ✅ PASS |
| 6 | `redeemPoints_throwsWhenCustomerHasInsufficientBalance` | 50 điểm, redeem 100 → `BusinessException` | ✅ PASS |
| 7 | `redeemPoints_deductsCorrectlyAndLogsRedemption` | 200 điểm, redeem 80 → còn 120, log REDEEM points=-80 | ✅ PASS |
| 8 | `deductPointsFifo_consumesOldestExpiryRecordFirst` | Record A (3 tháng) trước Record B (9 tháng) → A bị trừ hết trước | ✅ PASS |

**Tổng: 8/8 PASS**

---

## Ghi chú kỹ thuật

- **`earnPoints_returnsZeroAndSkipsLogWhenAmountIsTooSmall`**: `verify(customerPointsRepository, never()).save(any())` — quan trọng để đảm bảo không có log "rác" với 0 điểm trong DB.
- **`TierRule.multiplier` lưu dạng 120** (không phải 1.20) → service chia 100 khi dùng. Test TC-3 verify logic này bằng TierRule override.
- **FIFO test** dùng `ArgumentCaptor` gián tiếp qua kiểm tra state của `earnRecord.getPoints()` sau khi gọi — phản ánh đúng side effect của `deductPointsFifo()`.
- **`checkAndUpdateTier` dùng `totalVisits` all-time** — đây là TODO đã ghi nhận (nên dùng 12 tháng gần nhất), nhưng test phải cover behavior hiện tại, không phải behavior tương lai.

---

## Liên kết

- [LoyaltyServiceTest.java](../backend/src/test/java/com/autowash/autowash_pro/service/LoyaltyServiceTest.java)
- [LoyaltyService.java](../backend/src/main/java/com/autowash/autowash_pro/service/LoyaltyService.java)
