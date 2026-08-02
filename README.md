# AutoWash Pro - Smart Management System Car Wash

[![Backend CI](https://github.com/TIN1589/Smart-Management-System-Car-Wash/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/TIN1589/Smart-Management-System-Car-Wash/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/TIN1589/Smart-Management-System-Car-Wash/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/TIN1589/Smart-Management-System-Car-Wash/actions/workflows/frontend-ci.yml)

**AutoWash Pro** là hệ thống quản lý tiệm rửa xe máy thông minh, tập trung vào chăm sóc khách hàng (CRM) và tích điểm thành viên (Loyalty). Hệ thống cung cấp trải nghiệm hoàn chỉnh từ việc đặt lịch online của khách hàng đến quản lý hàng đợi, cấu hình thăng hạng, và áp dụng khuyến mãi của Admin.

---

## Kiến Trúc Hệ Thống (Architecture)

Dự án được chia thành 2 phần chính với kiến trúc độc lập (Tách biệt Backend và Frontend):

### 1. 🖥️ Backend
- **Công nghệ chính:** Java 21, Spring Boot 3.3.x, PostgreSQL, Redis, WebSocket, Flyway.
- **Vai trò:** Xử lý nghiệp vụ lõi (đặt lịch, tích điểm, phân quyền), cung cấp RESTful APIs và Realtime data qua STOMP.
- 🔗 **[Xem chi tiết hướng dẫn cài đặt & tài liệu Backend](./backend/README.md)**

### 2. Frontend
- **Công nghệ chính:** React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, Framer Motion.
- **Vai trò:** Giao diện Client Dashboard cho khách hàng (đặt lịch, xem điểm) và Admin Dashboard (cấu hình, quản lý dịch vụ).
- 🔗 **[Xem chi tiết hướng dẫn cài đặt & tài liệu Frontend](./frontend/README.md)**

---

## Tính Năng Nổi Bật

- **Tích điểm & Thăng hạng tự động:** Cấu hình động tỷ lệ tích điểm, hoàn điểm tự động khi hủy lịch, tự động lên/xuống hạng dựa trên lượt rửa.
- **Quản lý Đặt lịch (Booking):** Giới hạn ngày đặt trước theo Rank thành viên, tự động tính điểm ưu tiên xếp hàng.
- **Quản lý Khách hàng & Xe:** Liên kết 1 khách hàng - nhiều xe, ghi nhận lịch sử biến động điểm chi tiết.
- **Mã khuyến mãi & Quà tặng:** Áp dụng mã giảm giá theo cấp bậc (Rank).

---

## 🛠 Hướng Dẫn Nhanh (Quick Setup)

**Yêu cầu cơ bản:**
- Java 21 & Node.js 18+
- PostgreSQL & Redis (Có thể dùng Docker)

**Khởi chạy Backend:**
```bash
cd backend
# Cấu hình application-dev.yml với thông tin DB của bạn
./mvnw spring-boot:run
```

**Khởi chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
```

*Truy cập Frontend tại: `http://localhost:5173` | Swagger UI Backend tại: `http://localhost:8080/swagger-ui/index.html`*
