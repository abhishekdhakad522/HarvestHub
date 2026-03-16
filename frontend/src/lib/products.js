const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendProductRequest(path, { method = "GET", payload, formData } = {}) {
  const isFormData = formData instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    ...(isFormData
      ? { body: formData } // browser sets Content-Type with boundary automatically
      : payload
      ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      : {}),
  });

  const rawBody = await response.text();
  let responseBody = {};

  try {
    responseBody = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    responseBody = { raw: rawBody };
  }

  if (!response.ok) {
    throw new Error(
      responseBody.message ||
        responseBody.error ||
        (typeof responseBody.raw === "string" && responseBody.raw.trim()
          ? `Product request failed (${response.status}): ${responseBody.raw.slice(0, 140)}`
          : `Product request failed (${response.status}).`),
    );
  }

  return responseBody;
}

export function getProducts({ page = 1, limit = 9 } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return sendProductRequest(`/api/products?${query.toString()}`);
}

export function getProductById(productId) {
  return sendProductRequest(`/api/products/${productId}`);
}

export function getMyProducts() {
  return sendProductRequest("/api/products/my/products?limit=50");
}

export function createProduct(formData) {
  return sendProductRequest("/api/products/create", {
    method: "POST",
    formData,
  });
}

export function updateProduct(productId, formData) {
  return sendProductRequest(`/api/products/update/${productId}`, {
    method: "PUT",
    formData,
  });
}
