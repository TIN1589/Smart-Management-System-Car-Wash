Feature('SCRUM-16: Kiem thu chuc nang Xoa / Vo hieu hoa nguoi dung');

Scenario('TC_DEL_01: Verify giao dien chi tiet va nut vo hieu hoa khach hang', async ({ I }) => {
  // 1. Đăng nhập hệ thống Admin
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0395939056');
  I.fillField('Mật khẩu', '123456');
  I.click('Đăng nhập');
  I.wait(2);

  // 2. Truy cập trang Quản lý khách hàng
  I.amOnPage('/admin/customer');
  I.wait(2);

  // 3. Click chính xác vào Icon Con mắt (Eye Icon) của hàng đầu tiên
  // Dùng selector nhắm tới SVG icon con mắt hoặc button chứa con mắt
  I.click('table tbody tr:first-child svg'); 
  I.wait(2);

  // 4. Chụp ảnh bằng chứng lúc Drawer chi tiết mở ra (có nút Vô hiệu hóa màu đỏ)
  I.saveScreenshot('proof_scrum16_delete_user.png');
});