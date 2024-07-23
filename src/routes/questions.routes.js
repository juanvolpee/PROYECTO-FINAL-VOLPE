import CustomRouter from "./customs.routes.js";
import { saveQuestionProduct, getAllUserQuestion, getQuestionForProductId,getQuestionbyProductIdAndUserId } from '../controllers/questionsProducts.controllers.js'


export class QuestionsExtRouter extends CustomRouter {
    init() {

        this.post('/:productId', ['USER', 'ADMIN', 'PREMIUM'], saveQuestionProduct)

        this.get('/', ['USER', 'ADMIN', 'PREMIUM'], getAllUserQuestion)

        this.get('/:productId', ['USER', 'ADMIN', 'PREMIUM'], getQuestionForProductId)

        this.get('/user/:productId', ['USER', 'ADMIN', 'PREMIUM'], getQuestionbyProductIdAndUserId)


    }
}