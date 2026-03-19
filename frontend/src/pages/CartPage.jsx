import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../lib/cart.js";
import { createOrder } from "../lib/orders.js";
import { fetchCurrentUser } from "../lib/auth.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function mapCartState(response) {
  return {
    items: Array.isArray(response?.cart?.items) ? response.cart.items : [],
    totalItems: Number(response?.cart?.totalItems || 0),
    totalPrice: Number(response?.cart?.totalPrice || 0),
  };
}

function CartPage() {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [activeProductId, setActiveProductId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderForm, setOrderForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cash-on-delivery",
    orderNotes: "",
  });

  const loadCart = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [response, currentUser] = await Promise.all([
        getCart(),
        fetchCurrentUser(),
      ]);
      setCart(mapCartState(response));
      setUser(currentUser);
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
    setActiveProductId(productId);

    try {
      const response = await removeFromCart(productId);
      setCart(mapCartState(response));
      setStatusMessage("Item removed from cart.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to remove item right now.");
    } finally {
      setActiveProductId("");
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    const parsedQuantity = Number.parseInt(quantity, 10);

    if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setActiveProductId(productId);

    try {
      const response = await updateCartItem({
        productId,
        quantity: parsedQuantity,
      });
      setCart(mapCartState(response));
      setStatusMessage("Cart quantity updated.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to update quantity right now.");
    } finally {
      setActiveProductId("");
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await clearCart();
      setCart(mapCartState(response));
      setStatusMessage("Cart cleared successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to clear cart right now.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleOrderFormChange = (event) => {
    const { name, value } = event.target;
    setOrderForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setIsPlacingOrder(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const response = await createOrder({
        shippingAddress: {
          fullName: orderForm.fullName,
          phoneNumber: orderForm.phoneNumber,
          address: orderForm.address,
          city: orderForm.city,
          state: orderForm.state,
          zipCode: orderForm.zipCode,
        },
        paymentMethod: orderForm.paymentMethod,
        orderNotes: orderForm.orderNotes,
      });

      setStatusMessage(
        `Order placed successfully. Payable amount: ₹${Number(response?.order?.finalAmount || 0).toFixed(2)} (Order ID: ${response?.order?._id || "N/A"})`,
      );
      setOrderForm({
        fullName: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        paymentMethod: "cash-on-delivery",
        orderNotes: "",
      });

      await loadCart();
    } catch (error) {
      setErrorMessage(error.message || "Unable to place order right now.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section className="cart-page">
      <BackButton fallbackPath="/shop" />
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
              const productId = itemProduct._id || itemProduct.id;
              const availableQuantity = Math.max(
                Number(itemProduct.quantity || item.quantity || 1),
                1,
              );
              const itemQuantity = Math.max(Number(item.quantity || 1), 1);
              const itemPrice = Number(item.price || itemProduct.price || 0);
              const productImage =
                Array.isArray(itemProduct.images) &&
                itemProduct.images.length > 0
                  ? itemProduct.images[0]
                  : DEFAULT_PRODUCT_IMAGE;

              return (
                <article className="cart-item" key={productId}>
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
                      ₹{itemPrice.toFixed(2)} x {itemQuantity} = ₹
                      {(itemPrice * itemQuantity).toFixed(2)}
                    </p>
                    <div className="cart-item-actions">
                      <label className="cart-quantity-selector">
                        <span>Quantity</span>
                        <input
                          type="number"
                          min="1"
                          max={availableQuantity}
                          value={itemQuantity}
                          onChange={(event) =>
                            handleQuantityChange(productId, event.target.value)
                          }
                          disabled={activeProductId === productId}
                        />
                      </label>
                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => handleRemove(productId)}
                        disabled={activeProductId === productId}
                      >
                        {activeProductId === productId
                          ? "Updating..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="cart-order-panel">
            <h2>Place order</h2>
            {user?.role === "farmer" ? (
              <div className="cart-farmer-notice">
                <p className="shop-status shop-status-error">
                  Farmers cannot place orders. Only buyers can purchase products.
                </p>
              </div>
            ) : (
              <>
                <p className="cart-order-copy">
                  Total payable: ₹{Number(cart.totalPrice).toFixed(2)} + shipping as
                  per order rules.
                </p>

                <form className="cart-order-form" onSubmit={handlePlaceOrder}>
              <div className="cart-order-grid">
                <label className="form-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={orderForm.fullName}
                    onChange={handleOrderFormChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={orderForm.phoneNumber}
                    onChange={handleOrderFormChange}
                    required
                  />
                </label>
              </div>

              <label className="form-field">
                <span>Address</span>
                <input
                  type="text"
                  name="address"
                  value={orderForm.address}
                  onChange={handleOrderFormChange}
                  required
                />
              </label>

              <div className="cart-order-grid">
                <label className="form-field">
                  <span>City</span>
                  <input
                    type="text"
                    name="city"
                    value={orderForm.city}
                    onChange={handleOrderFormChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>State</span>
                  <input
                    type="text"
                    name="state"
                    value={orderForm.state}
                    onChange={handleOrderFormChange}
                    required
                  />
                </label>
              </div>

              <div className="cart-order-grid">
                <label className="form-field">
                  <span>ZIP code</span>
                  <input
                    type="text"
                    name="zipCode"
                    value={orderForm.zipCode}
                    onChange={handleOrderFormChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Payment method</span>
                  <select
                    name="paymentMethod"
                    value={orderForm.paymentMethod}
                    onChange={handleOrderFormChange}
                    required
                  >
                    <option value="cash-on-delivery">Cash on delivery</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="net-banking">Net banking</option>
                  </select>
                </label>
              </div>

              <label className="form-field">
                <span>Order notes (optional)</span>
                <textarea
                  name="orderNotes"
                  value={orderForm.orderNotes}
                  onChange={handleOrderFormChange}
                  placeholder="Delivery instructions, landmark, preferred time, etc."
                />
              </label>

              <button
                type="submit"
                className="primary-button cart-order-button"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing order..." : "Place order"}
              </button>
            </form>
              </>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default CartPage;
