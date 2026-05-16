import { getAuthHeaders } from "./token.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendOrderRequest(path, { method = "GET", payload } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody.message || "Order request failed.");
  }

  return responseBody;
}

export function createOrder(payload) {
  return sendOrderRequest("/api/orders/create", {
    method: "POST",
    payload,
  });
}

export function createRazorpayOrder(payload) {
  return sendOrderRequest("/api/orders/create-razorpay-order", {
    method: "POST",
    payload,
  });
}

export function verifyRazorpayPayment(payload) {
  return sendOrderRequest("/api/orders/verify-razorpay-payment", {
    method: "POST",
    payload,
  });
}

export function getMyOrders({ page = 1, limit = 10 } = {}) {
  return sendOrderRequest(`/api/orders/my-orders?page=${page}&limit=${limit}`);
}

export function getSellerOrders({ page = 1, limit = 10 } = {}) {
  return sendOrderRequest(`/api/orders/seller-orders?page=${page}&limit=${limit}`);
}

export function getOrderById(orderId) {
  return sendOrderRequest(`/api/orders/${orderId}`);
}

export function updateOrderStatus(orderId, orderStatus) {
  return sendOrderRequest(`/api/orders/update-status/${orderId}`, {
    method: "PUT",
    payload: { orderStatus },
  });
}

export function cancelOrder(orderId) {
  return sendOrderRequest(`/api/orders/cancel/${orderId}`, {
    method: "PUT",
  });
}
