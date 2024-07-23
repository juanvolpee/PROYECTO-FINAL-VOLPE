import mongoose, { Schema } from "mongoose";

const questionSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    }


}, { timestamps: true });

const questionModel = mongoose.model('questionProducts', questionSchema);

export default questionModel;