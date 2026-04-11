import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const STATUS_RANK = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

const deriveOverallOrderStatus = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "pending";
  }

  const statuses = items.map((item) =>
    String(item.fulfillmentStatus || "pending").toLowerCase(),
  );

  if (statuses.every((status) => status === "cancelled")) {
    return "cancelled";
  }

  const activeStatuses = statuses.filter((status) => status !== "cancelled");
  if (activeStatuses.length === 0) {
    return "cancelled";
  }

  if (activeStatuses.every((status) => status === "delivered")) {
    return "delivered";
  }

  const minRank = Math.min(
    ...activeStatuses.map((status) => STATUS_RANK[status] ?? STATUS_RANK.pending),
  );

  return (
    Object.keys(STATUS_RANK).find((status) => STATUS_RANK[status] === minRank) ||
    "pending"
  );
};

let razorpayClient = null;

const getRazorpayClient = () => {
  if (razorpayClient) {
    return razorpayClient;
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  return razorpayClient;
};

const computeOrderFromCart = async (buyer) => {
  const cart = await Cart.findOne({ user: buyer }).populate("items.product");
  const buyerUser = await User.findById(buyer).select("username email");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const orderItems = [];
  let totalAmount = 0;

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product._id);

    if (!product) {
      throw new Error(`Product ${cartItem.product.name} not found`);
    }

    if (product.status !== "available") {
      throw new Error(`Product ${product.name} is not available`);
    }

    if (product.quantity < cartItem.quantity) {
      throw new Error(
        `Insufficient quantity for ${product.name}. Available: ${product.quantity}`,
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: cartItem.quantity,
      price: cartItem.price,
      seller: product.seller,
      fulfillmentStatus: "pending",
    });

    totalAmount += cartItem.price * cartItem.quantity;
  }

  const shippingCost = totalAmount > 1000 ? 0 : 50;
  const finalAmount = totalAmount + shippingCost;

  return {
    cart,
    buyerUser,
    orderItems,
    totalAmount,
    shippingCost,
    finalAmount,
  };
};

const reserveInventoryAndClearCart = async (orderItems, cart) => {
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity },
    });
  }

  cart.items = [];
  cart.totalPrice = 0;
  cart.totalItems = 0;
  await cart.save();
};

export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, orderNotes } = req.body;
  const buyer = req.user.userId;
  const userRole = req.user.role;

  try {
    // Only buyers can place orders
    if (userRole !== "buyer") {
      return res
        .status(403)
        .json({
          message:
            "Only buyers can place orders. Farmers cannot order products.",
        });
    }

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Shipping address and payment method are required" });
    }

    const {
      cart,
      buyerUser,
      orderItems,
      totalAmount,
      shippingCost,
      finalAmount,
    } = await computeOrderFromCart(buyer);

    // Create order
    const newOrder = new Order({
      buyer,
      buyerName: buyerUser?.username,
      buyerEmail: buyerUser?.email,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus:
        paymentMethod === "cash-on-delivery" ? "pending" : "pending",
      totalAmount,
      shippingCost,
      finalAmount,
      orderNotes,
    });

    await newOrder.save();

    await reserveInventoryAndClearCart(orderItems, cart);

    // Populate order details
    await newOrder.populate("buyer", "username email");
    await newOrder.populate("items.product", "name images");
    await newOrder.populate("items.seller", "username");

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const createRazorpayOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, orderNotes } = req.body;
  const buyer = req.user.userId;
  const userRole = req.user.role;

  try {
    if (userRole !== "buyer") {
      return res.status(403).json({
        message: "Only buyers can place orders. Farmers cannot order products.",
      });
    }

    if (!shippingAddress || paymentMethod !== "razorpay") {
      return res.status(400).json({
        message: "Shipping address is required and payment method must be razorpay.",
      });
    }

    const razorpay = getRazorpayClient();

    if (!razorpay || !process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        message: "Razorpay is not configured on the server.",
      });
    }

    const {
      cart,
      buyerUser,
      orderItems,
      totalAmount,
      shippingCost,
      finalAmount,
    } = await computeOrderFromCart(buyer);

    const newOrder = new Order({
      buyer,
      buyerName: buyerUser?.username,
      buyerEmail: buyerUser?.email,
      items: orderItems,
      shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount,
      shippingCost,
      finalAmount,
      orderNotes,
    });

    const amountInPaise = Math.round(finalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${newOrder._id.toString().slice(-12)}`,
      notes: {
        localOrderId: newOrder._id.toString(),
      },
    });

    newOrder.paymentDetails = {
      razorpayOrderId: razorpayOrder.id,
    };

    await newOrder.save();
    await reserveInventoryAndClearCart(orderItems, cart);

    await newOrder.populate("buyer", "username email");
    await newOrder.populate("items.product", "name images");
    await newOrder.populate("items.seller", "username");

    return res.status(201).json({
      message: "Razorpay order created successfully",
      order: newOrder,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const message =
      error?.error?.description || error.message || "Error creating Razorpay order";

    const isValidationError = [
      "Cart is empty",
      "not found",
      "not available",
      "Insufficient quantity",
    ].some((text) => message.includes(text));

    const statusCode = isValidationError
      ? 400
      : error?.statusCode && Number.isInteger(error.statusCode)
        ? error.statusCode
        : 500;

    return res.status(statusCode).json({ message });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;
  const userId = req.user.userId;

  try {
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay secret is not configured." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.buyer.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to verify this order" });
    }

    if (order.paymentDetails?.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ message: "Razorpay order ID mismatch" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ message: "Invalid Razorpay signature" });
    }

    order.paymentStatus = "paid";
    order.paymentDetails = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    await order.save();

    return res.status(200).json({
      message: "Payment verified successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error verifying Razorpay payment",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  const buyer = req.user.userId;

  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by status if provided
    const query = { buyer };
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const orders = await Order.find(query)
      .populate("items.product", "name images")
      .populate("items.seller", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        ordersPerPage: limit,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const order = await Order.findById(id)
      .populate("buyer", "username email profilePicture")
      .populate("items.product", "name images category")
      .populate("items.seller", "username email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is the buyer or one of the sellers
    const isBuyer = order.buyer._id.toString() === userId;
    const isSeller = order.items.some(
      (item) => item.seller._id.toString() === userId,
    );

    if (!isBuyer && !isSeller) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this order" });
    }

    res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  const sellerId = req.user.userId;

  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by status if provided
    const query = { "items.seller": sellerId };
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const orders = await Order.find(query)
      .populate("buyer", "username email profilePicture")
      .populate("items.product", "name images")
      .populate("items.seller", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      message: "Seller orders fetched successfully",
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        ordersPerPage: limit,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching seller orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { orderStatus } = req.body;
  const userId = req.user.userId;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is a seller for this order
    const isSeller = order.items.some(
      (item) => item.seller.toString() === userId,
    );

    if (!isSeller) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this order" });
    }

    if (["cancelled", "delivered"].includes(String(order.orderStatus || "").toLowerCase())) {
      return res.status(400).json({ message: "Order status cannot be changed anymore" });
    }

    // Validate status
    const normalizedStatus = String(orderStatus || "").toLowerCase().trim();
    const validStatuses = ["confirmed", "processing", "shipped", "delivered"];
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    // Update only the current seller's order items.
    order.items.forEach((item) => {
      if (item.seller.toString() === userId) {
        item.fulfillmentStatus = normalizedStatus;
      }
    });

    // Derive global order status from all seller item statuses.
    order.orderStatus = deriveOverallOrderStatus(order.items);

    if (order.orderStatus === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is the buyer
    if (order.buyer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this order" });
    }

    // Can only cancel if order is pending or confirmed
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        message:
          "Cannot cancel order. Order is already being processed or delivered",
      });
    }

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity },
      });
    }

    // Update order
    order.orderStatus = "cancelled";
    order.items.forEach((item) => {
      item.fulfillmentStatus = "cancelled";
    });
    order.cancelledAt = new Date();
    order.paymentStatus =
      order.paymentStatus === "paid" ? "refunded" : "pending";

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
};
