import { ordersService } from "../services/services.js"
import { NotFoundError } from "../utils/errors.js"
import { response } from "../utils/response.js"
import { catchedAsync } from "../utils/catchedAsync.js";


const getOrderById = async (req, res, next) => {
    try {
        const { _id } = req.user
        const orders = await ordersService.getAllOrderByuserId(_id, req.logger)
        if (!orders) {
            req.logger.warning(`${req.method} en ${req.url} - Error: 'No se encontro una orden con ese ID.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError('No se encontro una orden con ese ID.')
        }
        response(res, 200, orders)
    } catch (error) {
        next(error)
    }

}

const confirmOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params
        let newStatus = 'Entregada'
        const result = await ordersService.updateOrderStatus(orderId, newStatus, req.logger)
        if (!result) {
            req.logger.warning(`${req.method} en ${req.url} - Error: 'No existe una orden a confirmar' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError('No existe una orden a confirmar')
        }
        response(res, 200, { message: 'Orden confirmada.', order: result })
    } catch (error) {
        next(error)
    }

}

const cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params
        let newStatus = 'Cancelada'
        const result = await ordersService.updateOrderStatus(orderId, newStatus, req.logger)
        if (!result) {
            req.logger.warning(`${req.method} en ${req.url} - Error: 'No existe una orden para cancelar' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)

            throw new NotFoundError('No existe una orden para cancelar')
        }
        response(res, 200, { message: 'Orden Cancelada.', order: result })
    } catch (error) {
        next(error)
    }

}

const TuninggetOrderById = catchedAsync(getOrderById)
const TuningconfirmOrder = catchedAsync(confirmOrder)
const TuningcancelOrder = catchedAsync(cancelOrder)
export {
    TuninggetOrderById as getOrderById,
    TuningconfirmOrder as confirmOrder,
    TuningcancelOrder as cancelOrder,
}