import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { createProduct } from "../lib/products.js";

function AddProductPage() {
  const navigate = useNavigate();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "vegetables",
    price: "",
    unit: "kg",
    quantity: "",
    city: "",
    state: "",
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    const payload = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number(formData.price),
      unit: formData.unit,
      quantity: Number(formData.quantity),
      location: {
        city: formData.city,
        state: formData.state,
      },
      images: formData.imageUrl ? [formData.imageUrl] : [],
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      const response = await createProduct(payload);
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

          <label className="form-field">
            <span>Image URL (optional)</span>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://example.com/product.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
            />
          </label>

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
