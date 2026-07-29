# Kế hoạch triển khai hỗ trợ Đăng nhập bằng cả Email và Số điện thoại

Tài liệu này đề xuất phương án thay đổi phía Backend và cách tích hợp tương ứng ở Frontend để cho phép người dùng đăng nhập bằng Email hoặc Số điện thoại (Email or Phone number).

---

## Phân tích Hiện trạng (Current State)

### 1. Phía Frontend
- Giao diện đăng nhập hiện tại hiển thị nhãn: **"Email hoặc Số điện thoại"** (`emailOrPhone`).
- Khi submit form, frontend gọi [authService.login](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/features/auth/services/auth-service.ts#L41-L48) với payload:
  ```typescript
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await authorizeAxios.post<AuthResponse>('/auth/login', {
      email: payload.emailOrPhone,
      phone: payload.emailOrPhone,
      password: payload.password,
    })
    return data
  }
  ```
  *Nhận xét:* Frontend đang "gửi bừa" cả 2 trường `email` và `phone` với cùng một giá trị là input của người dùng.

### 2. Phía Backend
- Theo tài liệu [API_ROUTES.md](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/API_ROUTES.md#L19-L25), endpoint đăng nhập `/api/auth/login` chỉ nhận:
  ```json
  {
    "phone": "String (required)",
    "password": "String (required)"
  }
  ```
- Backend đang tìm kiếm người dùng duy nhất bằng số điện thoại (`phone`). Khi người dùng nhập Email, Backend sẽ cố gắng validate hoặc tìm email đó dưới dạng số điện thoại trong DB -> Gây lỗi hoặc sai lệch logic.

---

## Đề xuất Giải pháp Thay đổi

Chúng ta có 2 phương án thiết kế API để Backend và Frontend khớp nối với nhau một cách tối ưu.

### Phương án 1: Sử dụng một trường định danh duy nhất (Unified Field) — KHUYÊN DÙNG 🌟

Thay vì truyền tách biệt `email` và `phone`, API đăng nhập sẽ nhận một trường chung đại diện cho định danh của người dùng (ví dụ: `username`, `loginId`, hoặc `emailOrPhone`).

#### 1. Yêu cầu đối với Backend
- **Thay đổi Request Body DTO của `/api/auth/login`**:
  ```json
  {
    "username": "user@example.com hoặc 0987654321",
    "password": "mật khẩu"
  }
  ```
  *(Lưu ý: Có thể giữ tên trường là `emailOrPhone` tùy theo quy chuẩn đặt tên của backend).*
- **Logic xử lý của Backend**:
  1. Kiểm tra giá trị của trường `username` gửi lên.
  2. Dùng Regex hoặc thư viện validator để phân biệt xem đó là **Email** hay **Số điện thoại**:
     - Nếu có ký tự `@` hoặc khớp định dạng email: Tìm User trong Database theo cột `email`.
     - Ngược lại (hoặc khớp định dạng số điện thoại): Tìm User trong Database theo cột `phone`.
  3. Nếu tìm thấy User, kiểm tra mật khẩu (`password`).
  4. Nếu mật khẩu khớp, tạo JWT token và trả về thành công.

#### 2. Tích hợp phía Frontend
- Cập nhật [authService.login](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/features/auth/services/auth-service.ts#L41-L48) để gửi đúng format DTO mới:
  ```typescript
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await authorizeAxios.post<AuthResponse>('/auth/login', {
      username: payload.emailOrPhone, // hoặc emailOrPhone: payload.emailOrPhone
      password: payload.password,
    })
    return data
  }
  ```

---

### Phương án 2: Tự động phân loại trường gửi đi từ Frontend (Không đổi cấu trúc API Backend)

Nếu Backend không muốn thay đổi cấu trúc Request Body hiện tại mà muốn giữ cả hai trường `email` và `phone` dạng tùy chọn (Optional).

#### 1. Yêu cầu đối với Backend
- **Thay đổi Request Body DTO của `/api/auth/login`**: Cho phép truyền `email` **hoặc** `phone` (ít nhất một trong hai trường phải có giá trị).
  ```json
  {
    "email": "user@example.com", // optional
    "phone": "0987654321",       // optional
    "password": "mật khẩu"
  }
  ```
- **Logic xử lý của Backend**:
  1. Nếu trường `email` được gửi lên: Tìm User theo `email`.
  2. Ngược lại, nếu trường `phone` được gửi lên: Tìm User theo `phone`.
  3. Kiểm tra mật khẩu và trả về kết quả.

#### 2. Tích hợp phía Frontend
- Frontend sẽ tự động phát hiện xem người dùng đang nhập email hay số điện thoại trước khi gọi API:
  ```typescript
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const isEmail = payload.emailOrPhone.includes('@');
    const requestBody: any = {
      password: payload.password,
    };
    
    if (isEmail) {
      requestBody.email = payload.emailOrPhone.trim();
    } else {
      requestBody.phone = payload.emailOrPhone.trim();
    }

    const { data } = await authorizeAxios.post<AuthResponse>('/auth/login', requestBody);
    return data;
  }
  ```

---

## So sánh & Đánh giá

| Tiêu chí | Phương án 1 (Unified Field) | Phương án 2 (Frontend phân loại) |
| :--- | :--- | :--- |
| **Độ sạch sẽ của API (Clean API)** | **Rất cao**: API rõ ràng, đại diện đúng tính năng "đăng nhập bằng một tài khoản định danh bất kỳ". | **Trung bình**: Body API có nhiều trường tùy chọn dễ gây nhầm lẫn. |
| **Bảo mật & Validation** | **Dễ kiểm soát**: Backend thực hiện validate định dạng chuẩn tập trung. | **Phụ thuộc Frontend**: Backend vẫn phải validate chéo đề phòng Client gửi sai. |
| **Khả năng mở rộng** | **Tốt**: Sau này nếu muốn đăng nhập thêm bằng `username` (nickname), backend chỉ cần cập nhật logic check mà không đổi DTO. | **Hạn chế**: Mỗi lần thêm loại định danh mới sẽ phải thêm trường mới vào DTO. |

> [!TIP]
> **Khuyến nghị:** Nên ưu tiên chọn **Phương án 1** với việc Backend sử dụng một trường chung duy nhất (như `username` hoặc `emailOrPhone`). Đây là pattern thiết kế API tiêu chuẩn cho các hệ thống cho phép đăng nhập đa phương thức hiện nay.

---

## Kế hoạch Kiểm thử (Verification Plan)

### Kiểm thử thủ công (Manual Testing)
1. **Đăng nhập bằng Email**: Nhập email chính xác của tài khoản đã đăng ký và mật khẩu -> Đăng nhập thành công.
2. **Đăng nhập bằng Số điện thoại**: Nhập số điện thoại chính xác của tài khoản và mật khẩu -> Đăng nhập thành công.
3. **Trường hợp sai thông tin**:
   - Nhập email đúng nhưng mật khẩu sai -> Trả về lỗi 401.
   - Nhập email/phone không tồn tại trong DB -> Trả về lỗi 401 hoặc 404 tùy cấu hình bảo mật.
   - Để trống thông tin định danh -> Frontend chặn validate từ client.
