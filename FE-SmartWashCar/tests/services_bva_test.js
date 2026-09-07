Feature('Services Module - BVA & EP Tests');

Scenario('TC-SRV-01 & 05: Kiểm tra giá dịch vụ và thời gian dưới biên (Negative Path)', async ({ I }) => {
    I.amOnPage('/login');
    I.fillField('Email hoặc Số điện thoại', '0395939056');
    I.fillField('Mật khẩu', '123456');
    I.click('Đăng nhập');
    I.wait(2);

    I.amOnPage('/admin/services');
    I.wait(1);

    I.click('Tạo dịch vụ / Combo');
    I.wait(1);

    I.fillField('input[placeholder*="Combo Rửa xe"]', 'Test Invalid');
    I.fillField('textarea', 'Mô tả test');
    
    // Dùng CSS kết hợp vị trí tất cả các input kiểu number trên toàn modal
    I.fillField('input[type="number"]', '-1'); // Ô đầu tiên trong grid là Giá
    I.fillField('(//input[@type="number"])[2]', '-5'); // Ô thứ hai trong modal là Thời gian
    
    I.click('Lưu thông tin');
    I.wait(1);
});

Scenario('TC-SRV-04 & 06: Kiểm tra giá dịch vụ và thời gian hợp lệ (Happy Path)', async ({ I }) => {
    I.amOnPage('/login');
    I.fillField('Email hoặc Số điện thoại', '0395939056');
    I.fillField('Mật khẩu', '123456');
    I.click('Đăng nhập');
    I.wait(2);

    I.amOnPage('/admin/services');
    I.wait(1);

    I.click('Tạo dịch vụ / Combo');
    I.wait(1);

    I.fillField('input[placeholder*="Combo Rửa xe"]', 'Test Hợp Lệ');
    I.fillField('textarea', 'Mô tả hợp lệ');
    
    I.fillField('input[type="number"]', '50000');
    I.fillField('(//input[@type="number"])[2]', '30');
    
    I.click('Lưu thông tin');
    I.wait(2);
});