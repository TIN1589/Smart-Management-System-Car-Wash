# Checklist rà soát SRS theo FTR

- Dự án: AutoWash Pro
- Tài liệu: SRS_AutoWash_Pro.docx
- Người thực hiện: Nguyễn Thanh Thành Nhựt
- Ngày rà soát: 23/08/2026

| STT | Nội dung kiểm tra | Kết quả | Ghi chú |
|---:|---|---|---|
| 1 | SRS có nêu mục tiêu và phạm vi hệ thống. | Đạt | Có mô tả AutoWash Pro và các phân hệ. |
| 2 | Các tác nhân sử dụng hệ thống được xác định. | Đạt | Customer và Admin. |
| 3 | Yêu cầu Đăng ký/Đăng nhập được mô tả rõ. | Đạt | Có dữ liệu đầu vào và kết quả mong đợi. |
| 4 | Yêu cầu Quản lý xe được mô tả. | Đạt | Thêm, xem, sửa, xóa, đặt xe mặc định. |
| 5 | Yêu cầu Dịch vụ và Đặt lịch được mô tả. | Đạt | Có chọn dịch vụ và khung giờ. |
| 6 | Quy tắc phải chọn ít nhất một dịch vụ khi đặt lịch rõ ràng. | Cần kiểm tra | Cần test Postman với `serviceIds` rỗng. |
| 7 | Yêu cầu tích điểm, hạng thành viên và khuyến mãi được mô tả. | Đạt | Có quy tắc tích/tiêu/hoàn điểm. |
| 8 | Phân quyền Customer/Admin được mô tả. | Đạt | API Admin yêu cầu quyền ADMIN. |
| 9 | Các yêu cầu phi chức năng được nêu. | Đạt | Bảo mật JWT, hiệu năng, khả năng sử dụng. |
| 10 | Yêu cầu có thể thiết kế test case. | Đạt | Có thể kiểm thử bằng Postman và giao diện. |

## Kết luận

Tài liệu SRS đủ các yêu cầu chính để tiếp tục kiểm thử. Mục cần theo dõi là kiểm tra Backend có trả về `400 Bad Request` khi khách tạo booking nhưng không chọn dịch vụ.