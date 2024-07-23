import CustomRouter from "./customs.routes.js";
import { getOrderById, confirmOrder, cancelOrder } from "../controllers/orders.controllers.js";
export class OrdersRoutes extends CustomRouter {
    init() {
        this.get('/', ['USER', 'PREIMUM','ADMIN'], getOrderById)

        this.post('/confirm/:orderId', ['USER', 'PREIMUM','ADMIN'], confirmOrder)

        this.post('/cancel/:orderId', ['USER', 'PREIMUM','ADMIN'], cancelOrder)

    }
}

