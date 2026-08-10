Feature('Kiem thu toan dien giao dien FE SmartWashCar');

Before(({ I }) => {
  I.amOnPage('/');
});

// -------------------------------------------------------------
// Test 1: Bấm "Dịch vụ" -> Hệ thống phải yêu cầu Đăng nhập (/login)
// -------------------------------------------------------------
Scenario('Test 1: Yeu cau dang nhap khi vao trang Dich vu', ({ I }) => {
  I.see('Trả lại vẻ đẹp nguyên bản cho xế yêu');
  
  // Bấm vào Dịch vụ
  I.click('Dịch vụ');
  I.wait(1);

  // SỬA LẠI: Màn hình phải chuyển hướng về trang /login
  I.seeInCurrentUrl('/login');
  I.see('Đăng nhập');
});

// -------------------------------------------------------------
// Test 2: Mở Modal/Trang Đăng nhập thành công
// -------------------------------------------------------------
Scenario('Test 2: Thao tac mo Modal/Trang Dang nhap', ({ I }) => {
  I.click('Đăng nhập');
  I.wait(1);
  I.seeInCurrentUrl('/login');
  I.saveScreenshot('giao-dien-dang-nhap.png');
});

// -------------------------------------------------------------
// Test 3: Bấm "Đặt lịch ngay" -> Chuyển sang form Đăng nhập/Đăng ký
// -------------------------------------------------------------
Scenario('Test 3: Kiem tra luong Dat lich ngay chuyen huong Dang nhap', ({ I }) => {
  I.click('Đặt lịch ngay');
  I.wait(1.5);
  I.saveScreenshot('luong-dat-lich.png');

  // SỬA LẠI: Kiểm tra các đoạn text thực tế hiển thị trên Form
  I.see('Email hoặc Số điện thoại');
  I.see('Mật khẩu');
});

// -------------------------------------------------------------
// Test 4: Kiểm tra Responsive và Cuộn trang
// -------------------------------------------------------------
Scenario('Test 4: Kiem thu phan hoi giao dien (Responsive / Cuon trang)', ({ I }) => {
  I.scrollPageToBottom();
  I.wait(1);
  I.saveScreenshot('footer-trang-web.png');

  I.resizeWindow(390, 844); // Giả lập màn hình iPhone
  I.wait(1);
  I.saveScreenshot('giao-dien-mobile.png');

  I.resizeWindow(1280, 720); // Trả lại kích thước PC
});