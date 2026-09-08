# SCRUM-61 — Báo cáo thực thi: Booking, Loyalty & Promotion APIs

**Nhánh:** `test/SCRUM-61-loyalty-admin-api-test-cases`  
**Ngày:** 2026-09-08

---

## Tổng quan

SCRUM-61 là bước xác nhận cuối — chạy toàn bộ test suite sau khi các SCRUM-40→49 hoàn thành, đảm bảo tất cả test cases không conflict với nhau khi chạy cùng môi trường.

---

## Kết quả thực thi (chạy trên nhánh SCRUM-61)

```
Tests run: 39, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## Bảng tổng hợp

| SCRUM | Test class | Cases | PASS |
|-------|-----------|-------|------|
| 40 | `BookingCreationServiceTest` | 5 | ✅ 5 |
| 41 | `BookingAvailabilityCancellationTest` | 7 | ✅ 7 |
| 43 | `BookingBusinessRulesTest` | 11 | ✅ 11 |
| 47 | `LoyaltyServiceTest` | 8 | ✅ 8 |
| 49 | `PromotionValidationTest` | 8 | ✅ 8 |
| **Tổng** | | **39** | **✅ 39** |

---

## Chi tiết SCRUM-40 — Booking Creation (5/5)

| Test | Kết quả |
|------|---------|
| `createBooking_chargesFullServicePriceWhenNoDiscounts` | ✅ |
| `createBooking_appliesPercentagePromoAndIncrementsUsageCount` | ✅ |
| `createBooking_deductsLoyaltyPointsViaFifoAndLogsRedemption` | ✅ |
| `createBooking_rejectsRequestWhenNoneOfTheServiceIdsExist` | ✅ |
| `createBooking_rejectsRequestWhenSlotHasReachedCapacity` | ✅ |

## Chi tiết SCRUM-41 — Availability & Cancellation (7/7)

| Test | Kết quả |
|------|---------|
| `getAvailability_returnsSlotAsUnavailableWhenAtFullCapacity` | ✅ |
| `getAvailability_marksSlotAsAvailableWhenCapacityHasRoom` | ✅ |
| `cancelBooking_refundsPointsAndTransitionsStatusToCancelled` | ✅ |
| `cancelBooking_throwsWhenTryingToCancelACompletedBooking` | ✅ |
| `cancelBooking_throwsWhenCustomerAttemptsToAccessAnotherCustomersBooking` | ✅ |
| `cancelBooking_allowsAdminToForceCancel_evenWhenInProgress` | ✅ |
| `cancelBooking_isIdempotentWhenBookingIsAlreadyCancelled` | ✅ |

## Chi tiết SCRUM-43 — Business Rules (11/11)

| Test | Kết quả |
|------|---------|
| `createBooking_rejectsSlotAtOddMinuteMark` | ✅ |
| `createBooking_rejectsSlotBeforeOpeningHour` | ✅ |
| `createBooking_rejectsSlotAfterClosingHour` | ✅ |
| `createBooking_rejectsSlotWithLessThan30MinutesNotice` | ✅ |
| `createBooking_rejectsMemberBookingBeyond7DayWindow` | ✅ |
| `updateStatus_rejectsInvalidTransition_pendingToDone` | ✅ |
| `updateStatus_rejectsInvalidTransition_confirmedToDone` | ✅ |
| `updateStatus_rejectsAnyTransitionFromTerminalStatus` | ✅ |
| `updateStatus_allowsValidTransition_pendingToConfirmed` | ✅ |
| `updateStatus_allowsValidTransition_confirmedToInProgress` | ✅ |
| `updateStatus_allowsValidTransition_inProgressToDone` | ✅ |

## Chi tiết SCRUM-47 — Point Usage & Refund (8/8)

| Test | Kết quả |
|------|---------|
| `earnPoints_usesCustomPointsDirectlyWhenProvided` | ✅ |
| `earnPoints_appliesTierMultiplierFromFallbackWhenNoTierRulesConfigured` | ✅ |
| `earnPoints_appliesTierMultiplierFromTierRuleWhenConfigured` | ✅ |
| `earnPoints_returnsZeroAndSkipsLogWhenAmountIsTooSmall` | ✅ |
| `earnPoints_upgradesTierAndSendsNotificationWhenVisitsCrossThreshold` | ✅ |
| `redeemPoints_throwsWhenCustomerHasInsufficientBalance` | ✅ |
| `redeemPoints_deductsCorrectlyAndLogsRedemption` | ✅ |
| `deductPointsFifo_consumesOldestExpiryRecordFirst` | ✅ |

## Chi tiết SCRUM-49 — Promotion Validation (8/8)

| Test | Kết quả |
|------|---------|
| `createBooking_rejectsPromoWhenCustomerTierIsBelowMinimumRequired` | ✅ |
| `createBooking_allowsPromoWhenCustomerTierMeetsMinimumRequired` | ✅ |
| `createBooking_allowsPromoWhenTargetTiersIsEmptyMeaningOpenToAll` | ✅ |
| `createBooking_rejectsPromoThatHasExpired` | ✅ |
| `createBooking_rejectsPromoWhenUsageLimitIsReached` | ✅ |
| `createBooking_rejectsPromoWhenCustomerHasAlreadyUsedIt` | ✅ |
| `createBooking_capsPercentageDiscountAtMaxDiscount` | ✅ |
| `createBooking_appliesFixedAmountDiscountWhenPromoValueExceeds100` | ✅ |

---

## Lệnh tái hiện

```bash
cd backend
./mvnw test -Dtest="BookingCreationServiceTest,BookingAvailabilityCancellationTest,BookingBusinessRulesTest,LoyaltyServiceTest,PromotionValidationTest" -q
```

---

## Liên kết evidence từng SCRUM

| SCRUM | Evidence |
|-------|---------|
| 40 | [BOOKING_CREATION_API_TEST_CASES.md](BOOKING_CREATION_API_TEST_CASES.md) |
| 41 | [BOOKING_AVAILABILITY_CANCELLATION_TEST_CASES.md](BOOKING_AVAILABILITY_CANCELLATION_TEST_CASES.md) |
| 43 | [BOOKING_BUSINESS_RULES_TEST_CASES.md](BOOKING_BUSINESS_RULES_TEST_CASES.md) |
| 47 | [LOYALTY_POINT_TEST_CASES.md](LOYALTY_POINT_TEST_CASES.md) |
| 49 | [PROMOTION_VALIDATION_TEST_CASES.md](PROMOTION_VALIDATION_TEST_CASES.md) |
