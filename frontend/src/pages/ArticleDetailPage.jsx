import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { createComment, getCommentsByPost } from "../lib/comments.js";
import { getPostById, incrementPostViews } from "../lib/posts.js";

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
  const { postId } = useParams();
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentStatus, setCommentStatus] = useState({ type: "idle", message: "" });

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
        const [postResponse, commentResponse] = await Promise.all([
          getPostById(postId),
          getCommentsByPost(postId),
        ]);

        setPost(postResponse);
        setComments(Array.isArray(commentResponse?.comments) ? commentResponse.comments : []);

        const viewKey = `harvesthub:viewed:${postId}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, "true");
          const viewResponse = await incrementPostViews(postId);
          setPost((currentValue) =>
            currentValue
              ? { ...currentValue, views: viewResponse?.views ?? (currentValue.views || 0) + 1 }
              : currentValue
          );
        }
      } catch (error) {
        setErrorMessage(error.message || "Unable to load this article right now.");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      loadArticle();
    }
  }, [postId]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      setCommentStatus({ type: "error", message: "Comment cannot be empty." });
      return;
    }

    setIsPostingComment(true);
    setCommentStatus({ type: "idle", message: "" });

    try {
      const response = await createComment({
        postId,
        content: commentText.trim(),
      });

      if (response?.comment) {
        setComments((previousValue) => [...previousValue, response.comment]);
      }
      setCommentText("");
      setCommentStatus({ type: "success", message: "Comment added successfully." });
    } catch (error) {
      setCommentStatus({
        type: "error",
        message: error.message || "Unable to add comment right now.",
      });
    } finally {
      setIsPostingComment(false);
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

            {commentStatus.message ? (
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
                  <p className="article-comment-content">{comment.content}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
}

export default ArticleDetailPage;