import {
  clearAuthToken,
  getAuthHeaders,
  getAuthToken,
  setAuthToken,
} from "./token.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendAuthRequest(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }
    throw new Error(
      responseBody.message || "Request failed. Please try again.",
    );
  }

  if (responseBody?.token) {
    setAuthToken(responseBody.token);
  }

  return responseBody;
}

async function sendAuthenticatedRequest(path, options = {}) {
  const headers = getAuthHeaders(options.headers || {});
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      responseBody.message || "Request failed. Please try again.",
    );
  }

  return responseBody;
}

export function registerUser(payload) {
  return sendAuthRequest("/api/auth/user/register", payload);
}

export function loginUser(payload) {
  return sendAuthRequest("/api/auth/user/login", payload);
}

export function loginWithGoogle(payload) {
  return sendAuthRequest("/api/auth/user/google", payload);
}

export async function fetchCurrentUser() {
  try {
    if (!getAuthToken()) {
      return null;
    }
    return await sendAuthenticatedRequest("/api/user/profile/optional");
  } catch {
    return null;
  }
}

export function updateUserProfile(payload) {
  const formData = new FormData();

  if (payload.username) formData.append("username", payload.username);
  if (payload.email) formData.append("email", payload.email);
  if (payload.password) formData.append("password", payload.password);
  if (payload.profilePictureFile) {
    formData.append("profilePicture", payload.profilePictureFile);
  }

  return sendAuthenticatedRequest("/api/user/update", {
    method: "PUT",
    body: formData,
  });
}

export async function logoutUser() {
  try {
    return await sendAuthenticatedRequest("/api/user/logout");
  } finally {
    clearAuthToken();
  }
}
