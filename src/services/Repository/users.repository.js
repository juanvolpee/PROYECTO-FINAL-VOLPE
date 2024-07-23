export default class UsersRepository {
    constructor(dao) {
        this.dao = dao;
    }

    userList = async (logger) => {
        return this.dao.userList(logger)
    }

    userSave = async (user, logger) => {
        return this.dao.userSave(user, logger)
    }

    userById = async (_id, logger) => {
        return this.dao.userById(_id, logger)
    }

    userByEmail = async (email, logger, next) => {
        return this.dao.userByEmail(email, logger, next)
    }

    updateInfo = async (userId, userUpdate, logger) => {
        return this.dao.updateInfo(userId, userUpdate, logger)
    }

    updateInfoDocuments = async (userId, userUpdate, logger) => {
        return this.dao.updateInfo(userId, userUpdate, logger)
    }
}