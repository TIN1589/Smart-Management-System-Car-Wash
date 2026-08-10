import { useEffect, useState } from "react";
import { adminBookingsApi } from "../../services/adminApi";

const statuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function getBookingId(booking) {
  return booking.booking_id || booking.bookingId || booking.id;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");

      const data = await adminBookingsApi.getBookings({
        status: status || undefined,
        date: date || undefined,
      });

      console.log("Bookings API normalized:", data);

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách booking:", err);
      setBookings([]);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách booking."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function updateStatus(bookingId, nextStatus) {
    try {
      setLoading(true);
      setError("");

      await adminBookingsApi.updateBookingStatus(bookingId, nextStatus);
      await fetchBookings();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái booking:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật trạng thái booking."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-bookings-page">
      <section className="admin-page-header">
        <div>
          <h1>Quản lý booking</h1>
          <p>
            Hiển thị: {bookings.length} booking
            {loading ? " - đang tải..." : ""}
          </p>
        </div>
      </section>

      {error ? <div className="admin-error">{error}</div> : null}

      <section className="admin-filter-bar">
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả trạng thái</option>

          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <button type="button" onClick={fetchBookings} disabled={loading}>
          Lọc
        </button>
      </section>

      <section className="admin-table-card">
        <table className="admin-bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Xe</th>
              <th>Dịch vụ</th>
              <th>Thời gian</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => {
              const bookingId = getBookingId(booking);

              return (
                <tr key={bookingId}>
                  <td>{bookingId || "-"}</td>
                  <td>{booking.customer_name || booking.customerName || "-"}</td>
                  <td>{booking.customer_phone || booking.customerPhone || "-"}</td>
                  <td>{booking.vehicle_name || booking.vehicleName || "-"}</td>
                  <td>{booking.service_name || booking.serviceName || "-"}</td>
                  <td>{formatDate(booking.booking_time || booking.bookingTime)}</td>
                  <td>{formatMoney(booking.total_amount ?? booking.totalAmount)}</td>
                  <td>{booking.status || "-"}</td>

                  <td>
                    <select
                      value={booking.status || ""}
                      onChange={(event) => updateStatus(bookingId, event.target.value)}
                      disabled={loading || !bookingId}
                    >
                      <option value="" disabled>
                        Chọn trạng thái
                      </option>

                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}

            {!loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={9}>Không có booking phù hợp.</td>
              </tr>
            ) : null}

            {loading ? (
              <tr>
                <td colSpan={9}>Đang tải dữ liệu booking...</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
}