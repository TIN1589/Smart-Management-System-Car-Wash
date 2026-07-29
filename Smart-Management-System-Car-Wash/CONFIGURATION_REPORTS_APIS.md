# Tài liệu Đặc tả API: Cấu hình hệ thống & Báo cáo Admin

Tài liệu này đặc tả các endpoint API cần thiết trên Backend (Spring Boot/Java) để phục vụ cho các trang Cấu hình và Báo cáo của phân hệ Admin trên Frontend.

---

## 1. API Cấu hình hệ thống (System Configuration)

### 1.1 Lấy toàn bộ cấu hình hệ thống
* **Endpoint**: `GET /api/admin/config`
* **Quyền truy cập**: Admin
* **Mô tả**: Trả về cấu hình hiện tại của hệ thống bao gồm tỷ lệ tích điểm và quy tắc phân hạng.
* **Phản hồi mẫu (200 OK)**:
```json
{
  "pointRate": "10.000",
  "tierRules": [
    {
      "tier": "member",
      "label": "MEMBER",
      "name": "Cấu hình mặc định",
      "threshold": 0,
      "bookingWindow": 3,
      "multiplier": 100,
      "perks": "Thành viên mới đăng ký. Tích điểm cơ bản cho mỗi dịch vụ.",
      "className": "bg-tier-member"
    },
    {
      "tier": "silver",
      "label": "SILVER",
      "name": "Hạng Bạc",
      "threshold": 5,
      "bookingWindow": 7,
      "multiplier": 110,
      "perks": "Giảm giá 5% cho các dịch vụ rửa xe cao cấp. Ưu tiên đặt lịch trước 7 ngày.",
      "className": "bg-tier-silver"
    },
    {
      "tier": "gold",
      "label": "GOLD",
      "name": "Hạng Vàng",
      "threshold": 15,
      "bookingWindow": 14,
      "multiplier": 125,
      "perks": "Miễn phí dịch vụ hút bụi. Giảm giá 10% các gói Detail. Ưu tiên hàng chờ cao.",
      "className": "bg-tier-gold"
    },
    {
      "tier": "platinum",
      "label": "PLATINUM",
      "name": "Hạng Bạch Kim",
      "threshold": 30,
      "bookingWindow": 30,
      "multiplier": 150,
      "perks": "Chăm sóc đặc biệt. Miễn phí nâng cấp gói rửa. Quà tặng sinh nhật trị giá 500k.",
      "className": "bg-tier-platinum"
    }
  ]
}
```

### 1.2 Lưu cập nhật cấu hình hệ thống
* **Endpoint**: `PUT /api/admin/config`
* **Quyền truy cập**: Admin
* **Mô tả**: Lưu thông tin cập nhật tỷ lệ tích điểm và các quy tắc phân hạng thành viên.
* **Yêu cầu (Body JSON)**:
```json
{
  "pointRate": "10.000",
  "tierRules": [
    {
      "tier": "member",
      "threshold": 0,
      "bookingWindow": 3,
      "multiplier": 100,
      "perks": "..."
    }
    // Gửi đủ mảng 4 hạng thẻ
  ]
}
```
* **Phản hồi mẫu (200 OK)**:
```json
{
  "status": "SUCCESS",
  "message": "Cấu hình hệ thống đã được cập nhật thành công!"
}
```

---

## 2. API Danh mục phần thưởng (Reward Catalog)

### 2.1 Lấy danh sách phần thưởng
* **Endpoint**: `GET /api/admin/config/rewards`
* **Quyền truy cập**: Admin / User
* **Mô tả**: Trả về danh sách tất cả các gói quà tặng/voucher quy đổi điểm hiện có.
* **Phản hồi mẫu (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Voucher Rửa xe 0đ",
    "points": "500",
    "minimumTier": "SILVER",
    "tierClassName": "bg-tier-silver"
  },
  {
    "id": 2,
    "name": "Nước hoa xe hơi cao cấp",
    "points": "1.200",
    "minimumTier": "GOLD",
    "tierClassName": "bg-tier-gold"
  }
]
```

### 2.2 Thêm phần thưởng mới
* **Endpoint**: `POST /api/admin/config/rewards`
* **Quyền truy cập**: Admin
* **Mô tả**: Thêm một phần thưởng mới vào danh mục đổi quà.
* **Yêu cầu (Body JSON)**:
```json
{
  "name": "Gói Phủ Ceramic 3M",
  "points": "5.000",
  "minimumTier": "PLATINUM",
  "tierClassName": "bg-tier-platinum"
}
```
* **Phản hồi mẫu (201 Created)**:
```json
{
  "id": 3,
  "name": "Gói Phủ Ceramic 3M",
  "points": "5.000",
  "minimumTier": "PLATINUM",
  "tierClassName": "bg-tier-platinum"
}
```

### 2.3 Xóa phần thưởng
* **Endpoint**: `DELETE /api/admin/config/rewards/{id}`
* **Quyền truy cập**: Admin
* **Mô tả**: Xóa phần thưởng khỏi danh mục đổi quà.
* **Phản hồi mẫu (200 OK hoặc 204 No Content)**:
```json
{
  "message": "Đã xóa phần thưởng thành công!"
}
```

---

## 3. API Báo cáo & Thống kê (Reports & Analytics)

### 3.1 Báo cáo doanh thu nâng cao
* **Endpoint**: `GET /api/admin/reports/revenue`
* **Quyền truy cập**: Admin
* **Mô tả**: Lấy dữ liệu phân tích doanh thu chi tiết lọc theo khoảng thời gian và độ chia nhỏ (ngày, tuần, tháng).
* **Tham số truy vấn (Query Params)**:
  * `granularity` (String): `day` | `week` | `month` (Mặc định: `day`)
  * `startDate` (String, format yyyy-MM-dd): Ngày bắt đầu
  * `endDate` (String, format yyyy-MM-dd): Ngày kết thúc
* **Phản hồi mẫu (200 OK)**:
```json
{
  "totalRevenue": 24500000,
  "avgRevenuePerDay": 816666,
  "totalWashes": 98,
  "avgRevenuePerWash": 250000,
  "washBreakdown": {
    "motorbike": 58,
    "car": 40
  },
  "serviceRevenueBreakdown": {
    "basicWashPercent": 40,
    "premiumWashPercent": 35,
    "fullDetailPercent": 25
  },
  "chartData": [
    { "date": "15/10", "revenue": 3200000 },
    { "date": "16/10", "revenue": 4500000 },
    { "date": "17/10", "revenue": 1200000 }
  ],
  "topDays": [
    { "date": "16/10/2023", "revenue": 4500000, "washes": 18, "avg": "250.000đ", "growth": "+12.5%" },
    { "date": "15/10/2023", "revenue": 3200000, "washes": 12, "avg": "266.666đ", "growth": "+8.0%" }
  ]
}
```

### 3.2 Báo cáo khách hàng & Tăng trưởng
* **Endpoint**: `GET /api/admin/reports/customers`
* **Quyền truy cập**: Admin
* **Mô tả**: Lấy dữ liệu phân tích tăng trưởng khách hàng và phân bố hạng thành viên.
* **Tham số truy vấn (Query Params)**:
  * `startDate` (String, format yyyy-MM-dd): Ngày bắt đầu
  * `endDate` (String, format yyyy-MM-dd): Ngày kết thúc
* **Phản hồi mẫu (200 OK)**:
```json
{
  "totalCustomers": 1250,
  "newCustomersThisMonth": 48,
  "activeCustomers": 850,
  "issuedPoints": 15600,
  "tierDistribution": {
    "memberPercent": 50,
    "silverPercent": 25,
    "goldPercent": 15,
    "platinumPercent": 10
  },
  "growthChartData": [
    { "date": "15/10", "newCustomers": 4 },
    { "date": "16/10", "newCustomers": 8 },
    { "date": "17/10", "newCustomers": 3 }
  ]
}
```
