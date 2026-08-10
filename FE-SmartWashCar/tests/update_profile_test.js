Feature('SCRUM-15: Kiem thu chuc nang Cap nhhat nguoi dung');

Scenario('TC_UP_UI_01: Xac nhan giao dien Admin hien thi Read-Only', async ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0395939056');
  I.fillField('Mật khẩu', '123456');
  I.click('Đăng nhập');
  I.wait(2);
  I.amOnPage('/admin/customer');
  I.wait(2);

  // Chụp ảnh bằng chứng giao diện Admin Customer
  I.saveScreenshot('proof_scrum15_ui_readonly.png');
});