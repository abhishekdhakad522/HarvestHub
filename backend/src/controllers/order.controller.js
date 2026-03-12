import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const createOrder = async (req, res) => {
    const { shippingAddress, paymentMethod, orderNotes } = req.body;
    const buyer = req.user.userId;

    try {
        // Validate required fields
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: "Shipping address and payment method are required" });
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: buyer }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Verify product availability and prepare order items
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product._id);

            if (!product) {
                return res.status(404).json({ message: `Product ${cartItem.product.name} not found` });
            }

            if (product.status !== 'available') {
                return res.status(400).json({ message: `Product ${product.name} is not available` });
            }

            if (product.quantity < cartItem.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient quantity for ${product.name}. Available: ${product.quantity}` 
                });
            }

            // Add to order items
            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: cartItem.quantity,
                price: cartItem.price,
                seller: product.seller
            });

            totalAmount += cartItem.price * cartItem.quantity;
        }

        // Calculate shipping (you can customize this)
        const shippingCost = totalAmount > 1000 ? 0 : 50; // Free shipping above 1000
        const finalAmount = totalAmount + shippingCost;

        // Create order
        const newOrder = new Order({
            buyer,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cash-on-delivery' ? 'pending' : 'pending',
            totalAmount,
            shippingCost,
            finalAmount,
            orderNotes
        });

        await newOrder.save();

        // Update product quantities
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { quantity: -item.quantity } }
            );
        }

        // Clear the cart
        cart.items = [];
        cart.totalPrice = 0;
        cart.totalItems = 0;
        await cart.save();

        // Populate order details
        await newOrder.populate('buyer', 'username email');
        await newOrder.populate('items.product', 'name images');
        await newOrder.populate('items.seller', 'username');

        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.message });
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
            .populate('items.product', 'name images')
            .populate('items.seller', 'username')
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
                ordersPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const order = await Order.findById(id)
            .populate('buyer', 'username email profilePicture')
            .populate('items.product', 'name images category')
            .populate('items.seller', 'username email');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if user is the buyer or one of the sellers
        const isBuyer = order.buyer._id.toString() === userId;
        const isSeller = order.items.some(item => item.seller._id.toString() === userId);

        if (!isBuyer && !isSeller) {
            return res.status(403).json({ message: "You are not authorized to view this order" });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching order", error: error.message });
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
        const query = { 'items.seller': sellerId };
        if (req.query.status) {
            query.orderStatus = req.query.status;
        }

        const orders = await Order.find(query)
            .populate('buyer', 'username email profilePicture')
            .populate('items.product', 'name images')
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
                ordersPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching seller orders", error: error.message });
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
        const isSeller = order.items.some(item => item.seller.toString() === userId);

        if (!isSeller) {
            return res.status(403).json({ message: "You are not authorized to update this order" });
        }

        // Validate status
        const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        // Update order status
        order.orderStatus = orderStatus;

        if (orderStatus === 'delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'paid';
        }

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating order status", error: error.message });
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
            return res.status(403).json({ message: "You are not authorized to cancel this order" });
        }

        // Can only cancel if order is pending or confirmed
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({ 
                message: "Cannot cancel order. Order is already being processed or delivered" 
            });
        }

        // Restore product quantities
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { quantity: item.quantity } }
            );
        }

        // Update order
        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        order.paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'pending';

        await order.save();

        res.status(200).json({
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling order", error: error.message });
    }
};
