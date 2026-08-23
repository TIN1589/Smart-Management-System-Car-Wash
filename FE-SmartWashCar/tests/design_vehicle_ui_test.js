Feature('SCRUM-35: Design Vehicle Management UI');

Scenario('TC_VEH_UI_01: Verify giao dien chi tiet khach hang va thong tin xe', async ({ I }) => {
  // 1. Dang nhap Admin
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0395939056');
  I.fillField('Mật khẩu', '123456');
  I.click('Đăng nhập');
  I.wait(2);

  // 2. Vao trang khach hang va mo Drawer chi tiet xe
  I.amOnPage('/admin/customer');
  I.wait(2);

  // Click vao con mat dong dau tien de mo chi tiet thong tin xe
  I.click('table tbody tr:first-child svg');
  I.wait(2);

  // 3. Chup anh bang chung giao dien UI
  I.saveScreenshot('proof_scrum35_vehicle_ui.png');
});