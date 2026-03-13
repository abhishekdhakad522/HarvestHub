import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProducts } from "../lib/products.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function MyProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadMyProducts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyProducts();
        setProducts(Array.isArray(response.products) ? response.products : []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load your products right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMyProducts();
  }, []);

  return (
    <section className="shop-page">
      <p className="eyebrow">Farmer Inventory</p>
      <h1>My products</h1>
      <p className="hero-copy">
        Manage your listings and review all products you have added.
      </p>

      {isLoading ? <p className="shop-status">Loading your products...</p> : null}

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
                  <p className="product-category">{product.category || "General"}</p>
                  <h2>{product.name}</h2>
                  <p className="product-description">{product.description}</p>
                  <p className="product-meta">
                    <span className="product-price">
                      ₹{Number(product.price || 0).toFixed(2)} / {product.unit || "item"}
                    </span>
                    <span className="product-quantity">Qty: {product.quantity ?? 0}</span>
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
