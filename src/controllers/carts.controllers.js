import { sendEmailConfirm } from "./email.controllers.js";
import { productService, cartService, ordersService } from '../services/services.js'
import { catchedAsync } from "../utils/catchedAsync.js";
import { response } from "../utils/response.js";
import { ClientError, NotFoundError, ValidationError } from "../utils/errors.js";
import userModel from "../services/dao/mongo/models/users.model.js";
import CartResponseDTO from "../services/dto/output/cartResponseDto.js";

const addToCart = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { productId, quantity } = req.body;
        const result = await productService.getProductById(productId, req.logger)
        if (result.owner === req.user.email) {
            throw new ValidationError('No puede comprar su propio producto.')
        }        
        const cart = await cartService.addProductToCart(
            { user: _id },
            { items: { product: productId, quantity: quantity } },
            { new: true, upsert: true }, req.logger
        );
        response(res, 201, cart, 'Producto Agregado Correctamente.')
    } catch (error) {
        next(error)
    }
};

const removeProductFromCart = async (req, res, next) => {
    try {
        const { _id } = req.user
        const { productId, quantity } = req.params;
        const quantityToRemove = quantity
        const result = await cartService.removeProductFromCart(_id, productId, quantityToRemove, req.logger);
        response(res, 201, result, 'Cantidad modificada correctamente.')
    } catch (error) {
        next(error)
    }
}

const remProduct = async (req, res) => {
    try {
        const { _id } = req.user
        const { productId } = req.params
        const result = await cartService.removeProduct(_id, productId, req.logger);
        if (result.matchedCount === 0) {
            req.logger.warning(`${req.method} en ${req.url} - Error: "No se encontró el producto o el usuario no tiene ese producto en su carrito" at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError("No se encontró el producto o el usuario no tiene ese producto en su carrito");
        }
        response(res, 201, result, 'Producto eliminado del carrito correctamente.')
    } catch (error) {
        next()
    }
}

const remProductbuy = async (_id, productId, res, req, next) => {
    try {
        const result = await cartService.removeProduct(_id, productId, req.logger);
        if (result.modifiedCount === 0) {
            req.logger.warning(`${req.method} en ${req.url} - Error: "No se encontró el producto o el usuario no tiene ese producto en su carrito" at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError("No se encontró el producto o el usuario no tiene ese producto en su carrito");
        }
        return ({ status: 'success' })     
    } catch (error) {
        next(error)
    }
}

const getCartUser = async (req, res, next) => {
    try {
        const { _id } = req.user
        const cart = await cartService.getCartByUserId(_id, req.logger);
        if (!cart) {
            req.logger.warning(`${req.method} en ${req.url} - Error: "No se encontro un carrito para ese usuario" at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)

            throw new NotFoundError('No se encontro un carrito para ese usuario')
        }
        const cartResponse = new CartResponseDTO(cart)
        response(res, 200, cartResponse)
    } catch (error) {
        next(error)
    }

}

const purchase = async (req, res, next) => {
    const { _id, email } = req.user;    
    const cart = await cartService.getCartByUserId(_id, req.logger);    
    if (!cart.items.length) {
        req.logger.warning(`${req.method} en ${req.url} - Error: 'No hay productos para comprar' at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
        throw new NotFoundError('No hay productos para comprar');
    }
    const { productosConStock, productosSinStock, totalPrice } = await processCartItems(cart.items, req);  
    if (productosSinStock.length >= 0 && productosConStock.length === 0) {
        req.logger.warning(`${req.method} en ${req.url} - Error: No hay suficiente stock de productos para continuar con la compra.' at 
            ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
        throw new ClientError('No hay suficiente stock de productos para continuar con la compra.');
    }
    let sinStock = []
    if (productosConStock.length >= 1) {
        if (productosSinStock.length >= 1) {
            sinStock = productosSinStock
        }
        const newOrder = createOrder(_id, email, productosConStock, totalPrice);        
        await updateStockAndRemoveFromCart(productosConStock, _id, res, req, next);        
        const purchasedProductsToAdd = productosConStock.map(product => ({
            product: {
                productId: product.product,
                status: false
            }
        }));       
        await userModel.updateOne(
            { _id },
            {
                $push: {
                    purchasedProducts: { $each: purchasedProductsToAdd }
                }
            }
        );        
        const order = await ordersService.saveOrder(newOrder, req.logger);
        sendEmailConfirm(newOrder, res);        
        if (productosSinStock.length >= 1) {
            response(res, 201, order, `Algunas articulos sin stock no se incluyeron en su orden de compra.${sinStock}`);
        } else {
            response(res, 201, order, 'Orden de compra generada correctamente.');
        }
    }
};

const processCartItems = async (items, req) => {   
        let totalPrice = 0;
        let productosConStock = [];
        let productosSinStock = [];        
        const productPromises = items.map(async item => {
            if (item.product && item.product._id) {
                return await productService.getProductById(item.product._id, req.logger);
            } else {
                return console.log('eas')
            }
        });
        const validProductPromises = productPromises.filter(promise => promise !== null);
        const products = await Promise.all(validProductPromises); 
        products.forEach((product, index) => {
            const item = items[index];
            if (product && item.quantity <= product.stock) {
                let productPrice = product.price * item.quantity;
                totalPrice += productPrice;
                productosConStock.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price,
                    total: productPrice
                });
            } else {
                productosSinStock.push({
                    product: item.product ? item.product.title : 'Producto no disponible'
                });
            }
        });
        return { productosConStock, productosSinStock, totalPrice };   
};


const createOrder = (userId, email, productosConStock, totalPrice) => ({
    customer: userId,
    email,
    products: productosConStock,
    total: totalPrice,
    date: new Date()
});

const updateStockAndRemoveFromCart = async (productosConStock, userId, res, req, next) => {  
    const updatePromises = productosConStock.map(async (item) => {
        const productToUpdate = await productService.getProductById(item.product, req.logger);
        await productService.updateProductStock(item.product, productToUpdate.stock - item.quantity, req.logger, next);
        const remProductBuy = await remProductbuy(userId, item.product, res, next);
        if (remProductBuy.status === 'success') {            
            await Promise.all(updatePromises)
        }
    });
    return ({ status: 'success' })
};

const TuningupdateStockAndRemoveFromCart = catchedAsync(updateStockAndRemoveFromCart)
const TuningprocessCartItems = catchedAsync(processCartItems)
const TuningaddToCart = catchedAsync(addToCart);
const TuningremoveProductFromCart = catchedAsync(removeProductFromCart);
const TuningremProduct = catchedAsync(remProduct);
const TuningremProductbuy = catchedAsync(remProductbuy);
const TuninggetCartUser = catchedAsync(getCartUser);
const Tuningpurchase = catchedAsync(purchase);
export {
    TuningupdateStockAndRemoveFromCart as updateStockAndRemoveFromCart,
    TuningprocessCartItems as processCartItems,
    TuningaddToCart as addToCart,
    TuningremoveProductFromCart as removeProductFromCart,
    TuningremProduct as remProduct,
    TuningremProductbuy as remProductbuy,
    TuninggetCartUser as getCartUser,
    Tuningpurchase as purchase
};