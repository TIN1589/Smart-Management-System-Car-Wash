Feature('Booking History UI');

Scenario('Customer can access booking history and switch filters', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/history');

  I.waitForText('Đặc quyền hội viên vàng', 10);
  I.see('Tất cả');
  I.see('Sắp tới');
  I.see('Hoàn thành');
  I.see('Đã hủy');

  I.click('Đã hủy');
  I.see('Đặc quyền hội viên vàng');
});