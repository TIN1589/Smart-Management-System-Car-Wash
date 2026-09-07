Feature('Admin - Articles & Dashboard Tests');

Scenario('TC-ADM-05 & 06: Kiểm tra giao diện Quản lý Bài viết', async ({ I }) => {
    I.amOnPage('/login');
    I.fillField('Email hoặc Số điện thoại', '0395939056');
    I.fillField('Mật khẩu', '123456');
    I.click('Đăng nhập');
    I.wait(2);

    I.amOnPage('/admin/articles');
    I.wait(1);
    I.see('Bài viết');
});

Scenario('TC-ADM-07 & 08: Kiểm tra giao diện Thống kê tổng quan Dashboard', async ({ I }) => {
    I.amOnPage('/login');
    I.fillField('Email hoặc Số điện thoại', '0395939056');
    I.fillField('Mật khẩu', '123456');
    I.click('Đăng nhập');
    I.wait(2);

    I.amOnPage('/admin/dashboard');
    I.wait(1);
    
    // Đổi thành "Bảng điều khiển" theo đúng thực tế hiển thị trên trang
    I.see('Bảng điều khiển'); 
});