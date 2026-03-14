import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { clearCart, getCart, removeFromCart } from "../lib/cart.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function CartPage() {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadCart = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getCart();
      setCart({
        items: Array.isArray(response?.cart?.items) ? response.cart.items : [],
        totalItems: Number(response?.cart?.totalItems || 0),
        totalPrice: Number(response?.cart?.totalPrice || 0),
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to load cart right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (productId) => {
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await removeFromCart(productId);
      setCart({
        items: Array.isArray(response?.cart?.items) ? response.cart.items : [],
        totalItems: Number(response?.cart?.totalItems || 0),
        totalPrice: Number(response?.cart?.totalPrice || 0),
      });
      setStatusMessage("Item removed from cart.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to remove item right now.");
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await clearCart();
      setCart({
        items: Array.isArray(response?.cart?.items) ? response.cart.items : [],
        totalItems: Number(response?.cart?.totalItems || 0),
        totalPrice: Number(response?.cart?.totalPrice || 0),
      });
      setStatusMessage("Cart cleared successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to clear cart right now.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <section className="cart-page">
      <p className="eyebrow">Shopping</p>
      <h1>Your Cart</h1>
      <p className="hero-copy">
        Review your selected products and manage your cart.
      </p>

      {isLoading ? <p className="shop-status">Loading cart...</p> : null}

      {!isLoading && errorMessage ? (
        <p className="shop-status shop-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && statusMessage ? (
        <p className="form-status form-status-success cart-status-message">
          {statusMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && cart.items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty right now.</p>
          <Link className="secondary-button" to="/shop">
            Continue shopping
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && cart.items.length > 0 ? (
        <>
          <div className="cart-actions">
            <p className="cart-summary">
              {cart.totalItems} item{cart.totalItems === 1 ? "" : "s"} • Total ₹
              {Number(cart.totalPrice).toFixed(2)}
            </p>
            <button
              type="button"
              className="secondary-button cart-clear-button"
              onClick={handleClear}
              disabled={isClearing}
            >
              {isClearing ? "Clearing..." : "Clear cart"}
            </button>
          </div>

          <div className="cart-list">
            {cart.items.map((item) => {
              const itemProduct = item.product || {};
              const productImage =
                Array.isArray(itemProduct.images) &&
                itemProduct.images.length > 0
                  ? itemProduct.images[0]
                  : DEFAULT_PRODUCT_IMAGE;

              return (
                <article
                  className="cart-item"
                  key={itemProduct._id || itemProduct.id}
                >
                  <img
                    className="cart-item-image"
                    src={productImage}
                    alt={itemProduct.name || "Product"}
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />

                  <div className="cart-item-content">
                    <h2>{itemProduct.name || "Unnamed product"}</h2>
                    <p className="cart-item-meta">
                      ₹{Number(item.price || 0).toFixed(2)} x {item.quantity} =
                      ₹
                      {(
                        Number(item.price || 0) * Number(item.quantity || 0)
                      ).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() => handleRemove(itemProduct._id)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default CartPage;
