import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";
import { fetchCurrentUser } from "../lib/auth.js";
import { getSellerOrders, updateOrderStatus } from "../lib/orders.js";

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

function getSellerStatus(order, sellerId) {
  const sellerItems = Array.isArray(order?.items)
    ? order.items.filter((item) => {
        const itemSellerId =
          typeof item.seller === "string" ? item.seller : item.seller?._id;
        return String(itemSellerId || "") === String(sellerId || "");
      })
    : [];

  if (!sellerItems.length) {
    return "pending";
  }

  return String(sellerItems[0]?.fulfillmentStatus || "pending").toLowerCase();
}

function SellerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUpdateOrderId, setActiveUpdateOrderId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [sellerId, setSellerId] = useState("");

  const allowedUpdateStatuses = ["confirmed", "processing", "shipped", "delivered"];

  useEffect(() => {
    const loadSellerOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const currentUser = await fetchCurrentUser();

        if (!currentUser) {
          navigate("/signin", { replace: true });
          return;
        }

        if (currentUser.role !== "farmer") {
          navigate("/shop", { replace: true });
          return;
        }

        setSellerId(currentUser._id || currentUser.id || "");

        const response = await getSellerOrders({ page: currentPage, limit: 10 });
        const nextOrders = Array.isArray(response?.orders) ? response.orders : [];
        setOrders(nextOrders);
        setTotalPages(Math.max(Number(response?.pagination?.totalPages || 1), 1));
        setSelectedStatuses(
          nextOrders.reduce((statusMap, order) => {
            const orderId = order._id || order.id;
            if (orderId) {
              const currentStatus = getSellerStatus(order, currentUser._id || currentUser.id);
              statusMap[orderId] = allowedUpdateStatuses.includes(currentStatus)
                ? currentStatus
                : "confirmed";
            }
            return statusMap;
          }, {}),
        );
      } catch (error) {
        setErrorMessage(error.message || "Unable to load seller orders right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSellerOrders();
  }, [currentPage, navigate]);

  const handlePreviousPage = () => {
    setCurrentPage((previousValue) => Math.max(1, previousValue - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previousValue) => Math.min(totalPages, previousValue + 1));
  };

  const handleStatusSelection = (orderId, nextStatus) => {
    setSelectedStatuses((currentValue) => ({
      ...currentValue,
      [orderId]: nextStatus,
    }));
  };

  const canUpdateOrder = (sellerStatus, overallStatus) => {
    const statusValue = String(sellerStatus || "").toLowerCase();
    const globalStatus = String(overallStatus || "").toLowerCase();
    if (globalStatus === "cancelled") {
      return false;
    }
    return !["cancelled", "delivered"].includes(statusValue);
  };

  const handleUpdateOrderStatus = async (orderId) => {
    const nextStatus = selectedStatuses[orderId] || "confirmed";
    setActiveUpdateOrderId(orderId);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await updateOrderStatus(orderId, nextStatus);
      const updatedOrder = response?.order;

      if (updatedOrder?._id) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            (order._id || order.id) === updatedOrder._id ? updatedOrder : order,
          ),
        );
        setSelectedStatuses((currentValue) => ({
          ...currentValue,
          [updatedOrder._id]: getSellerStatus(updatedOrder, sellerId),
        }));
      }

      setStatusMessage("Order status updated successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to update order status right now.");
    } finally {
      setActiveUpdateOrderId("");
    }
  };

  return (
    <section className="orders-page">
      <BackButton fallbackPath="/profile" />
      <p className="eyebrow">Farmer dashboard</p>
      <h1>Seller orders</h1>
      <p className="hero-copy">
        View orders that include your listed products and track buyer demand.
      </p>

      {isLoading ? <p className="orders-status">Loading seller orders...</p> : null}

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
          <p>No incoming orders yet.</p>
          <Link className="secondary-button" to="/shop">
            Browse marketplace
          </Link>
        </div>
      ) : null}

      {!isLoading && !errorMessage && orders.length > 0 ? (
        <>
          <div className="orders-list">
            {orders.map((order) => {
              const sellerItems = Array.isArray(order.items)
                ? order.items.filter((item) => {
                    const itemSellerId =
                      typeof item.seller === "string"
                        ? item.seller
                        : item.seller?._id;
                    return String(itemSellerId || "") === String(sellerId || "");
                  })
                : [];
              const firstItem = sellerItems[0] || order.items?.[0];
              const firstImage = firstItem?.product?.images?.[0] || DEFAULT_PRODUCT_IMAGE;
              const totalItems = sellerItems.reduce(
                (sum, item) => sum + Math.max(Number(item.quantity || 0), 0),
                0,
              );
              const sellerAmount = sellerItems.reduce(
                (sum, item) =>
                  sum + Number(item.price || 0) * Math.max(Number(item.quantity || 0), 0),
                0,
              );
              const buyerLabel =
                order.buyer?.username || order.buyerName || order.buyerEmail || "N/A";
              const sellerStatus = getSellerStatus(order, sellerId);

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
                      <h2>Order #{order._id?.slice(-6) || "N/A"}</h2>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>

                    <p className="order-line">
                      Buyer: {buyerLabel} • {totalItems} item
                      {totalItems === 1 ? "" : "s"}
                    </p>

                    <div className="order-stats-grid">
                      <p>
                        <span>Your status</span>
                        <strong>{sellerStatus}</strong>
                      </p>
                      <p>
                        <span>Payment</span>
                        <strong>{order.paymentStatus || "pending"}</strong>
                      </p>
                      <p>
                        <span>Your subtotal</span>
                        <strong>₹{sellerAmount.toFixed(2)}</strong>
                      </p>
                      <p>
                        <span>Method</span>
                        <strong>{order.paymentMethod || "N/A"}</strong>
                      </p>
                    </div>

                    <div className="order-actions">
                      <Link
                        className="secondary-button order-open-button"
                        to={`/my-orders/${order._id || order.id}`}
                      >
                        View details
                      </Link>

                      {canUpdateOrder(sellerStatus, order.orderStatus) ? (
                        <>
                          <label className="order-status-selector">
                            <span>Status</span>
                            <select
                              className="order-status-select"
                              value={selectedStatuses[order._id || order.id] || "confirmed"}
                              onChange={(event) =>
                                handleStatusSelection(
                                  order._id || order.id,
                                  event.target.value,
                                )
                              }
                              disabled={activeUpdateOrderId === (order._id || order.id)}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </label>

                          <button
                            type="button"
                            className="order-update-button"
                            onClick={() => handleUpdateOrderStatus(order._id || order.id)}
                            disabled={activeUpdateOrderId === (order._id || order.id)}
                          >
                            {activeUpdateOrderId === (order._id || order.id)
                              ? "Updating..."
                              : "Update status"}
                          </button>
                        </>
                      ) : (
                        <p className="order-note">
                          Status cannot be changed for this order.
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

export default SellerOrdersPage;
