# Hướng dẫn thiết lập môi trường phát triển

## Yêu cầu cài đặt

- Git
- Java JDK 21
- Node.js 18 trở lên
- PostgreSQL hoặc cấu hình kết nối Supabase hợp lệ

## Chạy Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend chạy tại:

```text
http://localhost:8080
```

## Chạy Frontend

Mở Terminal khác tại thư mục gốc dự án:

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## Lưu ý

- Không commit file `.env`, mật khẩu database hoặc JWT token.
- Cần chạy Backend và Frontend để kiểm tra hệ thống.