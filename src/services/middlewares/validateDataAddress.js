import { ClientError} from "../../utils/errors.js";


export const validateEmptyAddress = (req, res, next) => {
    const { addressData } = req.body;
    const { country, state, city, zipcode, addressText, numext } = addressData;

    if (country && !/^[a-zA-Z\s]+$/.test(country)) {
        throw new ClientError('Nombre de país inválido.');
    }

    if (state && !/^[a-zA-Z\s]+$/.test(state)) {
        throw new ClientError('Nombre de estado inválido.');
    }

    if (city && !/^[a-zA-Z\s]+$/.test(city)) {
        throw new ClientError('Nombre de ciudad inválido.');
    }

    if (zipcode && !/^\d{5}$/.test(zipcode)) {
        throw new ClientError('Código postal inválido. Debe contener 5 dígitos.');
    }
    if (addressText && !/^[\w\s,.#-]+$/.test(addressText)) {
        throw new ClientError('Texto de dirección inválido.');
    }

    if (numext && !/^\d+$/.test(numext)) {
        throw new ClientError('Número exterior inválido. Debe ser numérico.');
    }

    next();
}


