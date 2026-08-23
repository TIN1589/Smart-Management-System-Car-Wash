Feature('Authentication UI');

Scenario('Login - password less than 6 characters shows validation error', ({ I }) => {
  I.amOnPage('/login');

  I.fillField('Email hoặc Số điện thoại', '0868103349');
  I.fillField('Mật khẩu', '12345');
  I.click({ css: 'button[type="submit"]' });

  I.see('Mật khẩu phải có ít nhất 6 ký tự.');
});

Scenario('Register - full name with 1 character shows validation error', ({ I }) => {
  I.amOnPage('/register');

  I.fillField('Họ tên', 'A');
  I.fillField('Email', 'bva.test@gmail.com');
  I.fillField('Số điện thoại', '868123456');
  I.fillField('Mật khẩu', 'Test123456');
  I.fillField('Xác nhận mật khẩu', 'Test123456');
  I.click({ css: 'button[type="submit"]' });

  I.see('Họ tên phải có ít nhất 2 ký tự.');
});

Scenario('Register - mismatched password shows validation error', ({ I }) => {
  I.amOnPage('/register');

  I.fillField('Họ tên', 'Nguyen Thanh Nhut');
  I.fillField('Email', 'test.mismatch@gmail.com');
  I.fillField('Số điện thoại', '868123457');
  I.fillField('Mật khẩu', 'Test123456');
  I.fillField('Xác nhận mật khẩu', 'Test123457');
  I.click({ css: 'button[type="submit"]' });

  I.see('Xác nhận mật khẩu không khớp.');
});