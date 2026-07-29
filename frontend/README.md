# 🎨 AutoWash Pro Frontend

Ứng dụng giao diện khách hàng (Client Dashboard) và giao diện quản trị (Admin Dashboard) của dự án **AutoWash Pro**. Giao diện được thiết kế hiện đại, mượt mà, tối ưu hóa trải nghiệm đặt lịch, theo dõi điểm thưởng, xem cẩm nang chăm sóc xe và cấu hình hệ thống.

> [!NOTE]
> Để xem tài liệu phân tích chi tiết, yêu cầu hệ thống ban đầu, đối chiếu mã nguồn thực tế (Gap Analysis) và các **sơ đồ UML (Use Case, Class, Sequence)** của toàn bộ sản phẩm, vui lòng tham khảo [Master README.md ở Backend](file:///d:/Java/autowash-pro/README.md).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Runtime & Bundler:** React 19 + TypeScript + Vite.
- **Styling & Components:** Tailwind CSS v4 + shadcn-compatible components + lucide-react icons.
- **State Management:** Redux Toolkit (quản lý trạng thái đăng nhập, số dư điểm loyalty).
- **Animation:** Framer Motion (motion/react) cho các hiệu ứng chuyển đổi mượt mà.
- **Routing:** Custom Single Page Application Router (sử dụng Browser History API).

---

## 📁 Cấu Trúc Mã Nguồn Frontend

```text
src/
  ├── app/                  Định nghĩa routes, router chính và cấu hình Redux Store
  ├── assets/               Hình ảnh tĩnh phục vụ giao diện
  ├── components/           Các component giao diện dùng chung
  │     ├── dashboard/      Khu vực hiển thị của Dashboard Khách hàng
  │     ├── layout/         Header, Footer, Thanh điều hướng bên (Sidebar)
  │     └── ui/             Các component UI nguyên bản (button, card, dialog, input...)
  ├── data/                 Dữ liệu tĩnh cấu hình menu, thông tin dịch vụ
  ├── features/             Các phân hệ chức năng chính của ứng dụng
  │     ├── admin/          Các màn hình & logic quản trị (Bookings, Configuration, Customer, Promotions, Reports, Services)
  │     ├── articles/       Trang cẩm nang & kinh nghiệm chăm sóc xe
  │     ├── auth/           Trang đăng nhập, đăng ký và xác minh OTP
  │     ├── booking/        Quy trình đặt lịch dịch vụ và khấu trừ điểm
  │     ├── client/         Dashboard cá nhân, màn hình quản lý xe và loyalty page
  │     └── test/           Trang chuyển hướng nhanh hỗ trợ lập trình viên (Route index /test)
  ├── layouts/              Layout bao ngoài cho các trang
  ├── lib/                  Cấu hình các tiện ích và Axios client (`api-client.ts`)
  └── shared/               Các tiện ích, component dùng chung cho toàn dự án
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Giao Diện

### Yêu cầu hệ thống:
- **Node.js** phiên bản v18 trở lên.
- **npm** (đã đi kèm Node.js).

### Các bước khởi chạy:
1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
2. Cấu hình biến môi trường trong file `.env` ở thư mục gốc (nếu cần đổi địa chỉ API Backend):
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
3. Chạy ứng dụng ở chế độ Development:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại: `http://localhost:5173`.
4. Build mã nguồn ra sản phẩm production:
   ```bash
   npm run build
   ```
5. Chạy kiểm tra kiểu dữ liệu (TypeScript compiler check) và kiểm tra chuẩn định dạng code (ESLint check):
   ```bash
   npm run typecheck
   npm run lint
   ```

---

## 💡 Lưu Ý Khi Phát Triển

- Sử dụng đường dẫn `/test` để di chuyển nhanh chóng giữa các màn hình mà không cần phải thực hiện toàn bộ luồng đăng nhập/OTP.
- Mọi API giao tiếp với Backend đều được bọc qua instance `authorizeAxios` trong `src/shared/lib/api-client.ts` để tự động đính kèm JWT token vào header yêu cầu.
