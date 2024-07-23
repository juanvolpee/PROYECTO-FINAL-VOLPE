import { questionService } from "../services/services.js";
import { catchedAsync } from "../utils/catchedAsync.js";
import { response } from '../utils/response.js';

const saveQuestionProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { question } = req.body;
        const { _id } = req.user;

        if (!productId || !question || !_id) {
            req.logger.warning("Datos faltantes en la solicitud");
            return res.status(400).json({ error: true, message: "Datos faltantes" });
        }

        const result = await questionService.saveQuestion(productId, question, _id, req.logger);
        response(res, 200, result);
    } catch (error) {
        req.logger.error("Error al guardar la pregunta del producto", error);
        next(error);
    }
};

const getAllUserQuestion = async (req, res, next) => {
    try {
        req.logger.info("Iniciando proceso para obtener todas las preguntas de usuario");
        const result = await questionService.getAll(req.logger);
        req.logger.info("Proceso completado con éxito para obtener todas las preguntas de usuario");
        response(res, 200, result);
    } catch (error) {
        req.logger.error("Error al obtener todas las preguntas de usuario", error);
        next(error);
    }
};

const getQuestionForProductId = async (req, res, next) => {
    try {
        const { productId } = req.params
        const result = await questionService.getByProductId(productId)
        response(res, 200, result)
    } catch (error) {
        req.logger.error("Error al obtener las preguntas para ese Producto", error);
        next(error)
    }

}
const getQuestionbyProductIdAndUserId = async (req, res, next) => {
    try {
        const { _id } = req.user
        const { productId } = req.params
        const result = await questionService.getByProductIdAndUserId(productId, _id)
        response(res, 200, result)
    } catch (error) {
        req.logger.error("Error al obtener las preguntas para ese Producto", error);
        next(error)
    }

}
const TuninggetQuestionbyProductIdAndUserId = catchedAsync(getQuestionbyProductIdAndUserId)
const TuningSaveQuestionProduct = catchedAsync(saveQuestionProduct);
const TuninggetAllUserQuestion = catchedAsync(getAllUserQuestion);
const TuninggetQuestionForProductId = catchedAsync(getQuestionForProductId)
export {
    TuninggetQuestionbyProductIdAndUserId as getQuestionbyProductIdAndUserId,
    TuninggetQuestionForProductId as getQuestionForProductId,
    TuninggetAllUserQuestion as getAllUserQuestion,
    TuningSaveQuestionProduct as saveQuestionProduct
};
