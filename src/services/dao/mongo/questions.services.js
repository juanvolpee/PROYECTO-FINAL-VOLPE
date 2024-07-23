import { DatabaseError, NotFoundError } from "../../../utils/errors.js";
import { productModel } from "./models/products.model.js";
import questionModel from "./models/questionProduct.models.js";
import userModel from "./models/users.model.js";
import mongoose from "mongoose";

export default class QuestionProductDao {
    constructor() { }

   
    saveQuestion = async (productId, question, _id, logger) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new NotFoundError('ID de producto no válido');
            }
            if (!mongoose.Types.ObjectId.isValid(_id)) {
                throw new NotFoundError('ID de usuario no válido');
            }

            const newQuestion = new questionModel({
                content: question,
                user: _id,
                product: productId
            });
            const result = await questionModel.create(newQuestion);
            if (!result) {
                logger.warning(`Ocurrió un error al intentar guardar la pregunta - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
                throw new DatabaseError('Ocurrió un error al intentar guardar la pregunta');
            }

            const product = await productModel.findById(productId);
            if (!product) {
                logger.warning(`No se encontró un producto con ese ID - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
                throw new NotFoundError('No se encontró un producto con ese ID');
            }

            product.questions = newQuestion;
            const productSave = await product.save();
            if (!productSave) {
                logger.error(`Ocurrió un error al intentar guardar la pregunta en el producto - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
                throw new DatabaseError('Ocurrió un error al intentar guardar la pregunta en el producto');
            }

            const user = await userModel.findById(_id);
            if (!user) {
                logger.warning(`No se encontró un usuario con ese ID - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
                throw new NotFoundError('No se encontró un usuario con ese ID');
            }

            user.questions = newQuestion;
            const saveUser = await user.save();
            if (!saveUser) {
                logger.error(`Ocurrió un error al intentar actualizar el usuario con los datos - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
                throw new DatabaseError('Ocurrió un error al intentar actualizar el usuario con los datos');
            }

            return newQuestion;
        } catch (error) {            
            logger.error("Error en saveQuestion", error);
            throw error; 
        }
    }

  
    getAll = async (logger) => {
        try {
            const result = await questionModel.find().populate('user').populate('product');
            return result;
        } catch (error) {
            logger.error("Error en getAll", error);
            throw new DatabaseError('Ocurrió un error al intentar obtener todas las preguntas');
        }
    }

    getByProductId = async (productId) => {
        const result = await questionModel.find({ product: productId })
        if (!result) {
            throw new NotFoundError('No se encontraron preguntas para ese producto.')
        }
        return result

    }
    getByProductIdAndUserId = async (productId, userId) => {
        const result = await questionModel.find({ product: productId, user: userId })
        if (!result) {
            throw new NotFoundError('No se encontraron preguntas para ese producto.')
        }
        return result

    }
}
