import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  updateComment,
} from "../lib/comments.js";
import { deletePost, getPostBySlug } from "../lib/posts.js";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";
const DEFAULT_AVATAR = "/default-avatar.svg";

function formatDate(value) {
  if (!value) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ArticleDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentStatus, setCommentStatus] = useState({ type: "idle", message: "" });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [deleteCommentTargetId, setDeleteCommentTargetId] = useState(null);
  const [editStatus, setEditStatus] = useState({ type: "idle", message: "" });
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    };

    loadUser();
    window.addEventListener("harvesthub:authchange", loadUser);

    return () => {
      window.removeEventListener("harvesthub:authchange", loadUser);
    };
  }, []);

  useEffect(() => {
    const loadArticle = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const postResponse = await getPostBySlug(slug);
        const commentResponse = await getCommentsByPost(postResponse._id);

        setPost(postResponse);
        setComments(Array.isArray(commentResponse?.comments) ? commentResponse.comments : []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load this article right now.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      setCommentStatus({ type: "error", message: "Comment cannot be empty." });
      return;
    }

    setEditStatus({ type: "idle", message: "" });
    setIsPostingComment(true);
    setCommentStatus({ type: "idle", message: "" });

    try {
      const response = await createComment({
        postId: post?._id,
        content: commentText.trim(),
      });

      if (response?.comment) {
        setComments((previousValue) => [...previousValue, response.comment]);
      }
      setCommentText("");
      setCommentStatus({ type: "idle", message: "" });
    } catch (error) {
      setCommentStatus({
        type: "error",
        message: error.message || "Unable to add comment right now.",
      });
    } finally {
      setIsPostingComment(false);
    }
  };

  const startEditingComment = (comment) => {
    setCommentStatus({ type: "idle", message: "" });
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.content || "");
    setEditStatus({ type: "idle", message: "" });
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
    setEditStatus({ type: "idle", message: "" });
  };

  const saveEditedComment = async (commentId) => {
    const trimmedContent = editingCommentText.trim();

    if (!trimmedContent) {
      setEditStatus({ type: "error", message: "Comment cannot be empty." });
      return;
    }

    setCommentStatus({ type: "idle", message: "" });
    setIsSavingEdit(true);
    setEditStatus({ type: "idle", message: "" });

    try {
      const response = await updateComment(commentId, { content: trimmedContent });
      if (response?.comment) {
        setComments((previousValue) =>
          previousValue.map((item) =>
            item._id === commentId ? response.comment : item
          )
        );
      }
      setEditingCommentId(null);
      setEditingCommentText("");
      setEditStatus({ type: "idle", message: "" });
    } catch (error) {
      setEditStatus({
        type: "error",
        message: error.message || "Unable to update comment right now.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentStatus({ type: "idle", message: "" });
    setEditStatus({ type: "idle", message: "" });
    setDeletingCommentId(commentId);

    try {
      await deleteComment(commentId);
      setComments((previousValue) =>
        previousValue.filter((item) => item._id !== commentId)
      );
      setDeleteCommentTargetId(null);

      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditingCommentText("");
      }
    } catch (error) {
      setEditStatus({
        type: "error",
        message: error.message || "Unable to delete comment right now.",
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleDeletePost = async () => {
    if (!post?._id) {
      return;
    }

    setIsDeletingPost(true);

    try {
      await deletePost(post._id);
      navigate("/my-posts", {
        replace: true,
        state: { toastMessage: "Post deleted successfully." },
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete this post right now.");
      setIsDeletingPost(false);
    }
  };

  if (isLoading) {
    return (
      <section className="articles-page">
        <p className="articles-status">Loading article...</p>
      </section>
    );
  }

  if (errorMessage || !post) {
    return (
      <section className="articles-page">
        <p className="articles-status articles-status-error">
          {errorMessage || "Article not found."}
        </p>
        <Link className="secondary-button" to="/articles">
          Back to Articles
        </Link>
      </section>
    );
  }

  return (
    <section className="article-detail-page">
      <div className="article-detail-header">
        <Link className="secondary-button" to="/articles">
          Back to Articles
        </Link>

        <p className="eyebrow">Article</p>
        <h1>{post.title}</h1>
        <p className="article-detail-meta">
          By {post.author?.username || "HarvestHub"} • {formatDate(post.createdAt)} • {post.views || 0} views
        </p>

        {user?._id && post?.author?._id === user._id ? (
          <div className="article-detail-actions">
            <Link className="action-button" to={`/posts/edit/${post._id}`}>
              Edit post
            </Link>
            <button
              type="button"
              className="article-delete-button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeletingPost}
            >
              {isDeletingPost ? "Deleting..." : "Delete post"}
            </button>
          </div>
        ) : null}
      </div>

      <article className="article-detail-card">
        <img
          className="article-detail-image"
          src={post.imageUrl || DEFAULT_POST_IMAGE}
          alt={post.title}
          onError={(event) => {
            event.currentTarget.src = DEFAULT_POST_IMAGE;
          }}
        />

        <div className="article-detail-content">
          <p className="article-detail-text">{post.content}</p>
        </div>
      </article>

      <section className="article-comments-section">
        <h2>Comments</h2>

        {user ? (
          <form className="article-comment-form" onSubmit={handleCommentSubmit}>
            <label className="form-field">
              <span>Add a comment</span>
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Share your thoughts about this post"
                rows={4}
                required
              />
            </label>

            <button
              type="submit"
              className="action-button"
              disabled={isPostingComment}
            >
              {isPostingComment ? "Posting..." : "Post comment"}
            </button>

            {commentStatus.type === "error" && commentStatus.message ? (
              <p className={`form-status form-status-${commentStatus.type}`}>
                {commentStatus.message}
              </p>
            ) : null}
          </form>
        ) : (
          <p className="articles-status">
            <Link to="/signin">Sign in</Link> to add a comment.
          </p>
        )}

        <div className="article-comments-list">
          {comments.length === 0 ? (
            <p className="articles-status">No comments yet. Be the first to comment.</p>
          ) : (
            comments.map((comment) => (
              <article className="article-comment-item" key={comment._id}>
                <img
                  className="article-comment-avatar"
                  src={comment.author?.profilePicture || DEFAULT_AVATAR}
                  alt={`${comment.author?.username || "User"} avatar`}
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />

                <div className="article-comment-body">
                  <p className="article-comment-meta">
                    <strong>{comment.author?.username || "User"}</strong>
                    <span>{formatDate(comment.createdAt)}</span>
                  </p>

                  {editingCommentId === comment._id ? (
                    <div className="article-comment-editor">
                      <textarea
                        value={editingCommentText}
                        onChange={(event) => setEditingCommentText(event.target.value)}
                        rows={3}
                        className="article-comment-edit-textarea"
                      />
                      <div className="article-comment-actions">
                        <button
                          type="button"
                          className="action-button"
                          onClick={() => saveEditedComment(comment._id)}
                          disabled={isSavingEdit}
                        >
                          {isSavingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelEditingComment}
                          disabled={isSavingEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="article-comment-content">{comment.content}</p>
                      {comment.isEdited ? (
                        <p className="article-comment-edited">Edited</p>
                      ) : null}

                      {user?._id && comment.author?._id === user._id ? (
                        <div className="article-comment-actions">
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => startEditingComment(comment)}
                            disabled={deletingCommentId === comment._id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="article-delete-button"
                            onClick={() => setDeleteCommentTargetId(comment._id)}
                            disabled={deletingCommentId === comment._id}
                          >
                            {deletingCommentId === comment._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {editStatus.type === "error" && editStatus.message ? (
          <p className={`form-status form-status-${editStatus.type}`}>
            {editStatus.message}
          </p>
        ) : null}
      </section>

      {isDeleteModalOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
          <div className="modal-card">
            <h3 id="delete-post-title">Delete this post?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeletingPost}
              >
                Cancel
              </button>
              <button
                type="button"
                className="article-delete-button"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
              >
                {isDeletingPost ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteCommentTargetId ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-comment-title"
        >
          <div className="modal-card">
            <h3 id="delete-comment-title">Delete this comment?</h3>
            <p>This action cannot be undone.</p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDeleteCommentTargetId(null)}
                disabled={deletingCommentId === deleteCommentTargetId}
              >
                Cancel
              </button>
              <button
                type="button"
                className="article-delete-button"
                onClick={() => handleDeleteComment(deleteCommentTargetId)}
                disabled={deletingCommentId === deleteCommentTargetId}
              >
                {deletingCommentId === deleteCommentTargetId ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ArticleDetailPage;