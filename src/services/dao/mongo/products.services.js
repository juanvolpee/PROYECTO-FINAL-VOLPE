import { productModel } from "./models/products.model.js";
import { DatabaseError, NotFoundError } from "../../../utils/errors.js";
import userModel from "./models/users.model.js";
import mongoose from "mongoose";

export default class ProductServicesDao {
    constructor() { }

    getAllProducts = async (filter, options, logger) => {
        const products = await productModel.paginate(filter, options);
        if (!products) {
            logger.error(`Error al obtener todos los productos.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new DatabaseError('Error al obtener todos los productos.');
        }
        return products;
    };

    getProductByPcode = async (pcode, logger) => {
        const result = await productModel.findOne({ pcode });
        console.log('result', result);
        return result;
    };

    saveProduct = async (product, logger) => {
        const newProduct = await productModel.create(product);
        if (!newProduct) {
            logger.error(`Error al guardar el producto.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new DatabaseError('Error al guardar el producto.');
        }
        return newProduct;
    };

    getProductById = async (id, logger) => {
        const productFind = await productModel.findById(id);
        if (!productFind) {
            logger.error(`Error al actualizar el stock del producto' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new DatabaseError('Error al obtener el producto por ID.');
        }
        return productFind;
    };

    updateProductStock = async (id, newStock, logger) => {
        const updatedProduct = await productModel.findByIdAndUpdate(id, { $set: { stock: newStock } }, { new: true });
        if (!updatedProduct) {
            logger.error(`Error al actualizar el stock del producto' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new DatabaseError('Error al actualizar el stock del producto');
        }
        return updatedProduct;
    };

    delProduct = async (_id, logger) => {
        const deletedProduct = await productModel.deleteOne({ _id: _id });
        if (!deletedProduct) {
            logger.error(`Error al borrar el producto' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new DatabaseError('Error al borrar el producto');
        }
        return deletedProduct;
    };

    updateProduct = async (productId, product, logger) => {
        const options = { new: true };
        const result = await productModel.findByIdAndUpdate(productId, product, options);
        if (!result) {
            logger.error(`Error al actualizar producto' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new DatabaseError('Error al actualizar producto');
        }
        return result;
    };

    updateProductStatus = async (userId, productId, newStatus) => {
        try {
            const user = await userModel.findOne({ _id: new mongoose.Types.ObjectId(userId) });
            if (!user) {
                throw new Error('User not found');
            }
            const productObjectId = new mongoose.Types.ObjectId(productId);
            const productToUpdate = user.purchasedProducts.find(product => {
                return product.product.productId.equals(productObjectId);
            });

            if (!productToUpdate) {
                throw new NotFoundError('Product not found');
            }

            productToUpdate.product.status = newStatus;
            const updatedUser = await userModel.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                { $set: { purchasedProducts: user.purchasedProducts } }
            );
            return updatedUser;
        } catch (error) {
            console.error('Error updating product status:', error);
            throw error;
        }
    };

    valAdd = async (productId, _id, message, star, logger) => {
        const valorar = await this.puedoValorar(_id, productId);
        const dataUpdate = {
            userId: _id,
            message: message,
            star: star
        };
        if (valorar.canRate === true) {
            const saveValoration = await productModel.updateOne(
                { _id: new mongoose.Types.ObjectId(productId) },
                { $push: { valorations: dataUpdate } }
            );
        }
        let newStatus = true;
        const updatedStatus = await this.updateProductStatus(_id, productId, newStatus);
        return valorar;
    };

    puedoValorar = async (_id, productId) => {
        try {
            const productObjectId = new mongoose.Types.ObjectId(productId);
            const user = await userModel.findOne({ _id: new mongoose.Types.ObjectId(_id), 'purchasedProducts.product.productId': productObjectId });

            if (!user) {
                return { canRate: false, message: 'El usuario no tiene comprado este producto.' };
            }

            const purchasedProduct = user.purchasedProducts.find(pp => pp.product.productId.equals(productObjectId));
            if (purchasedProduct.product.status) {
                return { canRate: false, message: 'El producto ya fue valorado.' };
            }
            return { canRate: true, message: 'El usuario puede valorar este producto.' };

        } catch (error) {
            console.error('Error verificando si el usuario ya realizo la valoracion del producto:', error);
            throw error;
        }
    };
}
