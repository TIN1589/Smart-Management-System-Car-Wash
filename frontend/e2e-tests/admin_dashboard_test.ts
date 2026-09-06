Feature('Admin Access Control UI');

Scenario('Customer is redirected when trying to access Admin dashboard', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/admin');
  I.wait(1);

  I.seeInCurrentUrl('/dashboard');
});