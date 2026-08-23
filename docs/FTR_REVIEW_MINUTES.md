# Biên bản cuộc họp rà soát SRS theo FTR

## Thông tin cuộc họp

- Dự án: AutoWash Pro
- Tài liệu được rà soát: SRS_AutoWash_Pro.docx
- Hình thức: Formal Technical Review (FTR)
- Ngày họp: 23/08/2026
- Người chủ trì: Nguyễn Thanh Thành Nhựt
- Người tham gia: Nguyễn Thanh Thành Nhựt và các thành viên nhóm AutoWash Pro

## Nội dung rà soát

1. Kiểm tra phạm vi, tác nhân và các chức năng chính trong SRS.
2. Kiểm tra yêu cầu Authentication: đăng ký, đăng nhập và phân quyền.
3. Kiểm tra yêu cầu Vehicle, Services và Booking.
4. Kiểm tra yêu cầu Loyalty, Promotion và Admin.
5. Xác định yêu cầu cần kiểm thử động bằng Postman.

## Kết quả và hành động

| Mã | Nội dung | Kết quả | Người phụ trách |
|---|---|---|---|
| FTR-01 | Rà soát SRS Authentication. | Đạt | Nguyễn Thanh Thành Nhựt |
| FTR-02 | Rà soát SRS Vehicle và Booking. | Đạt | Nhóm dự án |
| FTR-03 | Kiểm tra quy tắc booking phải có ít nhất một dịch vụ. | Cần kiểm thử Postman | Thành viên phụ trách Booking |
| FTR-04 | Rà soát SRS Loyalty, Promotion và Admin. | Đạt | Nhóm dự án |

## Kết luận

Nhóm thống nhất SRS đủ điều kiện để thực hiện kiểm thử động. Nếu Postman cho kết quả khác yêu cầu SRS, nhóm sẽ tạo Jira Bug, sửa lỗi và thực hiện Regression Testing.