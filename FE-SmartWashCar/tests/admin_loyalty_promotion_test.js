Feature('Admin - Loyalty & Promotions Tests');

Scenario('TC-ADM-01 & 02: Kiểm tra hiển thị cấu hình Loyalty và Promotions', async ({ I }) => {
    I.amOnPage('/login');
    I.fillField('Email hoặc Số điện thoại', '0395939056');
    I.fillField('Mật khẩu', '123456');
    I.click('Đăng nhập');
    I.wait(2);

    I.amOnPage('/admin/promotions');
    I.wait(1);
    
    // Khớp chuẩn xác theo tiêu đề thực tế trên trang quản lý
    I.see('Quản lý Khuyến mãi');
});

Scenario('TC-ADM-02 & 04: Kiểm tra cơ chế phân quyền tài khoản', async ({ I }) => {
    I.amOnPage('/admin/loyalty-config');
    I.wait(1);
    I.see('Đăng nhập');
});