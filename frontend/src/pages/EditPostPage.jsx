import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { fetchCurrentUser } from "../lib/auth.js";
import { getPostById, updatePost } from "../lib/posts.js";

function EditPostPage() {
  const navigate = useNavigate();
  const { postId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setStatus({ type: "idle", message: "" });

      try {
        const [currentUser, post] = await Promise.all([
          fetchCurrentUser(),
          getPostById(postId),
        ]);

        if (!currentUser) {
          navigate("/signin", { replace: true });
          return;
        }

        if (!post || post.author?._id !== currentUser._id) {
          navigate("/my-posts", { replace: true });
          return;
        }

        setFormData({
          title: post.title || "",
          content: post.content || "",
          category: post.category || "general",
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
        });

        setImagePreview(post.imageUrl || "");
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Unable to load post details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      loadData();
    }
  }, [navigate, postId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("category", formData.category);
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((tag) => data.append("tags", tag));

      if (imageFile) {
        data.append("image", imageFile);
      }

      await updatePost(postId, data);
      navigate("/my-posts", {
        replace: true,
        state: { toastMessage: "Post updated successfully." },
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update post right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <p className="shop-status">Loading post...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <BackButton fallbackPath="/my-posts" />
        <p className="eyebrow">Story publishing</p>
        <h1 className="auth-title">Edit your article.</h1>
        <p className="auth-text">
          Update your title, content, image, and tags before publishing updates.
        </p>
      </div>

      <div className="auth-card">
        <h2>Edit post</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Content</span>
            <textarea
              name="content"
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

          <div className="form-field">
            <span>Cover image (JPEG, PNG, WEBP up to 5MB)</span>
            <div className="file-upload-control">
              <input
                id="edit-post-image"
                className="file-upload-input"
                type="file"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
              />
              <label htmlFor="edit-post-image" className="file-upload-button">
                Choose image
              </label>
              <span className="file-upload-name">
                {imageFile ? imageFile.name : "No new file chosen"}
              </span>
            </div>
            {imagePreview ? (
              <img
                className="file-upload-preview"
                src={imagePreview}
                alt="Post preview"
              />
            ) : null}
          </div>

          <label className="form-field">
            <span>Tags (optional, comma separated)</span>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>

          {status.message ? (
            <p className={`form-status form-status-${status.type}`}>
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default EditPostPage;
