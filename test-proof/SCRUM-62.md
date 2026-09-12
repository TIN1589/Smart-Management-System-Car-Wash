SCRUM-62 Fix Defects Found from Testing

Da phan tich va khac phuc loi 500/400 khi cap nhat trang thai booking.

Nguyen nhan:
- Goi sai URL (thieu /status)
- Chuyen trang thai khong hop le (IN_PROGRESS sang CONFIRMED)

Cach khac phuc:
- Su dung dung endpoint: PATCH /api/admin/bookings/{id}/status
- Chi chuyen trang thai theo quy tac: PENDING -> CONFIRMED -> IN_PROGRESS -> DONE

Ket qua: API tra ve 200 OK thanh cong.
