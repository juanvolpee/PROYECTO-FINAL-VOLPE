import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productCollection = 'products';

const stringTypeSchemaUniqueRequired = {
    type: String,
    unique: true,
    required: true,
};

const stringTypeSchemaNonUniqueRequired = {
    type: String,
    required: true,
};

const valorationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    star: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const productSchema = new mongoose.Schema(
    {
        title: stringTypeSchemaNonUniqueRequired,
        description: stringTypeSchemaNonUniqueRequired,
        stock: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        pcode: stringTypeSchemaUniqueRequired,
        category: {
            type: String,
            required: true,
        },

        valorations: [valorationSchema],

        questions: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'questionProducts',
        },
        fecharegistro: {
            type: Date,
            default: Date.now,
        },
        img: [],

        owner: {
            type: String,
            
        },
    },
    { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(productCollection, productSchema);
