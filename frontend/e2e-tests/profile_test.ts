Feature('Profile UI');

Scenario('Profile validates mismatched new passwords', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/profile');

  I.waitForText('Thông tin cá nhân', 10);
  I.see('ĐỔI MẬT KHẨU');

  I.fillField(
    { css: 'input[placeholder="Nhập mật khẩu cũ"]' },
    '123456'
  );
  I.fillField(
    { css: 'input[placeholder="Nhập mật khẩu mới"]' },
    'Test123456'
  );
  I.fillField(
    { css: 'input[placeholder="Xác nhận mật khẩu"]' },
    'Test123457'
  );

  I.click('Cập nhật mật khẩu');

  I.see('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.');
});