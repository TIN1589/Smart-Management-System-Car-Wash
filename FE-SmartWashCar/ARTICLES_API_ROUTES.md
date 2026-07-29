# Tài liệu API cho tính năng Bài viết (Articles)

Tài liệu này đặc tả các API cần thiết để hỗ trợ tính năng hiển thị bài viết ngoài client và quản trị bài viết tại admin dashboard.

---

## 1. Cấu trúc dữ liệu (Article Model)

Mỗi bài viết sẽ bao gồm các trường sau:

```json
{
  "id": "46fc4eb5-780c-4d1c-9924-3c453613bb13", // UUID, sinh tự động
  "title": "Hướng dẫn tự rửa xe tại nhà đúng cách tránh xước sơn", // Tiêu đề bài viết
  "slug": "huong-dan-tu-rua-xe-tai-nha-dung-cach", // Slug sinh từ tiêu đề (unique)
  "summary": "Rửa xe không đúng cách là nguyên nhân hàng đầu gây ra các vết xước dăm khó chịu...", // Tóm tắt ngắn
  "content": "<p>Nội dung chi tiết của bài viết dưới dạng HTML hoặc Markdown...</p>", // Nội dung chi tiết
  "coverImage": "https://images.unsplash.com/photo-1607860108855-64acf2078ed9", // URL ảnh đại diện bài viết
  "category": "VEHICLE", // Phân loại: VEHICLE (Kiến thức xe) hoặc SERVICE (Dịch vụ)
  "status": "PUBLISHED", // Trạng thái: DRAFT (Bản nháp) hoặc PUBLISHED (Công khai)
  "author": "Đội ngũ chuyên gia AutoWash", // Tên người viết
  "createdAt": "2026-06-14T00:00:00Z",
  "updatedAt": "2026-06-14T00:00:00Z"
}
```

---

## 2. Các API Client (Public hoặc Yêu cầu Token người dùng)

### 2.1 Lấy danh sách bài viết đã xuất bản
* **Endpoint:** `GET /api/articles`
* **Query Parameters:**
  * `category` (String, optional): Lọc theo danh mục (`VEHICLE` hoặc `SERVICE`).
  * `search` (String, optional): Tìm kiếm bài viết theo tiêu đề hoặc tóm tắt.
* **Trạng thái truy cập:** Public (Không bắt buộc token).
* **Response (JSON):**
  ```json
  [
    {
      "id": "46fc4eb5-780c-4d1c-9924-3c453613bb13",
      "title": "Hướng dẫn tự rửa xe tại nhà đúng cách tránh xước sơn",
      "slug": "huong-dan-tu-rua-xe-tai-nha-dung-cach",
      "summary": "Rửa xe không đúng cách...",
      "coverImage": "https://...",
      "category": "VEHICLE",
      "author": "Chuyên gia AutoWash",
      "createdAt": "2026-06-14T00:00:00Z"
    }
  ]
  ```

### 2.2 Lấy chi tiết bài viết theo Slug hoặc ID
* **Endpoint:** `GET /api/articles/{slug}` hoặc `GET /api/articles/detail/{id}`
* **Trạng thái truy cập:** Public.
* **Response (JSON):** Đối tượng `Article` chi tiết có chứa thuộc tính `content`.

---

## 3. Các API Quản trị (Admin - Yêu cầu Token quyền ADMIN)

Tất cả các route này yêu cầu header `Authorization: Bearer <admin-token>`.

### 3.1 Admin lấy danh sách toàn bộ bài viết (Cả nháp và công khai)
* **Endpoint:** `GET /api/admin/articles`
* **Response (JSON):** Danh sách toàn bộ bài viết, đã sắp xếp theo ngày tạo mới nhất.

### 3.2 Tạo bài viết mới
* **Endpoint:** `POST /api/admin/articles`
* **Input (JSON):**
  ```json
  {
    "title": "Tên bài viết mới",
    "summary": "Tóm tắt bài viết...",
    "content": "Nội dung HTML/Markdown...",
    "coverImage": "URL ảnh bìa",
    "category": "VEHICLE", // hoặc SERVICE
    "status": "PUBLISHED", // hoặc DRAFT
    "author": "Tác giả"
  }
  ```
* **Response (JSON):** `Article` vừa tạo thành công kèm theo `id`, `slug`, `createdAt`.

### 3.3 Cập nhật bài viết
* **Endpoint:** `PUT /api/admin/articles/{id}`
* **Input (JSON):** Tương tự payload của POST nhưng tất cả các trường đều optional.
* **Response (JSON):** `Article` đã cập nhật.

### 3.4 Xóa bài viết
* **Endpoint:** `DELETE /api/admin/articles/{id}`
* **Response (JSON):**
  ```json
  {
    "message": "Xóa bài viết thành công"
  }
  ```
