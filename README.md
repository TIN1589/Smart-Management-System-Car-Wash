# Super Java Project - Smart Car Wash System

Đồ án môn **Lập trình Java**.

## Cấu trúc dự án
- `FE-SmartWashCar`: Giao diện người dùng (Frontend)
- `Smart-Management-System-Car-Wash`: Hệ thống xử lý nghiệp vụ (Java Backend)
- `AutoWash_DB.session.sql`: Script khởi tạo cơ sở dữ liệu

## Hướng dẫn chạy dự án

### 1. Chạy Backend
- Di chuyển vào thư mục `backend`
- Chạy lệnh: `mvnw.cmd spring-boot:run` (Windows) hoặc `./mvnw spring-boot:run` (Mac/Linux)
- Backend chạy tại: http://localhost:8080

### 2. Chạy Frontend
- Di chuyển vào thư mục `frontend`
- Chạy lệnh: `npm install` (chỉ lần đầu)
- Chạy lệnh: `npm run dev`
- Frontend chạy tại: http://localhost:5173

### 3. Tài khoản test
- **Admin**: admin@autowash.com / Admin@123456
- **Member/Customer**: (0909123456 / 123456)

### 4. Các chức năng chính của hệ thống
- Đăng ký / Đăng nhập / Phân quyền theo role (Admin, Member)
- Quản lý dịch vụ rửa xe (CRUD)
- Đặt lịch rửa xe, xem lịch, hủy lịch
- Quản lý lịch đặt dành cho Admin (xem danh sách, cập nhật trạng thái)
- Dashboard Admin
- Tích điểm và hạng thành viên
- Các API tương ứng đã được kiểm thử trên Postman

### 5. Ghi chú
Hệ thống đã được kiểm tra lại toàn bộ các chức năng chính trước khi nộp bài.