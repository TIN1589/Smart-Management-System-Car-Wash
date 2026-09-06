Feature('Promotions UI');

Scenario('Customer can view the used promotions tab', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/promotions');

  I.waitForText('Đang có', 10);
  I.see('Đã dùng');

  I.click('Đã dùng');

  I.see('Giảm 50% Combo Thu');
  I.see('Hết hạn: 01/10/2026');
});