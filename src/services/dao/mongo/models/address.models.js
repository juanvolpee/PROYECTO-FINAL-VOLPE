import mongoose from "mongoose";

const addressCollection = 'address';

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zipcode: {
        type: Number,
        required: true
    },
    addressText: {
        type: String,
        required: true
    },
    numext: {
        type: Number,
        required: true
    },
    numint: {
        type: String        
    }
}, { timestamps: true });

const addressModel = mongoose.model(addressCollection, addressSchema);

export default addressModel;
