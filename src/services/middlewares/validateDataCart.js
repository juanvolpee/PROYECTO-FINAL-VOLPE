import { ClientError, ValidationError } from "../../utils/errors.js";
import { productService } from '../services.js'
export const validateQuantity = (req, res, next) => {
    let getQuantity = 0
    if (!req.body.quantity) {
        getQuantity = req.params
    } else {
        getQuantity = req.body
    }
    if (!getQuantity) throw new ClientError('Cantidad Invalida, ingrese una cantidad.')
    if (getQuantity && getQuantity <= 0) throw new ClientError('Cantidad Invalida, ingrese una cantidad mayor a cero')
    next()
}
