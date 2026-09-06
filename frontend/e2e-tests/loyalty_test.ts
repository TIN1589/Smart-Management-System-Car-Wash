Feature('Loyalty UI');

Scenario('Customer can view loyalty information and use history filter', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/loyalty');

  I.waitForText('Lịch sử điểm thưởng', 10);
  I.see('Quyền lợi Platinum đang chờ bạn');
  I.see('Tiến trình lên');

  I.click('Tích lũy');
  I.see('Tích lũy');
});