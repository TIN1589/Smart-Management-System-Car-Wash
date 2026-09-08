# SCRUM-61 — Báo cáo thực thi: Booking, Loyalty & Promotion APIs

**Nhánh:** `test/SCRUM-61-loyalty-admin-api-test-cases`  
**Ngày:** 2026-09-08

---

## Tổng quan

SCRUM-61 là bước xác nhận cuối — chạy toàn bộ test suite sau khi các SCRUM-40 đến SCRUM-49 hoàn thành, đảm bảo tất cả test cases không conflict với nhau khi chạy cùng môi trường.

---

## Kết quả thực thi (chạy trên nhánh SCRUM-61)

```
Tests run: 39, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## Bảng tổng hợp

| SCRUM | Test class | Cases | Kết quả |
|-------|-----------|-------|---------|
| 40 | `BookingCreationServiceTest` | 5 | PASS (5/5) |
| 41 | `BookingAvailabilityCancellationTest` | 7 | PASS (7/7) |
| 43 | `BookingBusinessRulesTest` | 11 | PASS (11/11) |
| 47 | `LoyaltyServiceTest` | 8 | PASS (8/8) |
| 49 | `PromotionValidationTest` | 8 | PASS (8/8) |
| **Tổng** | | **39** | **PASS (39/39)** |

---

## Chi tiết SCRUM-40 — Booking Creation (5/5)

| Test | Kết quả |
|------|---------|
| `createBooking_chargesFullServicePriceWhenNoDiscounts` | PASS |
| `createBooking_appliesPercentagePromoAndIncrementsUsageCount` | PASS |
| `createBooking_deductsLoyaltyPointsViaFifoAndLogsRedemption` | PASS |
| `createBooking_rejectsRequestWhenNoneOfTheServiceIdsExist` | PASS |
| `createBooking_rejectsRequestWhenSlotHasReachedCapacity` | PASS |

## Chi tiết SCRUM-41 — Availability & Cancellation (7/7)

| Test | Kết quả |
|------|---------|
| `getAvailability_returnsSlotAsUnavailableWhenAtFullCapacity` | PASS |
| `getAvailability_marksSlotAsAvailableWhenCapacityHasRoom` | PASS |
| `cancelBooking_refundsPointsAndTransitionsStatusToCancelled` | PASS |
| `cancelBooking_throwsWhenTryingToCancelACompletedBooking` | PASS |
| `cancelBooking_throwsWhenCustomerAttemptsToAccessAnotherCustomersBooking` | PASS |
| `cancelBooking_allowsAdminToForceCancel_evenWhenInProgress` | PASS |
| `cancelBooking_isIdempotentWhenBookingIsAlreadyCancelled` | PASS |

## Chi tiết SCRUM-43 — Business Rules (11/11)

| Test | Kết quả |
|------|---------|
| `createBooking_rejectsSlotAtOddMinuteMark` | PASS |
| `createBooking_rejectsSlotBeforeOpeningHour` | PASS |
| `createBooking_rejectsSlotAfterClosingHour` | PASS |
| `createBooking_rejectsSlotWithLessThan30MinutesNotice` | PASS |
| `createBooking_rejectsMemberBookingBeyond7DayWindow` | PASS |
| `updateStatus_rejectsInvalidTransition_pendingToDone` | PASS |
| `updateStatus_rejectsInvalidTransition_confirmedToDone` | PASS |
| `updateStatus_rejectsAnyTransitionFromTerminalStatus` | PASS |
| `updateStatus_allowsValidTransition_pendingToConfirmed` | PASS |
| `updateStatus_allowsValidTransition_confirmedToInProgress` | PASS |
| `updateStatus_allowsValidTransition_inProgressToDone` | PASS |

## Chi tiết SCRUM-47 — Point Usage & Refund (8/8)

| Test | Kết quả |
|------|---------|
| `earnPoints_usesCustomPointsDirectlyWhenProvided` | PASS |
| `earnPoints_appliesTierMultiplierFromFallbackWhenNoTierRulesConfigured` | PASS |
| `earnPoints_appliesTierMultiplierFromTierRuleWhenConfigured` | PASS |
| `earnPoints_returnsZeroAndSkipsLogWhenAmountIsTooSmall` | PASS |
| `earnPoints_upgradesTierAndSendsNotificationWhenVisitsCrossThreshold` | PASS |
| `redeemPoints_throwsWhenCustomerHasInsufficientBalance` | PASS |
| `redeemPoints_deductsCorrectlyAndLogsRedemption` | PASS |
| `deductPointsFifo_consumesOldestExpiryRecordFirst` | PASS |

## Chi tiết SCRUM-49 — Promotion Validation (8/8)

| Test | Kết quả |
|------|---------|
| `createBooking_rejectsPromoWhenCustomerTierIsBelowMinimumRequired` | PASS |
| `createBooking_allowsPromoWhenCustomerTierMeetsMinimumRequired` | PASS |
| `createBooking_allowsPromoWhenTargetTiersIsEmptyMeaningOpenToAll` | PASS |
| `createBooking_rejectsPromoThatHasExpired` | PASS |
| `createBooking_rejectsPromoWhenUsageLimitIsReached` | PASS |
| `createBooking_rejectsPromoWhenCustomerHasAlreadyUsedIt` | PASS |
| `createBooking_capsPercentageDiscountAtMaxDiscount` | PASS |
| `createBooking_appliesFixedAmountDiscountWhenPromoValueExceeds100` | PASS |

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
