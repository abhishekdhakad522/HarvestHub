const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendCartRequest(path, { method = "GET", payload } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody.message || "Cart request failed.");
  }

  return responseBody;
}

export function getCart() {
  return sendCartRequest("/api/cart");
}

export function addToCart(payload) {
  return sendCartRequest("/api/cart/add", {
    method: "POST",
    payload,
  });
}

export function removeFromCart(productId) {
  return sendCartRequest(`/api/cart/remove/${productId}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return sendCartRequest("/api/cart/clear", {
    method: "DELETE",
  });
}
