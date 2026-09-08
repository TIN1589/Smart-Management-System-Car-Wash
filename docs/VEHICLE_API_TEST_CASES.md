# Test Case API Vehicle Management (SCRUM-73)

- Dự án: AutoWash Pro
- Công cụ kiểm thử: Postman
- Người kiểm thử: Dương Trung Tín
- API Base URL: http://localhost:8080/api/vehicles
- Collection: postman_collection_SCRUM-73.json
- Environment: postman_environment_SCRUM-73.json

| Mã test | Nhóm | API Endpoint | Mục tiêu kiểm thử | Dữ liệu kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|---|---|
| TC-VEH-01 | Tạo xe mới | POST /api/vehicles | Tạo xe với dữ liệu hợp lệ | licensePlate: 51H-11111, ehicleType: SUV, rand: Toyota, color: Trắng | 201 Created, trả về thông tin xe và primary: true | Pass |
| TC-VEH-02 | Tạo xe mới | POST /api/vehicles | Tạo xe thiếu trường bắt buộc | licensePlate: null, ehicleType: null | 400 Bad Request, validation error | Pass |
| TC-VEH-03 | Tạo xe mới | POST /api/vehicles | Tạo xe trùng biển số đã tồn tại | licensePlate: 51H-11111 (đã có trong DB) | 400 Bad Request, báo Bien so xe da ton tai | Pass |
| TC-VEH-04 | Tạo xe mới | POST /api/vehicles | Tạo xe vượt quá độ dài tối đa | licensePlate dài 25 ký tự | 400 Bad Request, báo Bien so xe toi da 20 ky tu | Pass |
| TC-VEH-05 | Danh sách | GET /api/vehicles | Lấy danh sách xe của tài khoản đăng nhập | Token hợp lệ của user chính | 200 OK, trả về danh sách các xe thuộc sở hữu | Pass |
| TC-VEH-06 | Danh sách | GET /api/vehicles | Lấy danh sách không có token xác thực | Không gửi header Authorization | 401 Unauthorized / 403 Forbidden | Pass |
| TC-VEH-07 | Danh sách | GET /api/vehicles | Xác minh ehicleId mới tạo xuất hiện trong list | So khớp ID trả về từ TC-01 | 200 OK, ID xuất hiện trong mảng kết quả | Pass |
| TC-VEH-08 | Cập nhật | PUT /api/vehicles/{id} | Cập nhật thông tin xe hợp lệ | color: Đen nhám, rand: Honda | 200 OK, thông tin xe được cập nhật mới | Pass |
| TC-VEH-09 | Cập nhật | PATCH /api/vehicles/{id}/primary | Đặt xe làm xe chính (Set Primary) | Gửi request set primary | 200 OK, trường primary chuyển thành 	rue | Pass |
| TC-VEH-10 | Bảo mật | PUT /api/vehicles/{otherId} | Cập nhật xe của người khác (Bảo mật IDOR) | Token User A, ehicleId của User B | 404 Not Found (Khong tim thay xe) | Pass |
| TC-VEH-11 | Cập nhật | PUT /api/vehicles/{invalidId} | Cập nhật xe với ID không tồn tại | UUID ngẫu nhiên không có trong hệ thống | 404 Not Found (Khong tim thay xe) | Pass |
| TC-VEH-12 | Bảo mật | DELETE /api/vehicles/{otherId} | Xóa xe của người khác (Bảo mật IDOR) | Token User A, ehicleId của User B | 404 Not Found (Khong tim thay xe) | Pass |
| TC-VEH-13 | Xóa xe | DELETE /api/vehicles/{id} | Xóa xe hợp lệ của chính mình | Xe hợp lệ chưa từng có lịch đặt | 204 No Content, xe bị xóa khỏi hệ thống | Pass |
| TC-VEH-14 | Xóa xe | DELETE /api/vehicles/{bookedId} | Chặn xóa xe đã từng có lịch đặt | Xe đã phát sinh booking trong DB | 400 Bad Request, báo Khong the xoa xe da co lich dat | Pass |

## Ghi chú
- Các test case trên đã được tự động hóa hoàn toàn trong collection postman_collection_SCRUM-73.json với các assertion kiểm tra status code và response body schema.
- Thư mục 00 trong collection tự động tạo 2 tài khoản test độc lập để phục vụ kiểm thử phân quyền chéo (User A không thể thao tác trên xe của User B).
