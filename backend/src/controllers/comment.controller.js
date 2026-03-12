import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

export const createComment = async (req, res) => {
    const { postId, content } = req.body;
    const author = req.user.userId;

    try {
        // Validate required fields
        if (!postId || !content) {
            return res.status(400).json({ message: "Post ID and content are required" });
        }

        // Check if post exists
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = new Comment({
            author,
            post: postId,
            content
        });

        await newComment.save();

        // Populate author details before sending response
        await newComment.populate('author', 'username profilePicture');

        res.status(201).json({
            message: "Comment created successfully",
            comment: newComment
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating comment", error: error.message });
    }
};

export const getCommentsByPost = async (req, res) => {
    const { postId } = req.params;

    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Sorting
        const sortOrder = req.query.sort === 'oldest' ? 1 : -1;

        const comments = await Comment.find({ post: postId })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments({ post: postId });

        res.status(200).json({
            message: "Comments fetched successfully",
            comments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit),
                totalComments,
                commentsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};

export const getCommentById = async (req, res) => {
    const { id } = req.params;

    try {
        const comment = await Comment.findById(id)
            .populate('author', 'username profilePicture')
            .populate('post', 'title slug');

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.status(200).json({
            message: "Comment fetched successfully",
            comment
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comment", error: error.message });
    }
};

export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    try {
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user is the author of the comment
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this comment" });
        }

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        comment.content = content;
        comment.isEdited = true;
        await comment.save();

        await comment.populate('author', 'username profilePicture');

        res.status(200).json({
            message: "Comment updated successfully",
            comment
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating comment", error: error.message });
    }
};

export const deleteComment = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if the user is the author of the comment
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        await Comment.findByIdAndDelete(id);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
};

export const getMyComments = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ author: userId })
            .populate('post', 'title slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalComments = await Comment.countDocuments({ author: userId });

        res.status(200).json({
            message: "Comments fetched successfully",
            comments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalComments / limit),
                totalComments,
                commentsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching comments", error: error.message });
    }
};

export const toggleLike = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user already liked the comment
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike the comment
            comment.likes.splice(likeIndex, 1);
            await comment.save();
            return res.status(200).json({
                message: "Comment unliked successfully",
                likes: comment.likes.length
            });
        } else {
            // Like the comment
            comment.likes.push(userId);
            await comment.save();
            return res.status(200).json({
                message: "Comment liked successfully",
                likes: comment.likes.length
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Error toggling like", error: error.message });
    }
};
