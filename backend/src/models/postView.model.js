import mongoose from "mongoose";

const postViewSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

postViewSchema.index({ post: 1, user: 1 }, { unique: true });

const PostView = mongoose.model('PostView', postViewSchema);

export default PostView;