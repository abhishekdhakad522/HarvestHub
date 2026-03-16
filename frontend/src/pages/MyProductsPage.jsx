import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { getMyProducts } from "../lib/products.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function MyProductsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState(
    location.state?.toastMessage || "",
  );

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
    const loadMyProducts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyProducts();
        setProducts(Array.isArray(response.products) ? response.products : []);
      } catch (error) {
        setErrorMessage(
          error.message || "Unable to load your products right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMyProducts();
  }, []);

  return (
    <section className="shop-page">
      <BackButton fallbackPath="/profile" />
      <p className="eyebrow">Farmer Inventory</p>
      <h1>My products</h1>
      <p className="hero-copy">
        Manage your listings and review all products you have added.
      </p>

      {isLoading ? (
        <p className="shop-status">Loading your products...</p>
      ) : null}

      {toastMessage ? <p className="toast-success">{toastMessage}</p> : null}

      {!isLoading && errorMessage ? (
        <p className="shop-status shop-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <div className="shop-status">
          <p>No products added yet.</p>
          <Link className="shop-add-product-button" to="/products/new">
            + Add your first product
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => {
            const productImage =
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : DEFAULT_PRODUCT_IMAGE;

            return (
              <article className="product-card" key={product._id || product.id}>
                <img
                  className="product-image"
                  src={productImage}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />
                <div className="product-content">
                  <p className="product-category">
                    {product.category || "General"}
                  </p>
                  <h2>{product.name}</h2>
                  <div className="product-manage-actions">
                    <Link
                      className="secondary-button product-edit-link"
                      to={`/products/edit/${product._id}`}
                    >
                      Edit product
                    </Link>
                  </div>
                  <p className="product-description">{product.description}</p>
                  <p className="product-meta">
                    <span className="product-price">
                      ₹{Number(product.price || 0).toFixed(2)} /{" "}
                      {product.unit || "item"}
                    </span>
                    <span className="product-quantity">
                      Qty: {product.quantity ?? 0}
                    </span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default MyProductsPage;
