# Test Evidence – Authentication API

**Người kiểm thử:** Nguyễn Thanh Thành Nhựt  
**Công cụ:** Postman  
**Backend:** http://localhost:8080/api  
**Ngày kiểm thử:** 23/08/2026  

| Mã test | Chức năng kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| AUTH-01 | Đăng ký hợp lệ | 201 Created, trả token | API trả 201 Created và accessToken, refreshToken | Pass |
| AUTH-02 | Đăng ký thiếu số điện thoại | 400 Bad Request, báo thiếu phone | API trả 400 và `phone: Số điện thoại không được để trống` | Pass |
| AUTH-03 | Đăng ký trùng số điện thoại | 400 Bad Request, báo số điện thoại đã đăng ký | API trả 400 và thông báo số điện thoại đã được đăng ký | Pass |
| AUTH-04 | Đăng ký email trùng khác chữ hoa/thường | 400 Bad Request, báo email đã sử dụng | API chuẩn hóa email và trả 400 `Email đã được sử dụng` | Pass |
| AUTH-05 | Đăng nhập bằng số điện thoại hợp lệ | 200 OK, trả token | API trả 200 OK và token | Pass |
| AUTH-06 | Đăng nhập thiếu mật khẩu | 400 Bad Request, báo thiếu password | API trả 400 Validation Error | Pass |
| AUTH-07 | Đăng nhập sai mật khẩu | 400 Bad Request | API trả 400 Business Error | Pass |
| AUTH-08 | Đăng nhập bằng email viết hoa | 200 OK | API chuẩn hóa email và đăng nhập thành công | Pass |

## Kết luận

Các chức năng Đăng ký và Đăng nhập đã được kiểm thử bằng Postman.
Các trường hợp hợp lệ và không hợp lệ đều trả về đúng mã HTTP cùng thông báo lỗi phù hợp.