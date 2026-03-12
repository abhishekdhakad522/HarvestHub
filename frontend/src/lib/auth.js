const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendAuthRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody.message || "Request failed. Please try again.");
  }

  return responseBody;
}

export function registerUser(payload) {
  return sendAuthRequest("/api/auth/user/register", payload);
}

export function loginUser(payload) {
  return sendAuthRequest("/api/auth/user/login", payload);
}