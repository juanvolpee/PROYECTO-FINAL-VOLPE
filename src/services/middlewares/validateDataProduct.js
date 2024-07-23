import { ValidationError } from "../../utils/errors.js";

export const validateEmptyProductRegister = (req, res, next) => {
    const { title, description, stock, price, pcode, category } = req.body;
    if (!title || !description || !stock || !price || !pcode || !category) {
        throw new ValidationError("Faltan campos requeridos.");
    }
    next()
}

export const validateDataProduct = (req, res, next) => {

    const { title, description, stock, price, category } = req.body;
    if (title && !/^[a-zA-Z\s]+$/.test(title)) {
        req.logger.warning(`${req.method} en ${req.url} - Nombre invalido para producto. - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        throw new ValidationError('Nombre invalido para producto.');
    }

    if (description && !/^[a-zA-Z\s]+$/.test(description)) {
        req.logger.warning(`${req.method} en ${req.url} - Nombre invalido para description. - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        throw new ValidationError('Nombre invalido para description.');
    }

    if (category && !/^[a-zA-Z\s]+$/.test(category)) {
        req.logger.warning(`${req.method} en ${req.url} - Nombre invalido para category - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        throw new ValidationError('Nombre invalido para category.');
    }

    if (stock && !/^\d+$/.test(stock)) {
        req.logger.warning(`${req.method} en ${req.url} - Stock inválido. Debe ser numérico - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        throw new ValidationError('Stock inválido. Debe ser numérico.');
    }

    if (price && !/^\d+$/.test(price)) {
        req.logger.warning(`${req.method} en ${req.url} - Price inválido. Debe ser numérico. - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
        throw new ValidationError('Price inválido. Debe ser numérico.');
    }

    next();
}

