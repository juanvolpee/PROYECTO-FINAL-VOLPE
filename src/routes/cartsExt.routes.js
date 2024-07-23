import CustomRouter from "./customs.routes.js";
import { addToCart, getCartUser, removeProductFromCart, purchase, remProduct } from "../controllers/carts.controllers.js";
import { validateQuantity } from '../services/middlewares/validateDataCart.js'

export class CartRouter extends CustomRouter {
    init() {
        this.post('/add', ['USER', 'PREMIUM','ADMIN'], validateQuantity, addToCart);

        this.get('/', ['USER', 'PREMIUM','ADMIN'], getCartUser);

        this.put('/remove/:productId', ['USER', 'PREMIUM','ADMIN'], remProduct)

        this.delete('/:productId/:quantity', ['USER', 'PREMIUM','ADMIN'], removeProductFromCart);

        this.post('/purchase', ['USER', 'PREMIUM','ADMIN'], purchase)

    }
}