Feature('SCRUM-14: Kiem thu chuc nang Hien thi danh sach nguoi dung');

Scenario('TC_UL_01: Verify giao dien danh sach khach hang Admin', async ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0395939056');
  I.fillField('Mật khẩu', '123456');
  I.click('Đăng nhập');
  I.wait(2);
  I.amOnPage('/admin/customer');
  I.wait(2);
  I.saveScreenshot('proof_scrum14_user_list.png');
});