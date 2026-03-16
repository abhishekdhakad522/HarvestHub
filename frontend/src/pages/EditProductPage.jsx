import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { fetchCurrentUser } from "../lib/auth.js";
import { getProductById, updateProduct } from "../lib/products.js";

function EditProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "vegetables",
    price: "",
    unit: "kg",
    quantity: "",
    city: "",
    state: "",
    status: "available",
    tags: "",
  });

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      setStatus({ type: "idle", message: "" });

      try {
        const [currentUser, product] = await Promise.all([
          fetchCurrentUser(),
          getProductById(productId),
        ]);

        if (!currentUser) {
          navigate("/signin", { replace: true });
          return;
        }

        if (currentUser.role !== "farmer") {
          navigate("/shop", { replace: true });
          return;
        }

        if (!product || product.seller?._id !== currentUser._id) {
          navigate("/my-products", { replace: true });
          return;
        }

        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "vegetables",
          price: product.price ?? "",
          unit: product.unit || "kg",
          quantity: product.quantity ?? "",
          city: product.location?.city || "",
          state: product.location?.state || "",
          status: product.status || "available",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
        });

        setImagePreview(
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "",
        );
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Unable to load product details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [navigate, productId]);

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
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("price", formData.price);
      data.append("unit", formData.unit);
      data.append("quantity", formData.quantity);
      data.append("status", formData.status);
      data.append("location[city]", formData.city);
      data.append("location[state]", formData.state);
      formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => data.append("tags", tag));

      if (imageFile) {
        data.append("image", imageFile);
      }

      await updateProduct(productId, data);
      navigate("/my-products", {
        replace: true,
        state: { toastMessage: "Product updated successfully." },
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to update product right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <p className="shop-status">Loading product...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <BackButton fallbackPath="/my-products" />
        <p className="eyebrow">Farmer tools</p>
        <h1 className="auth-title">Update your product listing.</h1>
        <p className="auth-text">
          Refresh stock, pricing, availability, and listing details before
          buyers see the change.
        </p>
      </div>

      <div className="auth-card">
        <h2>Edit product</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Product name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea
              name="description"
              value={formData.description}
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
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="seeds">Seeds</option>
              <option value="equipment">Equipment</option>
              <option value="other">Other</option>
            </select>
          </label>

          <div className="add-product-row">
            <label className="form-field">
              <span>Price (INR)</span>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Unit</span>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="piece">piece</option>
                <option value="dozen">dozen</option>
                <option value="other">other</option>
              </select>
            </label>
          </div>

          <div className="add-product-row">
            <label className="form-field">
              <span>Quantity</span>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Status</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="outOfStock">Out of stock</option>
                <option value="sold">Sold</option>
              </select>
            </label>
          </div>

          <div className="add-product-row">
            <label className="form-field">
              <span>City</span>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </label>

            <label className="form-field">
              <span>State</span>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-field">
            <span>Product image (JPEG, PNG, WEBP up to 5MB)</span>
            <div className="file-upload-control">
              <input
                id="edit-product-image"
                className="file-upload-input"
                type="file"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
              />
              <label
                htmlFor="edit-product-image"
                className="file-upload-button"
              >
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
                alt="Product preview"
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

export default EditProductPage;
