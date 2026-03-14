import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'harvesthub/products', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

export const createProduct = async (req, res) => {
    const { name, description, category, price, unit, quantity, location, tags } = req.body;
    const seller = req.user.userId;

    try {
        // Validate required fields
        if (!name || !description || !category || !price || quantity === undefined) {
            return res.status(400).json({ message: "Name, description, category, price, and quantity are required" });
        }

        // Upload image to Cloudinary if a file is provided
        let images = [];
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            images = [result.secure_url];
        }

        const newProduct = new Product({
            seller,
            name,
            description,
            category,
            price,
            unit: unit || 'kg',
            quantity,
            location,
            images,
            tags: tags || []
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filters
        const category = req.query.category;
        const status = req.query.status;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        const search = req.query.search;
        const location = req.query.location; // city or state

        // Build query
        const query = {};
        if (category) query.category = category;
        if (status) query.status = status;
        else query.status = { $ne: 'sold' }; // By default, exclude sold products

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } }
            ];
        }

        // Sorting
        let sortOption = {};
        if (req.query.sort === 'price-asc') {
            sortOption = { price: 1 };
        } else if (req.query.sort === 'price-desc') {
            sortOption = { price: -1 };
        } else if (req.query.sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else {
            sortOption = { createdAt: -1 }; // newest first by default
        }

        const products = await Product.find(query)
            .populate('seller', 'username profilePicture role')
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            message: "Products fetched successfully",
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                productsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id)
            .populate('seller', 'username email profilePicture role');

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, category, price, unit, quantity, location, tags, status } = req.body;
    const userId = req.user.userId;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user is the seller
        if (product.seller.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own products" });
        }

        // Upload new image to Cloudinary if a file is provided
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            product.images = [result.secure_url];
        }

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (category) product.category = category;
        if (price !== undefined) product.price = price;
        if (unit) product.unit = unit;
        if (quantity !== undefined) product.quantity = quantity;
        if (location) product.location = location;
        if (tags) product.tags = tags;
        if (status) product.status = status;

        await product.save();

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user is the seller
        if (product.seller.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own products" });
        }

        await Product.findByIdAndDelete(id);

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

export const getMyProducts = async (req, res) => { // find all products of the logged-in user
    const userId = req.user.userId;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find({ seller: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments({ seller: userId });

        res.status(200).json({
            message: "Your products fetched successfully",
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                productsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};
