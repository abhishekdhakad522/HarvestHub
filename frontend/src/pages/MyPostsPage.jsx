import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deletePost, getMyPosts } from "../lib/posts.js";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80";

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

function MyPostsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deleteTargetPostId, setDeleteTargetPostId] = useState(null);
  const [toastMessage, setToastMessage] = useState(location.state?.toastMessage || "");

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2200);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!location.state?.toastMessage) {
      return;
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const loadMyPosts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyPosts();
        setPosts(Array.isArray(response?.posts) ? response.posts : []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load your posts right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMyPosts();
  }, []);

  const handleDeletePost = async (postId) => {
    setDeletingPostId(postId);
    setErrorMessage("");

    try {
      await deletePost(postId);
      setPosts((previousValue) => previousValue.filter((item) => item._id !== postId));
      setToastMessage("Post deleted successfully.");
      setDeleteTargetPostId(null);
    } catch (error) {
      setErrorMessage(error.message || "Unable to delete post right now.");
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <section className="articles-page">
      <div className="articles-top-bar">
        <div>
          <p className="eyebrow">Your writing</p>
          <h1>My posts</h1>
          <p className="hero-copy articles-copy">
            Review the articles you have published and add new posts for the community.
          </p>
        </div>

        <Link className="shop-add-product-button" to="/posts/new">
          + Add post
        </Link>
      </div>

      {isLoading ? <p className="articles-status">Loading your posts...</p> : null}

      {toastMessage ? <p className="toast-success">{toastMessage}</p> : null}

      {!isLoading && errorMessage ? (
        <p className="articles-status articles-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && posts.length === 0 ? (
        <div className="articles-empty-state">
          <p>You have not published any posts yet.</p>
          <Link className="shop-add-product-button" to="/posts/new">
            + Add your first post
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && posts.length > 0 ? (
        <div className="articles-grid">
          {posts.map((post) => (
            <article className="article-card" key={post._id || post.slug}>
              <img
                className="article-image"
                src={post.imageUrl || DEFAULT_POST_IMAGE}
                alt={post.title}
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_POST_IMAGE;
                }}
              />

              <div className="article-content">
                <div className="article-meta-row">
                  <span className="article-category">{post.category || "general"}</span>
                  <span className="article-date">{formatDate(post.createdAt)}</span>
                </div>

                <h2>{post.title}</h2>

                <Link className="article-card-edit-inline action-button" to={`/posts/edit/${post._id}`}>
                  Edit this post
                </Link>

                <button
                  type="button"
                  className="article-card-delete-inline"
                  onClick={() => setDeleteTargetPostId(post._id)}
                  disabled={deletingPostId === post._id}
                >
                  {deletingPostId === post._id ? "Deleting..." : "Delete post"}
                </button>

                <p className="article-excerpt">{post.content}</p>

                <div className="article-footer">
                  <span className="article-author">
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="article-views">{post.views || 0} views</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {deleteTargetPostId ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-post-title">
          <div className="modal-card">
            <h3 id="delete-post-title">Delete this post?</h3>
            <p>This action is permanent and cannot be undone.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setDeleteTargetPostId(null)}
                disabled={deletingPostId === deleteTargetPostId}
              >
                Cancel
              </button>
              <button
                type="button"
                className="article-delete-button"
                onClick={() => handleDeletePost(deleteTargetPostId)}
                disabled={deletingPostId === deleteTargetPostId}
              >
                {deletingPostId === deleteTargetPostId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default MyPostsPage;