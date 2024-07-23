import CustomRouter from "./customs.routes.js";
import { saveAddressController, getAddressById } from '../controllers/address.controllers.js'

export class AddressRoutes extends CustomRouter {
    init() {
        this.post('/save', ['USER','ADMIN'], saveAddressController)

        this.get('/', ['USER','ADMIN'], getAddressById)
    }

} 