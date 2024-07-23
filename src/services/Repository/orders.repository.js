export default class OrdersRepository {
    constructor(dao) {
        this.dao = dao
    }

    saveOrder = async (orderData, logger, next) => {
        return this.dao.saveOrder(orderData, logger, next)
    }

    getOrdersByCustomerId = async (customerId, logger, next) => {
        return this.dao.getOrdersByCustomerId(customerId, logger, next)
    }

    getAllOrderByuserId = async (userId, logger) => {
        return this.dao.getAllOrderByuserId(userId, logger)
    }
    getOrderById = async (orderId, logger) => {
        return this.dao.getOrderById(orderId, logger)
    }

    updateOrderStatus = async (orderId, newStatus, logger) => {
        return this.dao.updateOrderStatus(orderId, newStatus, logger)
    }
}