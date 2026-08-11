# API Routes của Autowash Pro

Tài liệu này liệt kê các route chính của ứng dụng, mô tả chức năng, dữ liệu gửi lên và dữ liệu trả về.

---

## 1. Auth

### POST /api/auth/register

- Chức năng: đăng ký tài khoản mới.
- Input (JSON):
  - `fullName` (String, required): tên đầy đủ.
  - `phone` (String, required): số điện thoại hợp lệ (0|+84).
  - `email` (String, optional): email.
  - `password` (String, required): mật khẩu ít nhất 6 ký tự.
- Output (JSON): `AuthResponse` chứa thông tin token.

### POST /api/auth/login

- Chức năng: đăng nhập bằng số điện thoại và mật khẩu.
- Input (JSON):
  - `phone` (String, required)
  - `password` (String, required)
- Output (JSON): `AuthResponse` chứa token.

### POST /api/auth/refresh

- Chức năng: lấy access token mới bằng refresh token.
- Input (JSON):
  - `refreshToken` (String, required)
- Output (JSON): `AuthResponse` chứa token mới.

---

## 2. Customer Admin (Quản lý khách hàng tại quầy)

> Những route này được phép truy cập không cần token vì admin quản lý khách hàng tại quầy.

### GET /api/admin/customers

- Chức năng: lấy danh sách khách hàng.
- Output (JSON): danh sách `Customer`.

### POST /api/admin/customers

- Chức năng: thêm khách hàng mới tại quầy.
- Input (JSON): `CustomerRequestDTO` (dữ liệu khách hàng).
- Output (JSON): `Customer` vừa tạo hoặc lỗi.

### GET /api/admin/customers/{id}

- Chức năng: lấy chi tiết khách hàng theo `id`.
- Output (JSON): `Customer`.

### PUT /api/admin/customers/{id}

- Chức năng: cập nhật thông tin khách hàng.
- Input (JSON): `CustomerRequestDTO`.
- Output (JSON): `Customer` đã cập nhật.

### DELETE /api/admin/customers/{id}

- Chức năng: vô hiệu hóa khách hàng.
- Output (JSON): thông báo thành công.

### GET /api/admin/customers/{id}/vehicles

- Chức năng: lấy xe của khách hàng.
- Output (JSON): danh sách `Vehicle`.

### GET /api/admin/customers/{id}/history

- Chức năng: lấy lịch sử booking của khách hàng.
- Output (JSON): danh sách `Booking`.

---

## 3. Vehicles

### GET /api/vehicles

- Chức năng: lấy danh sách xe của tài khoản đăng nhập.
- Output (JSON): danh sách `VehicleResponse`.

### POST /api/vehicles

- Chức năng: thêm xe mới cho tài khoản đăng nhập.
- Input (JSON): `VehicleRequest`
  - `licensePlate` (String, required)
  - `vehicleType` (String, required)
  - `brand` (String, optional)
  - `color` (String, optional)
  - `primary` (Boolean, optional)
- Output (JSON): `VehicleResponse`.

### PUT /api/vehicles/{vehicleId}

- Chức năng: cập nhật xe.
- Input (JSON): `VehicleRequest`.
- Output (JSON): `VehicleResponse`.

### PATCH /api/vehicles/{vehicleId}/primary

- Chức năng: đặt xe hiện tại làm xe mặc định.
- Output (JSON): `VehicleResponse`.

### DELETE /api/vehicles/{vehicleId}

- Chức năng: xóa xe.
- Output: HTTP 204 No Content.

---

## 4. Booking

### POST /api/bookings

- Chức năng: tạo lịch rửa xe cho khách hàng hiện tại.
- Input (JSON): `CreateBookingRequest`
  - `vehicleId` (UUID, required)
  - `scheduledAt` (LocalDateTime, required, phải tương lai)
  - `serviceType` (enum, required)
  - `notes` (String, optional)
- Output (JSON): `BookingResponse`.

### GET /api/bookings

- Chức năng: lấy danh sách booking của khách hàng hiện tại.
- Output (JSON): danh sách `BookingResponse`.

### GET /api/bookings/{bookingId}

- Chức năng: lấy chi tiết một booking.
- Output (JSON): `BookingResponse`.

### GET /api/bookings/availability

- Chức năng: kiểm tra slot rửa xe còn trống theo ngày.
- Query:
  - `date` (yyyy-MM-dd, required)
- Output (JSON): danh sách `AvailabilitySlotResponse`.

### PATCH /api/bookings/{bookingId}/cancel

- Chức năng: hủy booking.
- Output (JSON): `BookingResponse` trạng thái đã hủy.

### GET /api/admin/bookings

- Chức năng: admin xem booking theo ngày hoặc trạng thái.
- Query:
  - `status` (BookingStatus, optional)
  - `date` (yyyy-MM-dd, optional)
- Output (JSON): danh sách `BookingResponse`.

### PATCH /api/admin/bookings/{bookingId}/status

- Chức năng: admin cập nhật trạng thái booking.
- Input (JSON): `UpdateBookingStatusRequest`
  - `status` (BookingStatus, required)
- Output (JSON): `BookingResponse`.

---

## 5. Loyalty

### POST /api/loyalty/earn

- Chức năng: tích điểm sau khi rửa xe xong (admin trigger).
- Input (JSON): `EarnPointsRequest`
  - `customerId` (UUID, required)
  - `amountPaid` (BigDecimal, required)
  - `washId` (UUID, required)
- Output (JSON): `EarnPointsResponse`.

### POST /api/loyalty/redeem

- Chức năng: đổi điểm lấy thưởng.
- Input (JSON): `RedeemPointsRequest`
  - `customerId` (UUID, required)
  - `redeemType` (enum, required)
  - `referenceId` (UUID, required)
- Output (JSON): `RedeemPointsResponse`.

### GET /api/loyalty/balance/{customerId}

- Chức năng: xem số dư điểm và điểm sắp hết hạn.
- Output (JSON): `PointBalanceResponse`.

### POST /api/loyalty/tier-review

- Chức năng: trigger rà soát tier thủ công.
- Output (JSON): `{ "message": "Rà soát tier hoàn thành" }`.

### GET /api/customers/{customerId}/points

- Chức năng: xem lịch sử giao dịch điểm.
- Query:
  - `page` (int, optional)
  - `size` (int, optional)
  - `sort` (String, optional)
- Output (JSON): `Page<PointHistoryResponse>`.

---

## Ghi chú chung

- Hầu hết route yêu cầu `Authorization: Bearer <token>` trừ các route `/api/auth/**` và `/api/admin/customers/**`.
- CORS được cấu hình cho `/api/**` với origin `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:5173`.
- Route `/api/admin/customers/**` hiện được phép truy cập công khai trong cấu hình security.
