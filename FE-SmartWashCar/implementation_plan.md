# Tái cấu trúc & Thống nhất dự án FE-SmartWashCar

Dự án hiện tại do 5 người code song song nên xảy ra nhiều vấn đề: trùng lặp code, không thống nhất naming convention, hai "thế giới" design system khác nhau cùng tồn tại, layout không nhất quán, và nhiều file bị orphan hoặc đặt nhầm thư mục.

## Kết quả phân tích hiện trạng

### 🔴 Vấn đề 1: Hai "hệ thống thiết kế" song song, xung đột nhau

Hiện tại dự án có **2 nhóm dev dùng 2 cách code khác nhau hoàn toàn**:

| | **Nhóm A** (Design System mới) | **Nhóm B** (Code inline cũ) |
|---|---|---|
| **Đặt tên file** | `kebab-case.tsx` | `PascalCase.tsx` |
| **Layout** | Dùng `AdminSidebar`, `AdminTopbar`, `ClientSidebar` từ components | Tự viết layout inline trong page (849 dòng) |
| **CSS** | Design tokens (`bg-background`, `text-primary`, `text-on-surface-variant`) | Tailwind raw (`bg-slate-900`, `text-indigo-600`, `text-amber-800`) |
| **UI Components** | Dùng shared `Button`, `Card`, `Input` từ `components/ui/` | Inline `<button className="bg-indigo-600...">` |
| **Data** | File data riêng (`admin-dashboard.ts`, `client-dashboard.ts`) | Mock data chung (`mockData.ts`) |
| **Import** | Path alias `@/components/...` | Relative `../../lib/utils` |

**Files thuộc Nhóm A** (thiết kế mới, chuẩn): `home-page.tsx`, `auth-page.tsx`, `otp-page.tsx`, `client-dashboard-page.tsx`, `client-profile-page.tsx`, `client-vehicles-page.tsx`, `admin-dashboard-page.tsx`, `admin-promotions-page.tsx`, `admin-configuration-page.tsx`, `test-routes-page.tsx`

**Files thuộc Nhóm B** (code cũ, inline): `AdminPage.tsx`, `BookingPage.tsx`, `LoyaltyPage.tsx`, `customer-management.tsx`, `rewards-selection.tsx`

---

### 🔴 Vấn đề 2: File đặt sai thư mục

| File | Vị trí hiện tại | Vấn đề |
|---|---|---|
| [customer-management.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/dashboard/customer-management.tsx) | `components/dashboard/` | Đây là **trang admin đầy đủ** (366 dòng, có layout, table, drawer) nhưng bị đặt trong `components/`. Nó được route trực tiếp tại `/admin/customer` → phải là **page** |
| [rewards-selection.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/dashboard/rewards-selection.tsx) | `components/dashboard/` | Tương tự — trang đổi điểm đầy đủ (91 dòng) nhưng bị đặt trong `components/`. Route trực tiếp tại `/admin/rewards` → phải là **page** |

---

### 🔴 Vấn đề 3: Naming convention không nhất quán

- `AdminPage.tsx` (PascalCase) vs `admin-dashboard-page.tsx` (kebab-case)
- `BookingPage.tsx` vs `client-profile-page.tsx`
- `LoyaltyPage.tsx` vs `client-vehicles-page.tsx`
- `Badge.tsx` (PascalCase) vs `button.tsx`, `card.tsx`, `input.tsx` (kebab-case)

---

### 🟡 Vấn đề 4: Router có code commented-out và hardcoded paths

Trong [router.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/app/router.tsx):
- **Lines 70-73**: Các admin route bị commented-out trong điều kiện render layout, gây ra admin pages bị wrap bởi `MainLayout` (public header) thay vì có sidebar riêng
- **Lines 103-106**: Hardcoded paths `'/admin/customer'` và `'/admin/rewards'` thay vì dùng `routes.customer` và `routes.rewards`
- `AdminPage` được gọi với dummy props `bookings={[]}` (line 96) nên data luôn rỗng

---

### 🟡 Vấn đề 5: Layout không nhất quán giữa các admin pages

| Admin Page | Layout |
|---|---|
| `admin-dashboard-page` | Tự render `AdminSidebar` + `AdminTopbar` bên trong |
| `admin-promotions-page` | Dùng `AdminPromotionShell` wrapper |
| `admin-configuration-page` | Tự render `AdminSidebar` + custom header |
| `AdminPage` (bookings) | Không có sidebar/topbar, nhận props từ ngoài |
| `customer-management` | Không có sidebar, tự thiết kế layout riêng hoàn toàn |
| `rewards-selection` | Không có sidebar, layout đơn giản |

---

### 🟡 Vấn đề 6: Badge component bị duplicate import style

- `Badge.tsx` (PascalCase) dùng relative import `../../lib/utils`
- Tất cả các file khác dùng `@/lib/utils`

---

### 🟢 Vấn đề 7: `mockData.ts` trộn lẫn nhiều concerns

File `mockData.ts` chứa data cho cả: Booking admin, Client booking, Loyalty — trong khi các file data khác (`admin-dashboard.ts`, `client-dashboard.ts`, `marketing.ts`) đã được tách riêng rõ ràng.

---

## User Review Required

> [!IMPORTANT]
> **Quyết định chính cần xác nhận**: Dự án có 2 phong cách code khác nhau (Nhóm A vs Nhóm B). Tôi đề xuất **chuẩn hóa toàn bộ sang phong cách Nhóm A** (design tokens, shared components, kebab-case) vì đó là phong cách mới hơn, có design system rõ ràng và nhiều file hơn. Các file Nhóm B sẽ được refactor để tuân theo chuẩn mới.

> [!WARNING]
> **5 files lớn cần refactor significant**: `AdminPage.tsx` (849 dòng), `BookingPage.tsx` (590 dòng), `LoyaltyPage.tsx` (364 dòng), `customer-management.tsx` (366 dòng), `rewards-selection.tsx` (91 dòng). Tổng cộng ~2,260 dòng code cần được cập nhật CSS classes, import paths, naming convention, và layout wrapper.

## Open Questions

> [!IMPORTANT]
> 1. **Giữ hay xóa `AdminPage.tsx`?** File này là trang quản lý booking admin (849 dòng), nhưng route hiện tại pass `bookings={[]}` nên data luôn rỗng. Bạn muốn tôi:
>    - **(A)** Refactor nó thành `admin-bookings-page.tsx` với mock data từ `mockData.ts` (giữ chức năng, sửa style) 
>    - **(B)** Xóa nó vì chức năng booking admin chưa cần thiết?

> [!IMPORTANT]
> 2. **`customer-management.tsx` và `rewards-selection.tsx`** — Hai component này được đặt sai thư mục nhưng có chức năng hoạt động. Bạn muốn:
>    - **(A)** Di chuyển vào `pages/` và refactor theo design system mới (thêm sidebar, chuẩn hóa CSS)
>    - **(B)** Giữ nguyên chức năng, chỉ di chuyển file?

> [!IMPORTANT]
> 3. **Chuẩn hóa `Badge.tsx`**: File này dùng PascalCase và export default thay vì named export. Tôi sẽ rename thành `badge.tsx` và chuyển sang named export cho nhất quán. Bạn đồng ý không?

---

## Proposed Changes

### Phase 1: Chuẩn hóa Naming & Import

#### [MODIFY] [Badge.tsx → badge.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/ui/Badge.tsx)
- Rename `Badge.tsx` → `badge.tsx` (kebab-case)
- Chuyển từ relative import `../../lib/utils` sang `@/lib/utils`
- Chuyển từ `export default` sang `export function Badge`
- Cập nhật tất cả import references

---

### Phase 2: Di chuyển files đặt sai thư mục

#### [NEW] [admin-customer-page.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/pages/admin-customer-page.tsx)
- Di chuyển logic từ `components/dashboard/customer-management.tsx` vào page mới
- Wrap với `AdminSidebar` + `AdminTopbar` cho nhất quán layout
- Chuẩn hóa CSS sang design tokens

#### [NEW] [admin-rewards-page.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/pages/admin-rewards-page.tsx)
- Di chuyển logic từ `components/dashboard/rewards-selection.tsx` vào page mới
- Wrap với `AdminSidebar` + `AdminTopbar` 
- Chuẩn hóa CSS sang design tokens

#### [DELETE] [customer-management.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/dashboard/customer-management.tsx)
- File gốc sẽ bị xóa sau khi di chuyển

#### [DELETE] [rewards-selection.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/dashboard/rewards-selection.tsx)
- File gốc sẽ bị xóa sau khi di chuyển

---

### Phase 3: Refactor Pages Nhóm B theo Design System

#### [MODIFY] [AdminPage.tsx → admin-bookings-page.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/pages/AdminPage.tsx)
- Rename sang `admin-bookings-page.tsx` (kebab-case)
- Wrap với `AdminSidebar` + `AdminTopbar` cho nhất quán
- Chuẩn hóa CSS classes: `bg-slate-*` → `bg-surface`, `text-indigo-600` → `text-primary`, etc.
- Import `@/lib/utils` thay vì `../lib/utils`
- Sửa component signature: loại bỏ props bên ngoài, tự quản lý data từ `mockData.ts` bên trong
- Chuyển từ `export default` → `export function`

#### [MODIFY] [BookingPage.tsx → booking-page.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/pages/BookingPage.tsx) 
- Rename sang `booking-page.tsx`
- Chuẩn hóa CSS classes sang design tokens
- Import paths → `@/` alias
- Chuyển từ `export default` → `export function`

#### [MODIFY] [LoyaltyPage.tsx → loyalty-page.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/pages/LoyaltyPage.tsx)
- Rename sang `loyalty-page.tsx`
- Chuẩn hóa CSS classes sang design tokens
- Import paths → `@/` alias
- Chuyển từ `export default` → `export function`

---

### Phase 4: Sửa Router & Routes

#### [MODIFY] [router.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/app/router.tsx)
- Bỏ comment-out các admin routes trong layout condition (lines 70-73)
- Thay hardcoded paths bằng `routes.*` constants
- Cập nhật tất cả import theo tên file mới
- Sửa AdminPage render: bỏ dummy props, gọi component mới self-contained
- Thêm các admin routes (`/admin/customer`, `/admin/rewards`, `/admin/bookings`) vào điều kiện không dùng MainLayout

#### [MODIFY] [routes.ts](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/app/routes.ts)
- Đảm bảo tất cả routes đang sử dụng đều được define

---

### Phase 5: Tách mockData.ts

#### [MODIFY] [mockData.ts](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/data/mockData.ts)
- Giữ nguyên file nhưng thêm comment phân nhóm rõ ràng cho từng domain (booking, loyalty, vehicles, services)
- Các types và data exports giữ nguyên vì nhiều file đang dùng

---

### Phase 6: Cập nhật Admin Sidebar navigation  

#### [MODIFY] [admin-sidebar.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/admin/admin-sidebar.tsx)
- Sửa navigation mapping: thêm routes cho bookings, customers, rewards
- Loại bỏ logic nhận diện bằng `item.label` (lines 41-43) — dùng `navRouteMap` nhất quán
- Cập nhật active state detection dựa trên current path

#### [MODIFY] [client-sidebar.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/components/dashboard/client-sidebar.tsx)
- Loại bỏ logic nhận diện bằng `item.label` (lines 30-35) — dùng data-driven routes
- Cập nhật `dashboardNavItems` để có đúng paths

---

### Phase 7: Cập nhật Test Routes

#### [MODIFY] [test-routes-page.tsx](file:///c:/Users/PC/Downloads/production/fe-smartwashcar/fe-autowashcar/src/pages/test-routes-page.tsx)
- Thêm các routes mới (booking, loyalty, customer, rewards) vào danh sách test

---

## Verification Plan

### Automated Tests
```bash
npx tsc -b          # TypeScript build check - no type errors
npm run build        # Full production build - no warnings
```

### Manual Verification
- Chạy `npm run dev` và kiểm tra từng route qua trang `/test`:
  - Tất cả pages render đúng, không crash
  - Admin pages có sidebar + topbar nhất quán  
  - Client pages có sidebar + topbar nhất quán
  - Public pages (home, login, register, otp) có AppHeader
- Verify không còn file PascalCase nào trong `pages/` và `components/ui/`
- Verify tất cả imports dùng `@/` alias
