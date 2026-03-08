import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
    },
    content: {
        type: String,
        required: true
    },
    slug: {// used for SEO-friendly URLs
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: String,
        enum: ['farming-tips', 'news', 'success-stories', 'market-trends', 'equipment-review', 'general'],
        default: 'general'
    },
    imageUrl: {
        type: String,
        default: 'https://plus.unsplash.com/premium_photo-1678344170545-c3edef92a16e?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    tags: [{ // used for searching and filtering posts
        type: String,
        trim: true,
        lowercase: true
    }],
    views: { // to track number of views for a post
        type: Number,
        default: 0
    },
    isPublished: { // to show only publicly or privately visible posts
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, isPublished: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;