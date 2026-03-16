import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { getOrderById } from "../lib/orders.js";

const DEFAULT_PRODUCT_IMAGE = "/default-product.svg";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setErrorMessage("Order ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getOrderById(orderId);
        setOrder(response?.order || null);
      } catch (error) {
        setErrorMessage(error.message || "Unable to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  return (
    <section className="order-detail-page">
      <div className="order-detail-head">
        <BackButton fallbackPath="/my-orders" />
        <p className="eyebrow">Order details</p>
        <h1>Order #{order?._id?.slice(-6) || "N/A"}</h1>
        <p className="hero-copy">
          Placed on {formatDate(order?.createdAt)}. Track products, delivery
          details, and billing summary.
        </p>
        <Link className="secondary-button" to="/my-orders">
          Back to my orders
        </Link>
      </div>

      {isLoading ? (
        <p className="orders-status">Loading order details...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="orders-status orders-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && order ? (
        <>
          <div className="order-detail-summary">
            <p>
              <span>Order status</span>
              <strong>{order.orderStatus || "pending"}</strong>
            </p>
            <p>
              <span>Payment status</span>
              <strong>{order.paymentStatus || "pending"}</strong>
            </p>
            <p>
              <span>Payment method</span>
              <strong>{order.paymentMethod || "N/A"}</strong>
            </p>
            <p>
              <span>Buyer</span>
              <strong>{order.buyer?.username || "N/A"}</strong>
            </p>
          </div>

          <div className="order-detail-grid">
            <article className="order-detail-card">
              <h2>Shipping address</h2>
              <p>{order.shippingAddress?.fullName || "-"}</p>
              <p>{order.shippingAddress?.phoneNumber || "-"}</p>
              <p>{order.shippingAddress?.address || "-"}</p>
              <p>
                {order.shippingAddress?.city || "-"},{" "}
                {order.shippingAddress?.state || "-"}{" "}
                {order.shippingAddress?.zipCode || "-"}
              </p>
              {order.orderNotes ? (
                <p className="order-detail-note">Note: {order.orderNotes}</p>
              ) : null}
            </article>

            <article className="order-detail-card">
              <h2>Billing</h2>
              <p>
                <span>Subtotal</span>
                <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
              </p>
              <p>
                <span>Shipping</span>
                <strong>₹{Number(order.shippingCost || 0).toFixed(2)}</strong>
              </p>
              <p className="order-final-amount">
                <span>Final amount</span>
                <strong>₹{Number(order.finalAmount || 0).toFixed(2)}</strong>
              </p>
            </article>
          </div>

          <div className="order-detail-items">
            <h2>Items</h2>
            <div className="order-detail-item-list">
              {(order.items || []).map((item) => {
                const productImage =
                  item?.product?.images?.[0] || DEFAULT_PRODUCT_IMAGE;
                const quantity = Number(item.quantity || 0);
                const price = Number(item.price || 0);

                return (
                  <article
                    className="order-detail-item"
                    key={item.product?._id || item.product || item.name}
                  >
                    <img
                      src={productImage}
                      alt={item.name || "Ordered item"}
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                    />
                    <div>
                      <h3>{item.name || "Product"}</h3>
                      <p>Sold by: {item.seller?.username || "Farmer"}</p>
                      <p>
                        ₹{price.toFixed(2)} x {quantity} = ₹
                        {(price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default OrderDetailPage;
