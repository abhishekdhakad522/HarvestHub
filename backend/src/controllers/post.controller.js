import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
    const { title, content, slug, category, imageUrl, tags } = req.body;
    const author = req.user.userId;

    try {
        // Validate required fields
        if (!title || !content || !slug) {
            return res.status(400).json({ message: "Title, content, and slug are required" });
        }

        // Check if slug already exists
        const existingSlug = await Post.findOne({ slug });
        if (existingSlug) {
            return res.status(400).json({ message: "Slug already exists. Please use a unique slug." });
        }

        const newPost = new Post({
            author,
            title,
            content,
            slug,
            category: category || 'general',
            imageUrl,
            tags: tags || []
        });

        await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filters
        const category = req.query.category;
        const tag = req.query.tag;
        const author = req.query.author;
        const search = req.query.search;

        // Build query
        const query = { isPublished: true };
        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (author) query.author = author;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } }, // i represents case-insensitive search
                { content: { $regex: search, $options: 'i' } } // regex => regular expression for partial matching
            ];
        }

        // Sorting
        const sortOrder = req.query.sort === 'oldest' ? 1 : -1; // by default, sort by newest first

        const posts = await Post.find(query)
            .populate('author', 'username profilePicture') // populate author details (only username and profilePicture)
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments(query);

        res.status(200).json({
            message: "Posts fetched successfully",
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                postsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
};

export const getPostBySlug = async (req, res) => {
    const { slug } = req.params;

    try {
        const post = await Post.findOne({ slug, isPublished: true })
            .populate('author', 'username email profilePicture role');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Increment views
        post.views += 1;
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error: error.message });
    }
};

export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id)
            .populate('author', 'username email profilePicture role');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Error fetching post", error: error.message });
    }
};

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content, slug, category, imageUrl, tags, isPublished } = req.body;
    const userId = req.user.userId;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is the author
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own posts" });
        }

        // Check if new slug is unique
        if (slug && slug !== post.slug) {
            const existingSlug = await Post.findOne({ slug });
            if (existingSlug) {
                return res.status(400).json({ message: "Slug already exists" });
            }
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (slug) post.slug = slug;
        if (category) post.category = category;
        if (imageUrl) post.imageUrl = imageUrl;
        if (tags) post.tags = tags;
        if (typeof isPublished === 'boolean') post.isPublished = isPublished;

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
};

export const deletePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is the author
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};

export const getMyPosts = async (req, res) => {
    const userId = req.user.userId;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments({ author: userId });

        res.status(200).json({
            message: "Your posts fetched successfully",
            posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalPosts / limit),
                totalPosts,
                postsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error: error.message });
    }
};
