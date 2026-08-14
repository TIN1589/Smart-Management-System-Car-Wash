Feature('SCRUM-17: Kiem thu chuc nang Hien thi danh sach dich vu');

Scenario('TC_SRV_01: Verify giao dien danh sach Dich vu tren he thong', async ({ I }) => {
  // 1. Dang nhap Admin
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0395939056');
  I.fillField('Mật khẩu', '123456');
  I.click('Đăng nhập');
  I.wait(2);

  // 2. Vao thang trang Quan ly Dich vu & Combo
  I.amOnPage('/admin/services');
  I.wait(2);

  // 3. Chup anh bang chung danh sach dich vu
  I.saveScreenshot('proof_scrum17_service_list.png');
});