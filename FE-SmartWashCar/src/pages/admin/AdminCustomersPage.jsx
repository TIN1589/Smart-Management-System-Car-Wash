import { useEffect, useMemo, useState } from "react";
import { adminCustomersApi } from "../../services/adminApi";

const tiers = ["MEMBER", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

function getCustomerId(customer) {
  return customer.customer_id || customer.customerId || customer.id;
}

function getCustomerName(customer) {
  return (
    customer.full_name ||
    customer.fullName ||
    customer.fullname ||
    customer.customer_name ||
    customer.customerName ||
    customer.name ||
    customer.customer?.full_name ||
    customer.customer?.fullName ||
    customer.customer?.name ||
    "Không có tên"
  );
}

function getInitials(customer) {
  return getCustomerName(customer)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedTiers, setSelectedTiers] = useState(tiers);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError("");

      const data = await adminCustomersApi.getCustomers();
      console.log("Customers API normalized:", data);

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi lấy danh sách khách hàng:", err);
      setCustomers([]);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách khách hàng."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return customers.filter((customer) => {
      const customerTier = customer.tier || "MEMBER";

      const matchTier =
        selectedTiers.length === 0 || selectedTiers.includes(customerTier);

      const matchKeyword =
        !text ||
        getCustomerName(customer).toLowerCase().includes(text) ||
        String(customer.phone || "").toLowerCase().includes(text) ||
        String(customer.email || "").toLowerCase().includes(text) ||
        String(getCustomerId(customer) || "").toLowerCase().includes(text);

      return matchTier && matchKeyword;
    });
  }, [customers, keyword, selectedTiers]);

  const allVisibleSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers
      .map(getCustomerId)
      .filter(Boolean)
      .every((id) => selectedIds.includes(id));

  function toggleTier(tier) {
    setSelectedTiers((current) =>
      current.includes(tier)
        ? current.filter((item) => item !== tier)
        : [...current, tier]
    );
  }

  function toggleCustomer(customerId) {
    setSelectedIds((current) =>
      current.includes(customerId)
        ? current.filter((id) => id !== customerId)
        : [...current, customerId]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredCustomers.map(getCustomerId).filter(Boolean));
  }

  return (
    <main className="admin-customers-page">
      <section className="admin-page-header">
        <div>
          <h1>Quản lý khách hàng</h1>
          <p>
            Hiển thị: {filteredCustomers.length} / {customers.length} khách hàng
            {loading ? " - đang tải..." : ""}
          </p>
        </div>

        <div className="admin-page-actions">
          <button type="button" onClick={fetchCustomers} disabled={loading}>
            Làm mới
          </button>
          <button type="button">+ Thêm khách hàng</button>
        </div>
      </section>

      {error ? <div className="admin-error">{error}</div> : null}

      <section className="admin-filter-bar">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên, số điện thoại, email..."
        />

        <div className="admin-tier-filter">
          <span>Hạng thẻ:</span>

          {tiers.map((tier) => (
            <label key={tier}>
              <input
                type="checkbox"
                checked={selectedTiers.includes(tier)}
                onChange={() => toggleTier(tier)}
              />
              {tier}
            </label>
          ))}
        </div>
      </section>

      {selectedIds.length > 0 ? (
        <section className="admin-selected-bar">
          <strong>{selectedIds.length} mục đã chọn</strong>

          <div>
            <button type="button">Gửi thông báo</button>
            <button type="button">Export file CSV</button>
          </div>
        </section>
      ) : null}

      <section className="admin-table-card">
        <table className="admin-customers-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                />
              </th>
              <th>Khách hàng</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Hạng</th>
              <th>Điểm</th>
              <th>Điểm tích lũy</th>
              <th>Số lần rửa</th>
              <th>Tổng chi</th>
              <th>Ngày đăng ký</th>
              <th>Lần cuối</th>
              <th>Trạng thái</th>
              <th>Admin</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer) => {
              const customerId = getCustomerId(customer);
              const isActive = customer.is_active ?? customer.isActive ?? true;
              const isAdmin = customer.is_admin ?? customer.isAdmin ?? false;

              return (
                <tr key={customerId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(customerId)}
                      onChange={() => toggleCustomer(customerId)}
                    />
                  </td>

                  <td>
                    <div className="admin-customer-cell">
                      <span className="admin-customer-avatar">
                        {getInitials(customer)}
                      </span>

                      <div>
                        <strong>{getCustomerName(customer)}</strong>
                        <span>ID: {customerId || "-"}</span>
                      </div>
                    </div>
                  </td>

                  <td>{customer.phone || "-"}</td>
                  <td>{customer.email || "-"}</td>

                  <td>
                    <span className="admin-tier-badge">
                      {customer.tier || "MEMBER"}
                    </span>
                  </td>

                  <td>{formatNumber(customer.total_points ?? customer.totalPoints)}</td>

                  <td>
                    {formatNumber(
                      customer.lifetime_points ?? customer.lifetimePoints
                    )}
                  </td>

                  <td>{formatNumber(customer.total_visits ?? customer.totalVisits)}</td>

                  <td>{formatMoney(customer.total_spend ?? customer.totalSpend)}</td>

                  <td>{formatDate(customer.registered_at ?? customer.registeredAt)}</td>

                  <td>{formatDate(customer.last_visit_at ?? customer.lastVisitAt)}</td>

                  <td>{isActive ? "Hoạt động" : "Vô hiệu"}</td>

                  <td>{isAdmin ? "Có" : "Không"}</td>
                </tr>
              );
            })}

            {!loading && filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={13}>Không có khách hàng phù hợp.</td>
              </tr>
            ) : null}

            {loading ? (
              <tr>
                <td colSpan={13}>Đang tải dữ liệu khách hàng...</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
}