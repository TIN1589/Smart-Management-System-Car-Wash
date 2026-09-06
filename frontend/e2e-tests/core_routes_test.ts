Feature('Core Client UI Smoke Tests');

Scenario('Customer can access Vehicles page after login', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });

  I.wait(3);
  I.seeInCurrentUrl('/dashboard');

  I.amOnPage('/vehicles');
  I.seeInCurrentUrl('/vehicles');
});

Scenario('Customer can access Booking page after login', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });

  I.wait(1);
  I.amOnPage('/booking');
  I.seeInCurrentUrl('/booking');
});

Scenario('Customer can access Loyalty page after login', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });

  I.wait(1);
  I.amOnPage('/loyalty');
  I.seeInCurrentUrl('/loyalty');
});

Scenario('Unauthenticated user is redirected when accessing Admin page', ({ I }) => {
  I.amOnPage('/admin');

  I.wait(1);
  I.seeInCurrentUrl('/login');
});