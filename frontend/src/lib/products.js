const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendProductRequest(path, { method = "GET", payload } = {}) {
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
    throw new Error(responseBody.message || "Product request failed.");
  }

  return responseBody;
}

export function getProducts() {
  return sendProductRequest("/api/products?limit=50");
}

export function getMyProducts() {
  return sendProductRequest("/api/products/my/products?limit=50");
}

export function createProduct(payload) {
  return sendProductRequest("/api/products/create", {
    method: "POST",
    payload,
  });
}
