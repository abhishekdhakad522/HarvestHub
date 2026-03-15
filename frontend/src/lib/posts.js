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

export function getPublishedPosts({ page = 1, limit = 18 } = {}) {
  return sendPostRequest(`/api/posts?page=${page}&limit=${limit}`);
}

export function getMyPosts() {
  return sendPostRequest("/api/posts/my/posts?limit=18");
}

export function getPostById(postId) {
  return sendPostRequest(`/api/posts/${postId}`);
}

export function getPostBySlug(slug) {
  return sendPostRequest(`/api/posts/slug/${slug}`);
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

export function updatePost(postId, formData) {
  return sendPostRequest(`/api/posts/update/${postId}`, {
    method: "PUT",
    body: formData,
  });
}

export function deletePost(postId) {
  return sendPostRequest(`/api/posts/delete/${postId}`, {
    method: "DELETE",
  });
}