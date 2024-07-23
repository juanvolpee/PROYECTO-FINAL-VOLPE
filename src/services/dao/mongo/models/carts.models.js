import mongoose from "mongoose";

const cartCollection = 'cart'
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
}, { timestamps: true });

const cartModel = mongoose.model(cartCollection, cartSchema);

export default cartModel;
