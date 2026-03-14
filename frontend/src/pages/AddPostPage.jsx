import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { createPost } from "../lib/posts.js";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AddPostPage() {
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    imageUrl: "",
    tags: "",
  });

  useEffect(() => {
    const checkAccess = async () => {
      const currentUser = await fetchCurrentUser();

      if (!currentUser) {
        navigate("/signin", { replace: true });
        return;
      }

      setIsCheckingAccess(false);
    };

    checkAccess();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        slug: createSlug(formData.title),
        category: formData.category,
        imageUrl: formData.imageUrl,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const response = await createPost(payload);
      setStatus({
        type: "success",
        message: response.message || "Post created successfully.",
      });
      navigate("/my-posts");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to create post right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <p className="shop-status">Checking access...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Story publishing</p>
        <h1 className="auth-title">Share a new article with the community.</h1>
        <p className="auth-text">
          Publish farming tips, updates, market observations, and stories from your work.
        </p>
      </div>

      <div className="auth-card">
        <h2>Add post</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              placeholder="5 soil practices that improved this season"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Content</span>
            <textarea
              name="content"
              placeholder="Write the full article here"
              value={formData.content}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Category</span>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="general">General</option>
              <option value="farming-tips">Farming tips</option>
              <option value="news">News</option>
              <option value="success-stories">Success stories</option>
              <option value="market-trends">Market trends</option>
              <option value="equipment-review">Equipment review</option>
            </select>
          </label>

          <label className="form-field">
            <span>Image URL (optional)</span>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://example.com/article-cover.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Tags (optional, comma separated)</span>
            <input
              type="text"
              name="tags"
              placeholder="harvest, irrigation, soil"
              value={formData.tags}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish post"}
          </button>

          {status.message ? (
            <p className={`form-status form-status-${status.type}`}>{status.message}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default AddPostPage;