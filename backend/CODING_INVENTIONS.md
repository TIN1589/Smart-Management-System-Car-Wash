# AutoWash Pro — Coding Conventions

> Tài liệu này áp dụng cho toàn bộ team. Mọi code được merge vào `dev` hoặc `main` phải tuân thủ các quy tắc dưới đây.

---

## 1. Ngôn ngữ & Framework

| Thành phần | Công nghệ                   |
| ---------- | --------------------------- |
| Backend    | Java 21 + Spring Boot 3.3.5 |
| Database   | PostgreSQL (Supabase)       |
| Cache      | Redis                       |
| Migration  | Flyway                      |
| Build tool | Maven                       |
| Frontend   | React.js                    |

---

## 2. Quy tắc đặt tên (Naming Conventions)

### 2.1 Package

- Tất cả **chữ thường**, phân cách bằng dấu `.`
- Không dùng chữ hoa, không dùng underscore

```
✅ com.autowash.autowash_pro.service
✅ com.autowash.autowash_pro.dto.request
❌ com.autowash.AutoWash.Service
❌ com.autowash.autowash_pro.DTO
```

### 2.2 Class & Interface

- **PascalCase** — mỗi từ viết hoa chữ cái đầu
- Tên phải rõ nghĩa, không viết tắt tùy tiện
- Hậu tố theo đúng vai trò

```java
✅ CustomerService.java
✅ BookingController.java
✅ CreateBookingRequest.java
✅ AuthResponse.java
✅ ResourceNotFoundException.java

❌ Cust.java
❌ BookCtrl.java
❌ Data.java
```

| Loại            | Hậu tố           | Ví dụ                 |
| --------------- | ---------------- | --------------------- |
| Spring Service  | `Service`        | `LoyaltyService`      |
| REST Controller | `Controller`     | `BookingController`   |
| JPA Repository  | `Repository`     | `CustomerRepository`  |
| Request DTO     | `Request`        | `LoginRequest`        |
| Response DTO    | `Response`       | `AuthResponse`        |
| JPA Entity      | _(không hậu tố)_ | `Customer`, `Booking` |
| Exception       | `Exception`      | `BusinessException`   |
| Config          | `Config`         | `SecurityConfig`      |

### 2.3 Method

- **camelCase** — chữ cái đầu thường, các từ sau viết hoa
- Động từ đứng đầu, mô tả rõ hành động

```java
✅ createBooking()
✅ findCustomerByPhone()
✅ calculatePointsEarned()
✅ isTokenValid()
✅ buildAuthResponse()

❌ booking()
❌ customer()
❌ data()
❌ process()
```

| Loại method      | Prefix                 | Ví dụ                                 |
| ---------------- | ---------------------- | ------------------------------------- |
| Lấy dữ liệu      | `get`, `find`          | `getCustomerById()`, `findByPhone()`  |
| Tạo mới          | `create`, `save`       | `createBooking()`, `saveCustomer()`   |
| Cập nhật         | `update`               | `updateBookingStatus()`               |
| Xóa              | `delete`, `remove`     | `deleteVehicle()`                     |
| Kiểm tra boolean | `is`, `has`, `can`     | `isTokenValid()`, `hasEnoughPoints()` |
| Tính toán        | `calculate`, `compute` | `calculatePoints()`                   |
| Build object     | `build`                | `buildAuthResponse()`                 |

### 2.4 Variable & Field

- **camelCase**
- Tên có nghĩa, không dùng tên đơn ký tự (trừ vòng lặp)

```java
✅ String fullName;
✅ int totalPoints;
✅ LocalDateTime scheduledAt;
✅ List<Vehicle> vehicleList;

❌ String fn;
❌ int tp;
❌ Object data;
❌ String s;
```

### 2.5 Constant

- **UPPER_SNAKE_CASE**

```java
✅ private static final int MAX_PENDING_BOOKINGS = 3;
✅ private static final long OTP_TTL_MINUTES = 5;
✅ public static final String BEARER_PREFIX = "Bearer ";

❌ private static final int maxPending = 3;
❌ private static final int MAX_PENDING = 3; // thiếu ngữ cảnh
```

### 2.6 Enum

- Tên enum: **PascalCase**
- Giá trị enum: **UPPER_SNAKE_CASE**

```java
✅ public enum BookingStatus { PENDING, CONFIRMED, IN_PROGRESS, DONE, CANCELLED }
✅ public enum Tier { MEMBER, SILVER, GOLD, PLATINUM }

❌ public enum bookingStatus { pending, confirmed }
❌ public enum TIER { Member, Silver }
```

### 2.7 Database & Flyway

- Tên bảng: **snake_case**, số nhiều
- Tên cột: **snake_case**
- File migration: `V{number}__{description}.sql`

```sql
✅ customers, wash_history, customer_points
✅ customer_id, full_name, scheduled_at
✅ V1__init_schema.sql
✅ V2__add_password_column.sql

❌ Customer, WashHistory
❌ customerId, fullName
❌ V1_init.sql
```

---

## 3. Cấu trúc code

### 3.1 Thứ tự khai báo trong Class

```java
public class CustomerService {

    // 1. Constants
    private static final int MAX_VEHICLES = 5;

    // 2. Dependencies (inject qua constructor — dùng @RequiredArgsConstructor)
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    // 3. Public methods (business logic chính)
    public CustomerResponse getCustomerById(UUID id) { ... }
    public CustomerResponse updateCustomer(UUID id, UpdateCustomerRequest request) { ... }

    // 4. Private helper methods
    private CustomerResponse mapToResponse(Customer customer) { ... }
    private void validatePhone(String phone) { ... }
}
```

### 3.2 Controller — chỉ làm 3 việc

```java
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customer", description = "Quản lý khách hàng")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable UUID id) {
        // 1. Nhận request
        // 2. Gọi service
        // 3. Trả response
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }
}
```

> ❌ **Không** viết business logic trong Controller
> ❌ **Không** gọi Repository trực tiếp từ Controller

### 3.3 Service — nơi chứa business logic

```java
@Service
@RequiredArgsConstructor
@Transactional  // đặt ở class level cho write operations
public class CustomerService {

    public CustomerResponse getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy khách hàng: " + id));
        return mapToResponse(customer);
    }
}
```

> ❌ **Không** dùng `@Autowired` field injection — dùng constructor injection
> ✅ **Luôn** dùng `@RequiredArgsConstructor` + `final` field

### 3.4 Repository — chỉ chứa query

```java
@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    // Method name query — ưu tiên dùng
    Optional<Customer> findByPhone(String phone);
    boolean existsByPhone(String phone);

    // JPQL — khi query phức tạp hơn
    @Query("SELECT c FROM Customer c WHERE c.tier IN :tiers AND c.isActive = true")
    List<Customer> findActiveCustomersByTiers(@Param("tiers") List<Tier> tiers);
}
```

> ❌ **Không** viết business logic trong Repository
> ❌ **Không** dùng native SQL trừ khi thật sự cần

---

## 4. DTO Rules

### 4.1 Tách biệt Request và Response

```
dto/
├── request/
│   ├── LoginRequest.java       ← nhận từ client
│   └── CreateBookingRequest.java
└── response/
    ├── AuthResponse.java       ← trả về cho client
    └── CustomerResponse.java
```

### 4.2 Không expose Entity ra ngoài Controller

```java
// ✅ Đúng — trả DTO
public ResponseEntity<CustomerResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(customerService.getCustomerById(id));
}

// ❌ Sai — trả Entity trực tiếp
public ResponseEntity<Customer> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(customerRepository.findById(id).get());
}
```

### 4.3 Validation trong Request DTO

```java
public class CreateBookingRequest {

    @NotNull(message = "Vehicle ID không được để trống")
    private UUID vehicleId;

    @NotNull(message = "Loại dịch vụ không được để trống")
    private ServiceType serviceType;

    @NotNull(message = "Thời gian hẹn không được để trống")
    @Future(message = "Thời gian hẹn phải trong tương lai")
    private LocalDateTime scheduledAt;
}
```

---

## 5. Exception Handling

### 5.1 Dùng custom exception, không throw Exception chung

```java
// ✅ Đúng
throw new ResourceNotFoundException("Không tìm thấy booking: " + id);
throw new BusinessException("Không thể hủy booking trong vòng 2 tiếng");

// ❌ Sai
throw new Exception("Error");
throw new RuntimeException("Not found");
```

### 5.2 Không dùng try-catch trừ khi cần thiết

```java
// ✅ Để GlobalExceptionHandler xử lý
public Customer findById(UUID id) {
    return customerRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy: " + id));
}

// ❌ Không catch rồi bỏ qua
try {
    return customerRepository.findById(id).get();
} catch (Exception e) {
    return null;  // ❌ tuyệt đối không làm thế này
}
```

---

## 6. Format code

### 6.1 Indentation & Spacing

- Dùng **4 spaces**, không dùng tab
- Giữa các method có 1 dòng trắng
- Không để trailing whitespace

### 6.2 Độ dài dòng

- Tối đa **120 ký tự** mỗi dòng
- Nếu dài hơn thì xuống dòng

```java
// ✅ Đúng — xuống dòng hợp lý
Customer customer = customerRepository
    .findByPhone(request.getPhone())
    .orElseThrow(() ->
        new BusinessException("Số điện thoại hoặc mật khẩu không đúng"));

// ❌ Sai — quá dài 1 dòng
Customer customer = customerRepository.findByPhone(request.getPhone()).orElseThrow(() -> new BusinessException("Số điện thoại hoặc mật khẩu không đúng"));
```

### 6.3 Imports

- Không dùng wildcard import `*`
- Xóa import không dùng trước khi commit

```java
// ✅ Đúng
import com.autowash.autowash_pro.entity.Customer;
import com.autowash.autowash_pro.enums.Tier;

// ❌ Sai
import com.autowash.autowash_pro.entity.*;
import com.autowash.autowash_pro.enums.*;
```

---

## 7. Annotation Rules

### 7.1 Lombok — bắt buộc dùng

```java
// ✅ Entity
@Entity
@Table(name = "customers")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer { ... }

// ✅ Service / Component
@Service
@RequiredArgsConstructor  // thay cho @Autowired
public class CustomerService {
    private final CustomerRepository customerRepository; // phải là final
}
```

### 7.2 Transactional

```java
// ✅ Class level cho service có nhiều write operation
@Service
@Transactional
public class LoyaltyService { ... }

// ✅ Method level cho read-only
@Transactional(readOnly = true)
public CustomerResponse getCustomerById(UUID id) { ... }

// ❌ Không đặt @Transactional ở Controller
```

---

## 8. API Design

### 8.1 URL naming

- **Danh từ số nhiều**, chữ thường, dùng `-` phân cách

```
✅ GET    /api/customers
✅ GET    /api/customers/{id}
✅ POST   /api/customers
✅ PUT    /api/customers/{id}
✅ DELETE /api/customers/{id}
✅ GET    /api/customers/{id}/vehicles
✅ POST   /api/bookings/{id}/cancel

❌ GET    /api/getCustomer
❌ POST   /api/createBooking
❌ GET    /api/Customer
```

### 8.2 HTTP Status Code

| Trường hợp                             | Status                      |
| -------------------------------------- | --------------------------- |
| Lấy data thành công                    | `200 OK`                    |
| Tạo mới thành công                     | `201 Created`               |
| Cập nhật/xóa thành công, không có body | `204 No Content`            |
| Lỗi input từ client                    | `400 Bad Request`           |
| Chưa đăng nhập                         | `401 Unauthorized`          |
| Không có quyền                         | `403 Forbidden`             |
| Không tìm thấy                         | `404 Not Found`             |
| Lỗi server                             | `500 Internal Server Error` |

### 8.3 Response format thống nhất

```json
// ✅ Success
{
  "customerId": "uuid",
  "fullName": "Nguyen Van A",
  "tier": "GOLD"
}

// ✅ Error — dùng ErrorResponse
{
  "code": "NOT_FOUND",
  "message": "Không tìm thấy khách hàng"
}
```

---

## 9. Comment & Javadoc

### 9.1 Khi nào cần comment

- Comment giải thích **tại sao**, không giải thích **cái gì**
- Code rõ ràng thì không cần comment

```java
// ✅ Comment giải thích logic nghiệp vụ
// Dùng FIFO: điểm tích sớm nhất hết hạn trước
// để đảm bảo khách dùng điểm cũ trước khi hết hạn
List<CustomerPoints> points = pointsRepo
    .findByCustomerOrderByCreatedAtAsc(customer);

// ❌ Comment thừa — code đã tự nói lên điều đó
// Lấy customer theo id
Customer customer = customerRepository.findById(id);
```

### 9.2 TODO comment

- Dùng `// TODO:` khi có việc chưa làm
- Phải kèm tên người và mô tả

```java
// TODO: [Dev-2] Thêm validation kiểm tra biển số trùng lặp
// TODO: [Dev-4] Cache kết quả tier calculation vào Redis
```

---

## 10. Checklist trước khi commit

```
□ Code compile không có warning
□ Không có import thừa
□ Không có System.out.println() trong code
□ Tên biến, method, class đúng convention
□ Không expose Entity trực tiếp ra Controller
□ Có @Valid trong Controller với request body
□ Custom exception thay vì throw Exception chung
□ Không hardcode string — dùng constant hoặc enum
□ File không quá 300 dòng — nếu dài hơn thì tách class
```

---

_Tài liệu này được maintain bởi Dev 1 (Tech Lead). Mọi thay đổi convention phải được team đồng ý trước khi cập nhật._
