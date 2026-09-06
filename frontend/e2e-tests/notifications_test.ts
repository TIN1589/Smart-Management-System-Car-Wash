Feature('Notifications UI');

Scenario('Customer can view notification center and unread summary', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/notifications');

  I.waitForText('Trung tâm thông báo', 10);
  I.see('Xác nhận đặt lịch');
  I.see('Cộng điểm thành công');
  I.see('Bạn có 2 thông báo mới cần xem trong hôm nay.');
  I.see('Đánh dấu đã đọc');
});