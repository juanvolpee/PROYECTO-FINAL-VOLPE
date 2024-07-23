export default class CartRepository {
    constructor(dao) {
        this.dao = dao
    }
    removeProductFromCart = async (userId, productId, quantityToRemove, logger) => {
        return this.dao.removeProductFromCart(userId, productId, quantityToRemove, logger)
    }

    removeProduct = async (userId, productId, logger) => {
        return this.dao.removeProduct(userId, productId, logger)
    }

    addProductToCart = async (userIdObject, productDetails, logger) => {
        return this.dao.addProductToCart(userIdObject, productDetails, logger)
    }
    getCartByUserId = async (userId, logger) => {
        return this.dao.getCartByUserId(userId, logger)
    }
    createEmptyCart = async (userId, logger) => {
        return this.dao.createEmptyCart(userId, logger)
    }



}