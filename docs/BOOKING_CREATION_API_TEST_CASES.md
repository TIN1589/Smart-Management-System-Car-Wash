# SCRUM-40 — Booking Creation API: Test Cases

**Endpoint:** `POST /api/bookings`  
**Service:** `BookingService.createBooking()`  
**Test class:** `BookingCreationServiceTest.java`  
**Nhánh:** `test/SCRUM-40-booking-creation-api`  
**Ngày:** 2026-09-08

---

## Phạm vi kiểm thử

Kiểm chứng logic tính tiền và validation khi tạo booking. Không test layer HTTP — controller được kiểm tra tách biệt nếu cần.

**Công thức tính tiền:**
```
finalAmount = Σ(service.basePrice) − promoDiscount − (usedPoints × 100 VND)
```

---

## Test Cases

| # | Tên test | Điều kiện đầu vào | Kết quả kỳ vọng | Kết quả thực tế |
|---|----------|-------------------|-----------------|-----------------|
| 1 | `createBooking_chargesFullServicePriceWhenNoDiscounts` | 1 service 50k, không promo, không điểm | totalAmount=50,000, status=PENDING | PASS |
| 2 | `createBooking_appliesPercentagePromoAndIncrementsUsageCount` | Promo 20%, không maxDiscount, mở tất cả tier | discount=10,000, total=40,000, usageCount+1 | PASS |
| 3 | `createBooking_deductsLoyaltyPointsViaFifoAndLogsRedemption` | usedPoints=100 (customer có 200 điểm) | total=40,000, `deductPointsFifo` gọi đúng, log REDEEM được lưu | PASS |
| 4 | `createBooking_rejectsRequestWhenNoneOfTheServiceIdsExist` | serviceIds chứa UUID không tồn tại trong DB | `BusinessException`, `bookingRepository.save` không được gọi | PASS |
| 5 | `createBooking_rejectsRequestWhenSlotHasReachedCapacity` | slot có 2 booking active (SLOT_CAPACITY=2) | `BusinessException`, booking không được tạo | PASS |

**Tổng: 5/5 PASS**

---

## Ghi chú kỹ thuật

- Test dùng Mockito strict mode — phát hiện stub thừa ngay khi chạy.
- TC-5: `validateSchedulableSlot` kiểm tra capacity **trước** khi load services, nên stub `washServiceRepository` được khai báo `lenient()` để tránh `UnnecessaryStubbing` error.
- `bookingWashServiceRepository.save()` được mock trả về chính argument đầu vào (`thenAnswer(inv -> inv.getArgument(0))`) vì service gọi save cho từng `BookingWashService` trong vòng lặp, sau đó gán list kết quả vào booking.

---

## Liên kết

- [BookingCreationServiceTest.java](../backend/src/test/java/com/autowash/autowash_pro/service/BookingCreationServiceTest.java)
- [BookingService.java — createBooking()](../backend/src/main/java/com/autowash/autowash_pro/service/BookingService.java)
