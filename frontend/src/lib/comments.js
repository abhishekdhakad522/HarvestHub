const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function sendCommentRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody.message || "Comment request failed.");
  }

  return responseBody;
}

export function getCommentsByPost(postId) {
  return sendCommentRequest(`/api/comments/post/${postId}?limit=50&sort=oldest`);
}

export function createComment(payload) {
  return sendCommentRequest("/api/comments/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function updateComment(commentId, payload) {
  return sendCommentRequest(`/api/comments/update/${commentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}