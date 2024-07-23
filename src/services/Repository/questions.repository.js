export default class QuestionRepository {
    constructor(dao) {
        this.dao = dao
    }

    saveQuestion = async (productId, question, userId, logger) => {
        return this.dao.saveQuestion(productId, question, userId, logger)
    }

    getAll = async (logger, next) => {
        return this.dao.getAll(logger, next)
    }

    getByProductId = async (productId) => {
        return this.dao.getByProductId(productId)
    }
    getByProductIdAndUserId = async (productId, userId) => {
        return this.dao.getByProductIdAndUserId(productId, userId)
    }


}