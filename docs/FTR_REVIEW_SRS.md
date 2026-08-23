# Biên bản rà soát SRS theo FTR

## Thông tin rà soát

- Dự án: AutoWash Pro
- Tài liệu được rà soát: SRS_AutoWash_Pro.docx
- Hình thức: Formal Technical Review (FTR)
- Người rà soát: Nguyễn Thanh Thành Nhựt
- Mục tiêu: Kiểm tra tính đầy đủ, rõ ràng và khả năng kiểm thử của các yêu cầu SRS.

## Nội dung đã rà soát

| Mã | Hạng mục | Kết quả |
|---|---|---|
| FTR-01 | Yêu cầu đăng ký tài khoản | Đạt – có họ tên, số điện thoại, email và mật khẩu. |
| FTR-02 | Yêu cầu đăng nhập | Đạt – hỗ trợ email hoặc số điện thoại và mật khẩu. |
| FTR-03 | Xác thực dữ liệu đầu vào | Đạt – các trường bắt buộc phải báo lỗi 400 khi thiếu dữ liệu. |
| FTR-04 | Quản lý xe | Đạt – có chức năng thêm, xem, sửa, xóa và đặt xe mặc định. |
| FTR-05 | Đặt lịch rửa xe | Cần làm rõ – khách hàng phải chọn ít nhất một dịch vụ khi tạo booking. |
| FTR-06 | Phân quyền | Đạt – API khách hàng yêu cầu JWT, API admin yêu cầu quyền ADMIN. |
| FTR-07 | Tích điểm và khuyến mãi | Đạt – SRS mô tả tích điểm, dùng điểm, hoàn điểm và kiểm tra hạng thành viên. |

## Phát hiện cần theo dõi

| Mã lỗi | Mô tả | Mức độ | Hành động đề xuất |
|---|---|---|---|
| FTR-BOOK-01 | SRS yêu cầu chọn ít nhất một dịch vụ khi đặt lịch. Cần bảo đảm Backend trả về 400 Bad Request nếu `serviceIds` rỗng. | High | Tạo test case Postman; nếu API không chặn thì tạo Jira Bug để sửa. |

## Kết luận

Tài liệu SRS đã mô tả các chức năng chính của hệ thống. Cần kiểm tra động bằng Postman đối với yêu cầu chọn dịch vụ khi đặt lịch và cập nhật lỗi nếu kết quả thực tế khác với SRS.