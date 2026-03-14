import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { getProducts } from "../lib/products.js";
import { addToCart, getCart } from "../lib/cart.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [activeCartProductId, setActiveCartProductId] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const syncUser = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    };

    syncUser();
    window.addEventListener("harvesthub:authchange", syncUser);

    return () => {
      window.removeEventListener("harvesthub:authchange", syncUser);
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getProducts();
        setProducts(Array.isArray(response.products) ? response.products : []);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load products right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const syncCartCount = async () => {
      if (!user) {
        setCartItemCount(0);
        return;
      }

      try {
        const response = await getCart();
        setCartItemCount(Number(response?.cart?.totalItems || 0));
      } catch {
        setCartItemCount(0);
      }
    };

    syncCartCount();
  }, [user]);

  const handleAddToCart = async (productId) => {
    setErrorMessage("");
    setCartMessage("");
    setActiveCartProductId(productId);

    try {
      const response = await addToCart({ productId, quantity: 1 });
      setCartItemCount(Number(response?.cart?.totalItems || 0));
      setCartMessage("Product added to cart.");
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to add product to cart right now.",
      );
    } finally {
      setActiveCartProductId("");
    }
  };

  return (
    <section className="shop-page">
      {user?.role === "farmer" ? (
        <div className="shop-top-bar">
          <Link className="shop-add-product-button" to="/products/new">
            + Add product
          </Link>
        </div>
      ) : null}

      <p className="eyebrow">Marketplace</p>
      <h1>Shop</h1>
      <div className="shop-cart-center">
        <Link
          className="shop-cart-logo-button shop-cart-logo-inline"
          to="/cart"
          aria-label="View cart"
        >
          <span
            className="shop-cart-count"
            aria-label={`${cartItemCount} items in cart`}
          >
            {cartItemCount}
          </span>
          <svg
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H7" />
            <circle cx="10" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
          </svg>
          <span className="shop-cart-label">Cart</span>
        </Link>
      </div>
      <p className="hero-copy">
        Browse fresh produce, dairy, and pantry goods from local farmers.
      </p>

      {isLoading ? <p className="shop-status">Loading products...</p> : null}

      {!isLoading && errorMessage ? (
        <p className="shop-status shop-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && cartMessage ? (
        <p className="form-status form-status-success shop-cart-message">
          {cartMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && products.length === 0 ? (
        <p className="shop-status">No products available yet.</p>
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
                  <div className="product-actions">
                    {user ? (
                      <button
                        type="button"
                        className="product-cart-button"
                        onClick={() =>
                          handleAddToCart(product._id || product.id)
                        }
                        disabled={
                          activeCartProductId === (product._id || product.id)
                        }
                      >
                        {activeCartProductId === (product._id || product.id)
                          ? "Adding..."
                          : "Add to cart"}
                      </button>
                    ) : (
                      <Link
                        className="secondary-button product-signin-link"
                        to="/signin"
                      >
                        Sign in to add
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default ShopPage;
