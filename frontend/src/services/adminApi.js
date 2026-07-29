import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

const adminApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function unwrapList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.result)) return data.result;

  return [];
}

function normalizeCustomer(customer) {
  if (!customer || typeof customer !== "object") return customer;

  const nestedCustomer = customer.customer || {};

  const fullName =
    customer.full_name ??
    customer.fullName ??
    customer.fullname ??
    customer.customer_name ??
    customer.customerName ??
    customer.name ??
    nestedCustomer.full_name ??
    nestedCustomer.fullName ??
    nestedCustomer.name ??
    "";

  const customerId =
    customer.customer_id ??
    customer.customerId ??
    customer.id ??
    nestedCustomer.customer_id ??
    nestedCustomer.customerId ??
    nestedCustomer.id;

  return {
    ...customer,
    customer_id: customerId,
    customerId,
    full_name: fullName,
    fullName,
    phone:
      customer.phone ??
      customer.customer_phone ??
      customer.customerPhone ??
      nestedCustomer.phone ??
      "",
    email: customer.email ?? nestedCustomer.email ?? "",
    tier: customer.tier ?? nestedCustomer.tier ?? "MEMBER",
    total_points:
      customer.total_points ??
      customer.totalPoints ??
      nestedCustomer.total_points ??
      nestedCustomer.totalPoints ??
      0,
    totalPoints:
      customer.totalPoints ??
      customer.total_points ??
      nestedCustomer.totalPoints ??
      nestedCustomer.total_points ??
      0,
    lifetime_points:
      customer.lifetime_points ??
      customer.lifetimePoints ??
      nestedCustomer.lifetime_points ??
      nestedCustomer.lifetimePoints ??
      0,
    lifetimePoints:
      customer.lifetimePoints ??
      customer.lifetime_points ??
      nestedCustomer.lifetimePoints ??
      nestedCustomer.lifetime_points ??
      0,
    total_visits:
      customer.total_visits ??
      customer.totalVisits ??
      customer.wash_count ??
      customer.washCount ??
      nestedCustomer.total_visits ??
      nestedCustomer.totalVisits ??
      0,
    totalVisits:
      customer.totalVisits ??
      customer.total_visits ??
      customer.washCount ??
      customer.wash_count ??
      nestedCustomer.totalVisits ??
      nestedCustomer.total_visits ??
      0,
    total_spend:
      customer.total_spend ??
      customer.totalSpend ??
      nestedCustomer.total_spend ??
      nestedCustomer.totalSpend ??
      0,
    totalSpend:
      customer.totalSpend ??
      customer.total_spend ??
      nestedCustomer.totalSpend ??
      nestedCustomer.total_spend ??
      0,
    registered_at:
      customer.registered_at ??
      customer.registeredAt ??
      customer.created_at ??
      customer.createdAt ??
      nestedCustomer.registered_at ??
      nestedCustomer.registeredAt ??
      null,
    registeredAt:
      customer.registeredAt ??
      customer.registered_at ??
      customer.createdAt ??
      customer.created_at ??
      nestedCustomer.registeredAt ??
      nestedCustomer.registered_at ??
      null,
    last_visit_at:
      customer.last_visit_at ??
      customer.lastVisitAt ??
      customer.last_wash_at ??
      customer.lastWashAt ??
      nestedCustomer.last_visit_at ??
      nestedCustomer.lastVisitAt ??
      null,
    lastVisitAt:
      customer.lastVisitAt ??
      customer.last_visit_at ??
      customer.lastWashAt ??
      customer.last_wash_at ??
      nestedCustomer.lastVisitAt ??
      nestedCustomer.last_visit_at ??
      null,
    is_active:
      customer.is_active ??
      customer.isActive ??
      nestedCustomer.is_active ??
      nestedCustomer.isActive ??
      true,
    isActive:
      customer.isActive ??
      customer.is_active ??
      nestedCustomer.isActive ??
      nestedCustomer.is_active ??
      true,
    is_admin:
      customer.is_admin ??
      customer.isAdmin ??
      nestedCustomer.is_admin ??
      nestedCustomer.isAdmin ??
      false,
    isAdmin:
      customer.isAdmin ??
      customer.is_admin ??
      nestedCustomer.isAdmin ??
      nestedCustomer.is_admin ??
      false,
  };
}

function normalizeCustomerList(data) {
  return unwrapList(data, ["customers"]).map(normalizeCustomer);
}

function normalizeBooking(booking) {
  if (!booking || typeof booking !== "object") return booking;

  return {
    ...booking,
    booking_id: booking.booking_id ?? booking.bookingId ?? booking.id,
    bookingId: booking.bookingId ?? booking.booking_id ?? booking.id,

    customer_name:
      booking.customer_name ??
      booking.customerName ??
      booking.customer?.full_name ??
      booking.customer?.fullName ??
      booking.customer?.name ??
      "",
    customerName:
      booking.customerName ??
      booking.customer_name ??
      booking.customer?.fullName ??
      booking.customer?.full_name ??
      booking.customer?.name ??
      "",

    customer_phone:
      booking.customer_phone ??
      booking.customerPhone ??
      booking.customer?.phone ??
      "",
    customerPhone:
      booking.customerPhone ??
      booking.customer_phone ??
      booking.customer?.phone ??
      "",

    vehicle_name:
      booking.vehicle_name ??
      booking.vehicleName ??
      booking.vehicle?.license_plate ??
      booking.vehicle?.licensePlate ??
      booking.vehicle?.plate_number ??
      booking.vehicle?.plateNumber ??
      "",
    vehicleName:
      booking.vehicleName ??
      booking.vehicle_name ??
      booking.vehicle?.licensePlate ??
      booking.vehicle?.license_plate ??
      booking.vehicle?.plateNumber ??
      booking.vehicle?.plate_number ??
      "",

    service_name:
      booking.service_name ??
      booking.serviceName ??
      booking.service?.name ??
      booking.service?.service_name ??
      booking.service?.serviceName ??
      "",
    serviceName:
      booking.serviceName ??
      booking.service_name ??
      booking.service?.name ??
      booking.service?.serviceName ??
      booking.service?.service_name ??
      "",

    booking_time:
      booking.booking_time ??
      booking.bookingTime ??
      booking.scheduled_at ??
      booking.scheduledAt ??
      booking.date ??
      null,
    bookingTime:
      booking.bookingTime ??
      booking.booking_time ??
      booking.scheduledAt ??
      booking.scheduled_at ??
      booking.date ??
      null,

    total_amount:
      booking.total_amount ??
      booking.totalAmount ??
      booking.total_price ??
      booking.totalPrice ??
      booking.price ??
      0,
    totalAmount:
      booking.totalAmount ??
      booking.total_amount ??
      booking.totalPrice ??
      booking.total_price ??
      booking.price ??
      0,
  };
}

function normalizeBookingList(data) {
  return unwrapList(data, ["bookings"]).map(normalizeBooking);
}

export const adminCustomersApi = {
  getCustomers() {
    return adminApiClient
      .get("/api/admin/customers")
      .then((res) => normalizeCustomerList(res.data));
  },

  createCustomer(customerData) {
    return adminApiClient
      .post("/api/admin/customers", customerData)
      .then((res) => normalizeCustomer(res.data));
  },

  getCustomerById(id) {
    return adminApiClient
      .get(`/api/admin/customers/${id}`)
      .then((res) => normalizeCustomer(res.data));
  },

  updateCustomer(id, customerData) {
    return adminApiClient
      .put(`/api/admin/customers/${id}`, customerData)
      .then((res) => normalizeCustomer(res.data));
  },

  disableCustomer(id) {
    return adminApiClient
      .delete(`/api/admin/customers/${id}`)
      .then((res) => res.data);
  },

  getCustomerVehicles(id) {
    return adminApiClient
      .get(`/api/admin/customers/${id}/vehicles`)
      .then((res) => res.data);
  },

  getCustomerHistory(id) {
    return adminApiClient
      .get(`/api/admin/customers/${id}/history`)
      .then((res) => res.data);
  },
};

export const adminBookingsApi = {
  getBookings(filters = {}) {
    const params = {};

    if (filters.status) params.status = filters.status;
    if (filters.date) params.date = filters.date;

    return adminApiClient
      .get("/api/admin/bookings", { params })
      .then((res) => normalizeBookingList(res.data));
  },

  updateBookingStatus(bookingId, status) {
    return adminApiClient
      .patch(`/api/admin/bookings/${bookingId}/status`, { status })
      .then((res) => normalizeBooking(res.data));
  },
};

export default {
  customers: adminCustomersApi,
  bookings: adminBookingsApi,
};