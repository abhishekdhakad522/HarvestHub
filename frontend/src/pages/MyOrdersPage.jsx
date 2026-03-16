import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { cancelOrder, getMyOrders } from "../lib/orders.js";

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

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getMyOrders({ page: currentPage, limit: 10 });
        setOrders(Array.isArray(response?.orders) ? response.orders : []);
        setTotalPages(
          Math.max(Number(response?.pagination?.totalPages || 1), 1),
        );
      } catch (error) {
        setErrorMessage(
          error.message || "Unable to load your orders right now.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((previousValue) => Math.max(1, previousValue - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previousValue) => Math.min(totalPages, previousValue + 1));
  };

  const canCancelOrder = (orderStatus) =>
    ["pending", "confirmed"].includes(String(orderStatus || "").toLowerCase());

  const handleCancelOrder = async (orderId) => {
    setActiveOrderId(orderId);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await cancelOrder(orderId);
      const updatedOrder = response?.order;

      if (updatedOrder?._id) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            (order._id || order.id) === updatedOrder._id ? updatedOrder : order,
          ),
        );
      }

      setStatusMessage("Order cancelled successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to cancel order right now.");
    } finally {
      setActiveOrderId("");
    }
  };

  return (
    <section className="orders-page">
      <BackButton fallbackPath="/profile" />
      <p className="eyebrow">Purchases</p>
      <h1>My orders</h1>
      <p className="hero-copy">
        Track your placed orders, payment status, and total payable amount.
      </p>

      {isLoading ? <p className="orders-status">Loading orders...</p> : null}

      {!isLoading && errorMessage ? (
        <p className="orders-status orders-status-error">{errorMessage}</p>
      ) : null}

      {!isLoading && !errorMessage && statusMessage ? (
        <p className="form-status form-status-success orders-status-message">
          {statusMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && orders.length === 0 ? (
        <div className="orders-empty">
          <p>You have not placed any orders yet.</p>
          <Link className="secondary-button" to="/shop">
            Shop products
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && orders.length > 0 ? (
        <>
          <div className="orders-list">
            {orders.map((order) => {
              const firstItem =
                Array.isArray(order.items) && order.items.length > 0
                  ? order.items[0]
                  : null;
              const firstImage =
                firstItem?.product?.images?.[0] || DEFAULT_PRODUCT_IMAGE;
              const totalItems = Array.isArray(order.items)
                ? order.items.reduce(
                    (sum, item) =>
                      sum + Math.max(Number(item.quantity || 0), 0),
                    0,
                  )
                : 0;

              return (
                <article className="order-card" key={order._id || order.id}>
                  <img
                    className="order-image"
                    src={firstImage}
                    alt={firstItem?.name || "Ordered product"}
                    onError={(event) => {
                      event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />

                  <div className="order-content">
                    <div className="order-header-row">
                      <h2>
                        <Link
                          className="order-detail-link"
                          to={`/my-orders/${order._id || order.id}`}
                        >
                          Order #{order._id?.slice(-6) || "N/A"}
                        </Link>
                      </h2>
                      <span className="order-date">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <p className="order-line">
                      {totalItems} item{totalItems === 1 ? "" : "s"} •{" "}
                      {order.paymentMethod || "N/A"}
                    </p>

                    <div className="order-stats-grid">
                      <p>
                        <span>Status</span>
                        <strong>{order.orderStatus || "pending"}</strong>
                      </p>
                      <p>
                        <span>Payment</span>
                        <strong>{order.paymentStatus || "pending"}</strong>
                      </p>
                      <p>
                        <span>Total</span>
                        <strong>
                          ₹{Number(order.totalAmount || 0).toFixed(2)}
                        </strong>
                      </p>
                      <p>
                        <span>Final</span>
                        <strong>
                          ₹{Number(order.finalAmount || 0).toFixed(2)}
                        </strong>
                      </p>
                    </div>

                    <div className="order-actions">
                      <Link
                        className="secondary-button order-open-button"
                        to={`/my-orders/${order._id || order.id}`}
                      >
                        View order
                      </Link>
                      {canCancelOrder(order.orderStatus) ? (
                        <button
                          type="button"
                          className="order-cancel-button"
                          onClick={() =>
                            handleCancelOrder(order._id || order.id)
                          }
                          disabled={activeOrderId === (order._id || order.id)}
                        >
                          {activeOrderId === (order._id || order.id)
                            ? "Cancelling..."
                            : "Cancel order"}
                        </button>
                      ) : (
                        <p className="order-note">
                          Cancellation unavailable for this order status.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="orders-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="orders-page-indicator">
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

export default MyOrdersPage;
