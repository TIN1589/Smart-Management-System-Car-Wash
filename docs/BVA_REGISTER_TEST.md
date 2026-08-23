# BVA Test – Register: Full name và Password

**Người kiểm thử:** Nguyễn Thanh Thành Nhựt  
**Công cụ:** Postman  
**API:** POST /api/auth/register  

| Mã test | Dữ liệu biên | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| BVA-01 | fullName = 1 ký tự: `A` | 400 Bad Request | API trả lỗi họ tên phải từ 2–100 ký tự | Pass |
| BVA-02 | fullName = 2 ký tự: `An` | 201 Created | API đăng ký thành công | Pass |
| BVA-03 | fullName = 3 ký tự: `Anh` | 201 Created | API đăng ký thành công | Pass |
| BVA-04 | password = 5 ký tự: `12345` | 400 Bad Request | API trả lỗi mật khẩu ít nhất 6 ký tự | Pass |
| BVA-05 | password = 6 ký tự: `123456` | 201 Created | API đăng ký thành công | Pass |
| BVA-06 | password = 7 ký tự: `1234567` | 201 Created | API đăng ký thành công | Pass |

## Kết luận

Các giá trị biên dưới của trường họ tên và mật khẩu đã được kiểm thử.
Hệ thống từ chối dữ liệu dưới ngưỡng và chấp nhận dữ liệu tại/ngay trên ngưỡng hợp lệ.

**Ghi chú:** Password hiện chỉ có ràng buộc tối thiểu 6 ký tự nên không có giá trị biên trên để kiểm thử.