import CustomRouter from './customs.routes.js';
import { userLoginController, registerUserController, CuserById, profileById,updatePremiumUser, profileEdit, reqPasswordReset, resetPasswordToken, verifyAuth, logOut, userDocumentUpload } from '../controllers/users.controllers.js'

import { upload } from '../utils.js';
import { validateUserRegisterData } from '../services/middlewares/validateDataUsers.js';

export class UsersExtRouter extends CustomRouter {

    init() {
        this.get('/auth/verify', ['PUBLIC'], verifyAuth);

        this.post('/logout', ['PUBLIC'], logOut);    

        this.post('/login', ['PUBLIC'], userLoginController);

        this.put('/premium', ['USER', 'ADMIN'], updatePremiumUser)

        this.post('/documents', ['USER', 'ADMIN'], upload.array('files', 4), userDocumentUpload);

        this.post('/register', ['PUBLIC'], validateUserRegisterData, registerUserController)

        this.get('/profile', ["USER", "PREMIUM", 'ADMIN'], profileById)

        this.put('/profile/edit', ["USER", "PREMIUM", 'ADMIN'], profileEdit)

        this.get('/:id?', ["USER", "PREMIUM", 'ADMIN'], CuserById)

        this.post('/request-password-reset', ['PUBLIC'], reqPasswordReset)

        this.post('/reset-password/:token', ['PUBLIC'], resetPasswordToken)

    }
}