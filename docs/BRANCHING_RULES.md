# Quy tắc làm việc với GitHub và Nhánh Git

## 1. Repository chung

- Repository chung của nhóm: https://github.com/TIN1589/Smart-Management-System-Car-Wash
- Mỗi thành viên làm việc trên một nhánh riêng.
- Nhánh `main` chỉ chứa mã nguồn ổn định, đã được kiểm tra hoặc duyệt.

## 2. Quy tắc đặt tên nhánh

Sử dụng các dạng sau:

- `feature/<ten-chuc-nang>`: phát triển chức năng mới.
- `fix/<ten-loi>`: sửa lỗi.
- `docs/<ten-tai-lieu>`: thêm hoặc cập nhật tài liệu.

Ví dụ:

- `feature/scrum-authentication`
- `feature/vehicle-management`
- `feature/booking-management`
- `feature/loyalty-promotion`
- `feature/admin-management`
- `docs/srs-ftr-testing`
- `fix/booking-empty-service-validation`

## 3. Quy trình làm việc

1. Cập nhật nhánh `main` trước khi bắt đầu công việc.
2. Tạo nhánh riêng tương ứng với nhiệm vụ được phân công trên Jira.
3. Phát triển và kiểm thử chức năng trên nhánh riêng.
4. Commit với nội dung rõ ràng, có mã công việc Jira liên quan.
5. Push nhánh lên GitHub.
6. Tạo Pull Request để các thành viên xem xét trước khi gộp vào `main`.

## 4. Quy tắc ghi Commit

Cú pháp:

```text
SCRUM-<mã-công-việc> mô tả ngắn
```

Ví dụ:

```text
SCRUM-12 phát triển API đăng nhập
SCRUM-13 phát triển API đăng ký
SCRUM-35 phát triển chức năng quản lý xe
SCRUM-32 thêm tài liệu SRS ban đầu
```

## 5. Lưu ý quan trọng

- Không push trực tiếp lên nhánh `main`.
- Không commit file `.env`, mật khẩu database, JWT token hoặc thông tin nhạy cảm.
- Kiểm tra và xử lý cẩn thận merge conflict trước khi tạo Pull Request.
- Mỗi Pull Request cần có ít nhất một thành viên trong nhóm xem xét trước khi merge.