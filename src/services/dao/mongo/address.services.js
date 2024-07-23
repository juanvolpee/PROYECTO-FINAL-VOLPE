import { DatabaseError } from '../../../utils/errors.js'
import addressModel from './models/address.models.js'


export default class AddressServicesDao {
    constructor() {
    }
    getFullAddress = async (userId, logger) => {
        const result = await addressModel.find({ userId: userId })
        if (!result) {
            logger.error(`Error al intentar obtener todas las direcciones.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new DatabaseError('Error al intentar obtener todas las direcciones.')
        }
        return result
    }

    saveAddress = async (addressData, logger) => {
        const result = await addressModel.create(addressData)
        if (!result) {
            logger.error(`Error al guardar la direccion.' - ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new DatabaseError('Error al guardar la direccion.')
        }
        return result
    }

    updateAdress = async (addresId, addressUpdate, logger) => {
        const options = { new: true };
        const result = await addressModel.findByIdAndUpdate(addresId, addressUpdate, options)
        if (!result) {
            logger.error(`Ocurrio un error al intentar actualizar la direccion.'- ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new DatabaseError('Ocurrio un error al intentar actualizar la direccion.')
        }
    }
}