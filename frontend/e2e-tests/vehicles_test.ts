Feature('Vehicle Management UI');

Scenario('Customer can add a new vehicle successfully', ({ I }) => {
  const suffix = Date.now().toString().slice(-5);
  const licensePlate = `59N-${suffix.slice(0, 3)}.${suffix.slice(3)}`;
  const brand = `Xe Test E2E ${suffix}`;

  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/vehicles');
  I.see('Quản lý xe');

  I.click('Thêm xe');
  I.see('ĐĂNG KÝ XE MỚI');

  I.fillField(
    { css: 'input[placeholder="VD: 51H-123.45"]' },
    licensePlate
  );
  I.selectOption('select', 'CAR');
  I.fillField(
    { css: 'input[placeholder="VD: Toyota Camry"]' },
    brand
  );
  I.fillField(
    { css: 'input[placeholder="VD: Đen ánh kim"]' },
    'Xanh'
  );

  I.click('Đăng ký xe');
  I.waitForText('Thêm phương tiện thành công', 5);
  I.waitForText(brand, 10);
  I.see(licensePlate);;
});