import Post from "../models/post.model.js";
import PostView from "../models/postView.model.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `harvesthub/${folder}`, transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

const getPublicIdFromImageUrl = (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('res.cloudinary.com') || !imageUrl.includes('/upload/')) {
        return null;
    }

    const uploadPart = imageUrl.split('/upload/')[1];
    if (!uploadPart) {
        return null;
    }

    const parts = uploadPart.split('/').filter(Boolean);
    const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
    const publicPathParts = versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts;

    if (publicPathParts.length === 0) {
        return null;
    }

    const lastPart = publicPathParts[publicPathParts.length - 1];
    publicPathParts[publicPathParts.length - 1] = lastPart.replace(/\.[a-zA-Z0-9]+$/, '');

    return publicPathParts.join('/');
};

const destroyCloudinaryAsset = async (publicId, imageUrl) => {
    const resolvedPublicId = publicId || getPublicIdFromImageUrl(imageUrl);

    if (!resolvedPublicId) {
        return;
    }

    await cloudinary.uploader.destroy(resolvedPublicId);
};

const incrementViewIfNeeded = async (post, userId) => {
    if (!post) {
        return null;
    }

    if (!userId) {
        post.views += 1;
        await post.save();
        return post;
    }

    const existingView = await PostView.findOne({ post: post._id, user: userId });
    if (existingView) {
        return post;
    }

    await PostView.create({
        post: post._id,
        user: userId
    });

    post.views += 1;
    await post.save();
    return post;
};

export const createPost = async (req, res) => {
    const { title, content, slug, category, tags } = req.body;
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

        // Upload image to Cloudinary if a file is provided
        let imageUrl;
        let imagePublicId;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'posts');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const newPost = new Post({
            author,
            title,
            content,
            slug,
            category: category || 'general',
            imageUrl,
            imagePublicId,
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
        let post = await Post.findOne({ slug, isPublished: true })
            .populate('author', 'username email profilePicture role');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post = await incrementViewIfNeeded(post, req.user?.userId);

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

export const incrementPostViews = async (req, res) => {
    const { id } = req.params;

    try {
        let post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        post = await incrementViewIfNeeded(post, req.user?.userId);

        res.status(200).json({ views: post.views });
    } catch (error) {
        res.status(500).json({ message: "Error incrementing post views", error: error.message });
    }
};

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content, slug, category, tags, isPublished } = req.body;
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

        // Upload new image to Cloudinary if a file is provided
        if (req.file) {
            await destroyCloudinaryAsset(post.imagePublicId, post.imageUrl);
            const result = await uploadToCloudinary(req.file.buffer, 'posts');
            post.imageUrl = result.secure_url;
            post.imagePublicId = result.public_id;
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (slug) post.slug = slug;
        if (category) post.category = category;
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

        await destroyCloudinaryAsset(post.imagePublicId, post.imageUrl);

        await Post.findByIdAndDelete(id);
        await PostView.deleteMany({ post: id });

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
