# Test Evidence – Vehicle Management API (SCRUM-73)

**Người kiểm thử:** Dương Trung Tín  
**Công cụ:** Postman & CodeceptJS  
**Backend:** http://localhost:8080/api/vehicles  
**Collection:** postman_collection_SCRUM-73.json  
**Ngày kiểm thử:** 25/08/2026  

| Mã test | Chức năng kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| TC-VEH-01 | Tạo xe mới với dữ liệu hợp lệ | 201 Created, trả vehicleId, primary: true | API trả 201 Created, trả thông tin xe chuẩn xác | Pass |
| TC-VEH-02 | Tạo xe thiếu biển số / loại xe | 400 Bad Request | API trả 400 VALIDATION_ERROR | Pass |
| TC-VEH-03 | Tạo xe trùng biển số đã có | 400 Bad Request | API trả 400 BUSINESS_ERROR: Bien so xe da ton tai | Pass |
| TC-VEH-04 | Tạo xe với biển số vượt 20 ký tự | 400 Bad Request | API trả 400 VALIDATION_ERROR: Bien so xe toi da 20 ky tu | Pass |
| TC-VEH-05 | Lấy danh sách xe của tài khoản đăng nhập | 200 OK | API trả 200 OK và danh sách xe của user | Pass |
| TC-VEH-06 | Lấy danh sách xe khi không có Token | 401 Unauthorized / 403 Forbidden | API chặn truy cập không hợp lệ | Pass |
| TC-VEH-07 | Kiểm tra xe vừa tạo có trong danh sách | 200 OK, chứa vehicleId mới | vehicleId xuất hiện trong danh sách trả về | Pass |
| TC-VEH-08 | Cập nhật thông tin xe hợp lệ | 200 OK | API cập nhật thành công và trả 200 OK | Pass |
| TC-VEH-09 | Đặt xe làm xe mặc định (Set Primary) | 200 OK, primary = true | Xe được cập nhật thành xe chính | Pass |
| TC-VEH-10 | Bảo mật: Sửa xe của người khác (IDOR) | 404 Not Found | Hệ thống chặn thao tác, trả 404 Khong tim thay xe | Pass |
| TC-VEH-11 | Sửa xe với vehicleId không tồn tại | 404 Not Found | API trả 404 Khong tim thay xe | Pass |
| TC-VEH-12 | Bảo mật: Xóa xe của người khác (IDOR) | 404 Not Found | Hệ thống chặn thao tác, trả 404 Khong tim thay xe | Pass |
| TC-VEH-13 | Xóa xe hợp lệ của chính mình | 204 No Content | API xóa thành công, trả 204 No Content | Pass |
| TC-VEH-14 | Chặn xóa xe đã từng có lịch đặt | 400 Bad Request | API trả 400 BUSINESS_ERROR: Khong the xoa xe da co lich dat | Pass |

## Bằng chứng kiểm thử giao diện (UI Evidence)
- **Kịch bản SCRUM-35**: Xác minh giao diện quản lý xe và xem chi tiết xe của khách hàng.
- **File bằng chứng**: FE-SmartWashCar/output/proof_scrum35_vehicle_ui.png

## Kết luận
- Toàn bộ các API CRUD và phân quyền của Module Vehicle hoạt động đúng theo yêu cầu thiết kế và tài liệu SRS.
- Cơ chế bảo mật chống truy cập chéo (IDOR) giữa các khách hàng được đảm bảo.
- Ràng buộc toàn vẹn dữ liệu (không xóa xe đã có lịch đặt) hoạt động ổn định.
