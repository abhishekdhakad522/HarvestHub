import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['vegetables', 'fruits', 'grains', 'equipment', 'seeds', 'other'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ['kg',  'ton', 'piece', 'dozen', 'other'],
        default: 'kg'
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true }
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['available', 'sold', 'outOfStock'],
        default: 'available'
    },
    tags: [{ // used for searching and filtering products
        type: String,
        trim: true,
        lowercase: true
    }],
   
}, {
    timestamps: true
});

// Indexes for faster queries
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1, createdAt: -1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
