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
    throw new Error(
      responseBody.message || "Request failed. Please try again.",
    );
  }

  return responseBody;
}

async function sendAuthenticatedRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
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
    return await sendAuthenticatedRequest("/api/user/profile");
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

export function logoutUser() {
  return sendAuthenticatedRequest("/api/user/logout");
}
