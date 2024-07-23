import cartModel from './models/carts.models.js';
import { ClientError, DatabaseError, NotFoundError } from '../../../utils/errors.js'
//import { productService } from '../../services.js';
import ProductServicesDao from './products.services.js';

export default class CartServicesDao {
    constructor() {
    }
    productService = new ProductServicesDao()

    addProductToCart = async (userIdObject, productDetails, logger) => {
        const userId = userIdObject.user;
        const productId = productDetails.items.product;
        const quantity = productDetails.items.quantity;
        const productoExist = await this.productService.getProductById(productId)
        if (!productoExist) {
            logger.warning(`Ocurrio un error al intentar agregar el producto al carrito.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new ClientError('El producto que quiere agrear al carrito no existe.')
        }
        let cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            cart = new cartModel({ user: userId, items: [] });
        }
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity: quantity });
        }
        const result = await cart.save();
        if (!result) {
            logger.error(`Ocurrio un error al intentar agregar el producto al carrito.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
        }
        return cart;

    }
    removeProduct = async (_id, productId, logger) => {
        const initialDoc = await cartModel.findOne({ user: _id });
        const hasProduct = initialDoc && initialDoc.items.some(item => item.product.toString() === productId.toString());
        
        if (hasProduct === false) {
            logger.warning(`El producto que quiere quitar del carrito no existe.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError('El producto que quiere quitar del carrito no existe.')
        }
        const result = await cartModel.updateOne(
            { user: _id },
            { $pull: { items: { product: productId } } }
        );

        if (result.modifiedCount <= 0) {
            logger.error(`Ocurrio un error al intentar quitar el producto del carrito.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new DatabaseError('Ocurrio un error al intentar quitar el producto del carrito.')
        }
        return result
    }

    removeProductFromCart = async (userId, productId, quantityToRemove, logger) => {
        const cart = await cartModel.findOne({ user: userId });
        if (!cart) {
            logger.warning(`No se encuentra un carrito asignado a este usuario.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError('No se encuentra un carrito asignado a este usuario.')
        }
        const productoExist = await this.productService.getProductById(productId)
        if (!productoExist) throw new ClientError('El producto no existe')
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            let item = cart.items[itemIndex];
            if (item.quantity > quantityToRemove) {
                item.quantity -= quantityToRemove;
            } else if (item.quantity === quantityToRemove) {
                cart.items.splice(itemIndex, 1);
            } else {
                logger.warning(`No se pueden quitar mas unidadades de las que hay.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
                throw new ClientError('No se pueden quitar mas unidadades de las que hay.')
            }
            await cart.save();
            return cart;
        } else {
            throw new ClientError()
        }

    }


    createEmptyCart = async (userId, logger) => {
        const newCart = await cartModel.create({
            user: userId,
            items: []
        });
        if (!newCart) {
            logger.error(`Ocurrio un error al intentar crear el carrito vacio.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new ClientError('Ocurrio un error al intentar crear el carrito vacio.')
        }
        return newCart;

    }

    getCartByUserId = async (userId, logger) => {
        try {
            const cart = await cartModel.findOne({ user: userId }).populate('items.product');
            if (!cart) {                
                // logger.warning(`No se encontró un carrito para el usuario con ID: ${userId}`);
                throw new Error('Carrito no encontrado');
            }
            //logger.info(`Carrito encontrado: ${JSON.stringify(cart)}`);
            return cart;
        } catch (error) {
            console.log(error)
            //logger.error(`Error al obtener el carrito para el usuario con ID: ${userId} - ${error.message}`);
            throw error;
        }
    }

}

