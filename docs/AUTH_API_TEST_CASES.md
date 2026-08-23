# Test Case API Authentication

- Dự án: AutoWash Pro
- Công cụ kiểm thử: Postman
- Người kiểm thử: Nguyễn Thanh Thành Nhựt
- API Base URL: `http://localhost:8080/api`

| Mã test | API | Mục tiêu kiểm thử | Dữ liệu kiểm thử | Kết quả mong đợi | Actual Result | Trạng thái |
|---|---|---|---|---|---|---|
| AUTH-01 | POST `/auth/register` | Đăng ký hợp lệ | Họ tên, phone, email và password hợp lệ, chưa tồn tại | `201 Created`, trả accessToken và refreshToken | Chưa chạy | Chưa chạy |
| AUTH-02 | POST `/auth/register` | Thiếu số điện thoại | Không gửi trường `phone` | `400 Bad Request`, thông báo số điện thoại không được để trống | Chưa chạy | Chưa chạy |
| AUTH-03 | POST `/auth/register` | Trùng số điện thoại | Phone đã tồn tại | `400 Bad Request`, báo số điện thoại đã được đăng ký | Chưa chạy | Chưa chạy |
| AUTH-04 | POST `/auth/register` | Trùng email khác hoa/thường | Email đã tồn tại nhưng đổi chữ hoa/thường | `400 Bad Request`, báo email đã được sử dụng | Chưa chạy | Chưa chạy |
| AUTH-05 | POST `/auth/login` | Đăng nhập hợp lệ bằng số điện thoại | Phone và password đúng | `200 OK`, trả accessToken và refreshToken | Chưa chạy | Chưa chạy |
| AUTH-06 | POST `/auth/login` | Thiếu mật khẩu | Chỉ gửi emailOrPhone | `400 Bad Request`, báo mật khẩu không được để trống | Chưa chạy | Chưa chạy |
| AUTH-07 | POST `/auth/login` | Sai mật khẩu | Phone/email đúng, password sai | `400 Bad Request`, báo thông tin đăng nhập không đúng | Chưa chạy | Chưa chạy |
| AUTH-08 | POST `/auth/login` | Email không phân biệt hoa/thường | Email hợp lệ viết in hoa và password đúng | `200 OK`, đăng nhập thành công | Chưa chạy | Chưa chạy |

## Ghi chú

- Không lưu mật khẩu thật hoặc JWT token vào GitHub.
- Sau mỗi lần chạy Postman, cập nhật cột Actual Result và Trạng thái.
- Nếu Actual Result khác Expected Result, tạo Jira Bug và đính kèm ảnh Postman.