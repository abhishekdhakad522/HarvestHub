import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// Add item to cart
export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    try {
        // Validate input
        if (!productId || !quantity) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // Check if product exists and is available
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.status !== 'available') {
            return res.status(400).json({ message: "Product is not available" });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: `Only ${product.quantity} items available in stock` });
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity if product already in cart
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (product.quantity < newQuantity) {
                return res.status(400).json({ 
                    message: `Cannot add more. Only ${product.quantity} items available` 
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item to cart
            cart.items.push({
                product: productId,
                quantity: quantity,
                price: product.price
            });
        }

        // Calculate totals
        cart.calculateTotals();
        await cart.save();

        // Populate product details
        await cart.populate('items.product', 'name price images category status');

        res.status(200).json({
            message: "Item added to cart successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart", error: error.message });
    }
};

// Get user's cart
export const getCart = async (req, res) => {
    const userId = req.user.userId;

    try {
        let cart = await Cart.findOne({ user: userId })
            .populate('items.product', 'name price images category status unit seller');

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                cart: {
                    items: [],
                    totalPrice: 0,
                    totalItems: 0
                }
            });
        }

        res.status(200).json({
            message: "Cart fetched successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cart", error: error.message });
    }
};

// Update item quantity in cart
export const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    try {
        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: "Product ID and quantity are required" });
        }

        if (quantity < 0) {
            return res.status(400).json({ message: "Quantity cannot be negative" });
        }

        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // If quantity is 0, remove item
        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock availability
            const product = await Product.findById(productId);
            if (product.quantity < quantity) {
                return res.status(400).json({ 
                    message: `Only ${product.quantity} items available in stock` 
                });
            }
            
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        // Calculate totals
        cart.calculateTotals();
        await cart.save();

        await cart.populate('items.product', 'name price images category status');

        res.status(200).json({
            message: "Cart updated successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating cart", error: error.message });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.userId;

    try {
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Filter out the item
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        // Calculate totals
        cart.calculateTotals();
        await cart.save();

        await cart.populate('items.product', 'name price images category status');

        res.status(200).json({
            message: "Item removed from cart successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({ message: "Error removing item from cart", error: error.message });
    }
};

// Clear entire cart
export const clearCart = async (req, res) => {
    const userId = req.user.userId;

    try {
        const cart = await Cart.findOne({ user: userId });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];
        cart.totalPrice = 0;
        cart.totalItems = 0;
        
        await cart.save();

        res.status(200).json({
            message: "Cart cleared successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({ message: "Error clearing cart", error: error.message });
    }
};
