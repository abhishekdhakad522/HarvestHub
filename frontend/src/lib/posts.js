const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendPostRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody.message || "Unable to load articles.");
  }

  return responseBody;
}

export function getPublishedPosts() {
  return sendPostRequest("/api/posts?limit=24");
}

export function getMyPosts() {
  return sendPostRequest("/api/posts/my/posts?limit=24");
}

export function getPostById(postId) {
  return sendPostRequest(`/api/posts/${postId}`);
}

export function incrementPostViews(postId) {
  return sendPostRequest(`/api/posts/${postId}/view`, {
    method: "POST",
  });
}

export function createPost(formData) {
  return sendPostRequest("/api/posts/create", {
    method: "POST",
    body: formData, // FormData — browser sets Content-Type automatically
  });
}