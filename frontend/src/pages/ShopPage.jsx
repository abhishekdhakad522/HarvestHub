import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCurrentUser } from "../lib/auth.js";
import { getProducts } from "../lib/products.js";
import { addToCart, getCart } from "../lib/cart.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [activeCartProductId, setActiveCartProductId] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
        const response = await getProducts({ page: currentPage, limit: 9 });
        const nextProducts = Array.isArray(response.products)
          ? response.products
          : [];

        setProducts(nextProducts);
        setTotalPages(
          Math.max(Number(response?.pagination?.totalPages || 1), 1),
        );
        setSelectedQuantities(
          nextProducts.reduce((quantityMap, product) => {
            const productId = product._id || product.id;
            if (productId) {
              quantityMap[productId] = 1;
            }
            return quantityMap;
          }, {}),
        );
      } catch (error) {
        setErrorMessage(error.message || "Unable to load products right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage]);

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

  const handleQuantityChange = (productId, nextQuantity, maxQuantity) => {
    const parsedQuantity = Number.parseInt(nextQuantity, 10);

    if (Number.isNaN(parsedQuantity)) {
      setSelectedQuantities((current) => ({
        ...current,
        [productId]: 1,
      }));
      return;
    }

    setSelectedQuantities((current) => ({
      ...current,
      [productId]: Math.min(Math.max(parsedQuantity, 1), maxQuantity),
    }));
  };

  const handleAddToCart = async (productId, availableQuantity) => {
    setErrorMessage("");
    setCartMessage("");
    setActiveCartProductId(productId);

    try {
      const selectedQuantity = Math.min(
        Math.max(Number(selectedQuantities[productId] || 1), 1),
        Math.max(Number(availableQuantity || 0), 1),
      );
      const response = await addToCart({
        productId,
        quantity: selectedQuantity,
      });
      setCartItemCount(Number(response?.cart?.totalItems || 0));
      setCartMessage(`${selectedQuantity} item(s) added to cart.`);
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to add product to cart right now.",
      );
    } finally {
      setActiveCartProductId("");
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((previousValue) => Math.max(1, previousValue - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previousValue) => Math.min(totalPages, previousValue + 1));
  };

  return (
    <section className="shop-page">
      {user ? (
        <div className="shop-top-bar">
          <Link
            className="secondary-button shop-my-orders-button"
            to="/my-orders"
          >
            My orders
          </Link>
          {user?.role === "farmer" ? (
            <Link
              className="secondary-button shop-my-orders-button"
              to="/seller-orders"
            >
              My orders sold
            </Link>
          ) : null}
          {user?.role === "farmer" ? (
            <Link className="shop-add-product-button" to="/products/new">
              + Add product
            </Link>
          ) : null}
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
        <>
          <div className="products-grid">
            {products.map((product) => {
              const productId = product._id || product.id;
              const currentUserId = user?._id || user?.id;
              const productSellerId =
                product?.seller?._id || product?.seller?.id || product?.seller;
              const isOwnedByCurrentUser =
                Boolean(currentUserId) &&
                Boolean(productSellerId) &&
                String(productSellerId) === String(currentUserId);
              const availableQuantity = Math.max(
                Number(product.quantity || 0),
                0,
              );
              const productImage =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : DEFAULT_PRODUCT_IMAGE;

              return (
                <article className="product-card" key={productId}>
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
                        Stock: {availableQuantity}
                      </span>
                    </p>
                    <div className="product-actions">
                      {user ? (
                        <>
                          {isOwnedByCurrentUser ? (
                            <div className="product-manage-actions">
                              <Link
                                className="secondary-button product-edit-link"
                                to={`/products/edit/${productId}`}
                              >
                                Edit product
                              </Link>
                            </div>
                          ) : null}
                          <label className="product-quantity-selector">
                            <span>Quantity</span>
                            <input
                              type="number"
                              min="1"
                              max={Math.max(availableQuantity, 1)}
                              value={selectedQuantities[productId] ?? 1}
                              onChange={(event) =>
                                handleQuantityChange(
                                  productId,
                                  event.target.value,
                                  Math.max(availableQuantity, 1),
                                )
                              }
                              disabled={availableQuantity < 1}
                            />
                          </label>
                          <button
                            type="button"
                            className="product-cart-button"
                            onClick={() =>
                              handleAddToCart(productId, availableQuantity)
                            }
                            disabled={
                              activeCartProductId === productId ||
                              availableQuantity < 1
                            }
                          >
                            {activeCartProductId === productId
                              ? "Adding..."
                              : availableQuantity < 1
                                ? "Out of stock"
                                : "Add to cart"}
                          </button>
                        </>
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

          <div className="shop-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="shop-page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="secondary-button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default ShopPage;
