export default class ProductRepository {
    constructor(dao) {
        this.dao = dao
    }
    getAllProducts = async (filter, options, logger) => {
        return this.dao.getAllProducts(filter, options, logger)
    }

    getProductByPcode = async (pcode, logger) => {
        return this.dao.getProductByPcode(pcode, logger)
    }

    saveProduct = async (product, logger) => {
        return this.dao.saveProduct(product, logger)
    }
    getProductById = async (id, logger) => {
        return this.dao.getProductById(id, logger)
    }

    updateProductStock = async (id, newStock, logger) => {
        return this.dao.updateProductStock(id, newStock, logger)
    }

    updateProduct = async (productId, product, logger) => {
        return this.dao.updateProduct(productId, product, logger)
    }

    delProduct = async (_id, logger) => {
        return this.dao.delProduct(_id, logger)
    }
    valAdd = async (productId, _id, message, star, logger) => {
        return this.dao.valAdd(productId, _id, message, star, logger)
    }

}