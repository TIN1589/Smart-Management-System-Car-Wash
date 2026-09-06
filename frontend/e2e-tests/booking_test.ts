Feature('Booking UI');

Scenario('Booking requires selecting a time slot', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/booking');
  I.waitForText('Xác nhận đặt lịch', 10);
  I.wait(3);

  I.click('Xác nhận đặt lịch');

  I.see('Vui lòng chọn khung giờ thực hiện');
});