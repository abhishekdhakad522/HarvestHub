import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { createProduct } from "../lib/products.js";

function AddProductPage() {
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
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
    tags: "",
  });

  useEffect(() => {
    const checkAccess = async () => {
      const currentUser = await fetchCurrentUser();

      if (!currentUser) {
        navigate("/signin", { replace: true });
        return;
      }

      if (currentUser.role !== "farmer") {
        navigate("/shop", { replace: true });
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

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("unit", formData.unit);
    data.append("quantity", formData.quantity);
    data.append("location[city]", formData.city);
    data.append("location[state]", formData.state);
    formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag) => data.append("tags", tag));
    if (imageFile) data.append("image", imageFile);

    try {
      const response = await createProduct(data);
      setStatus({
        type: "success",
        message: response.message || "Product created successfully.",
      });
      navigate("/shop");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to create product right now.",
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
        <p className="eyebrow">Farmer tools</p>
        <h1 className="auth-title">Add a new product listing.</h1>
        <p className="auth-text">
          Publish fresh stock to the marketplace so buyers can discover it instantly.
        </p>
      </div>

      <div className="auth-card">
        <h2>Add product</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Product name</span>
            <input
              type="text"
              name="name"
              placeholder="Fresh tomatoes"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-field">
            <span>Description</span>
            <textarea
              name="description"
              placeholder="Describe quality, harvest date, and packaging"
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
                placeholder="120"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span>Unit</span>
              <select name="unit" value={formData.unit} onChange={handleChange} required>
                <option value="kg">kg</option>
                <option value="ton">ton</option>
                <option value="piece">piece</option>
                <option value="dozen">dozen</option>
                <option value="other">other</option>
              </select>
            </label>
          </div>

          <label className="form-field">
            <span>Quantity</span>
            <input
              type="number"
              name="quantity"
              min="0"
              placeholder="50"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </label>

          <div className="add-product-row">
            <label className="form-field">
              <span>City</span>
              <input
                type="text"
                name="city"
                placeholder="Madurai"
                value={formData.city}
                onChange={handleChange}
              />
            </label>

            <label className="form-field">
              <span>State</span>
              <input
                type="text"
                name="state"
                placeholder="Tamil Nadu"
                value={formData.state}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-field">
            <span>Product image (JPEG, PNG, WEBP up to 5MB)</span>
            <div className="file-upload-control">
              <input
                id="product-image"
                className="file-upload-input"
                type="file"
                name="image"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
              />
              <label htmlFor="product-image" className="file-upload-button">
                Choose image
              </label>
              <span className="file-upload-name">
                {imageFile ? imageFile.name : "No file chosen"}
              </span>
            </div>
            {imagePreview && (
              <img
                className="file-upload-preview"
                src={imagePreview}
                alt="Product preview"
              />
            )}
          </div>

          <label className="form-field">
            <span>Tags (optional, comma separated)</span>
            <input
              type="text"
              name="tags"
              placeholder="organic, local, fresh"
              value={formData.tags}
              onChange={handleChange}
            />
          </label>

          <button
            type="submit"
            className="action-button auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding product..." : "Add product"}
          </button>

          {status.message ? (
            <p className={`form-status form-status-${status.type}`}>{status.message}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

export default AddProductPage;
