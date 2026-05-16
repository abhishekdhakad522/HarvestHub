const TOKEN_STORAGE_KEY = "harvesthub_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return;
  }

  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function getAuthHeaders(existingHeaders = {}) {
  const token = getAuthToken();

  if (!token) {
    return { ...existingHeaders };
  }

  return { ...existingHeaders, Authorization: `Bearer ${token}` };
}
