Feature('Articles UI');

Scenario('Customer can search articles with no matching result', ({ I }) => {
  I.amOnPage('/login');
  I.fillField('Email hoặc Số điện thoại', '0868123490');
  I.fillField('Mật khẩu', '123456');
  I.click({ css: 'button[type="submit"]' });
  I.wait(3);

  I.amOnPage('/articles');

  I.waitForText('Kinh nghiệm chăm sóc & Dịch vụ xe', 10);
  I.see('Tất cả');
  I.see('Kinh nghiệm chăm sóc');
  I.see('Thông tin dịch vụ');

  I.fillField(
    { css: 'input[placeholder="Tìm kiếm bài viết..."]' },
    'CODECEPT_KHONG_CO_BAI_VIET_999'
  );

  I.waitForText('Không tìm thấy bài viết nào phù hợp.', 10);
});