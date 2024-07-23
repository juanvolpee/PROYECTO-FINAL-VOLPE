import { userService, cartService } from '../services/services.js'
import { generateJWToken, isValidPassword } from "../utils.js";
import { UsersClass } from '../services/dto/usersClass.js'
import { response } from '../utils/response.js';
import { AuthenticationError, ConflictError, NotFoundError, ServerError, ValidationError } from '../utils/errors.js';
import { catchedAsync } from '../utils/catchedAsync.js';
import config from '../config/config.js'
import nodemailer from 'nodemailer';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserResponseDto from '../services/dto/output/userResponseDto.js';
import UserResponseLoginDto from '../services/dto/output/userResponseLoginDto.js';
import UserCreateDto from '../services/dto/input/userCreateDto.js';


const logOut = (req, res) => {
    res.clearCookie('jwtCookieToken');
    response(res, 200, 'Logout confirmado.')
}
const verifyAuth = (req, res) => {
    req.user
        ? response(res, 200, { isAuthenticated: true, user: req.user })
        : response(res, 200, { isAuthenticated: false })
}

const userListController = async (req, res, next) => {
    try {
        const result = await userService.userList(req.logger);
        if (!result) {
            throw new NotFoundError('No se encontraron usuarios para listar');
        }
        response(res, 200, result);
    } catch (error) {
        next(error);
    }
};

const profileById = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const userProfile = await userService.userById(_id, req.logger);
        const userDto = new UserResponseDto(userProfile)
        response(res, 200, userDto);
    } catch (error) {
        next(error);
    }
};

const CuserById = async (req, res, next) => {
    try {
        const { _id } = req.user;
        console.log(_id);
        const result = await userService.userById(_id);
        console.log('pre dto', result);
        const userDto = new UserResponseDto(result)
        console.log('dto', userDto);
        response(res, 200, userDto);
    } catch (error) {
        next(error);
    }
};
const userDocumentUpload = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { document_names } = req.body;

        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        console.log('document_names:', document_names);

        if (!Array.isArray(document_names) || document_names.length === 0) {
            throw new Error('Document names are missing or not in correct format.');
        }

        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = req.files.map((file, index) => ({
                document_name: document_names[index] || 'Unknown',
                path: file.path
            }));
        }

        const updateInfo = { documents };
        console.log(updateInfo, 'updateInfo');

        const user = await userService.updateInfo(_id, updateInfo, req.logger);
        const userDto = new UserResponseDto(user);
        response(res, 201, userDto, 'Usuario actualizado con nuevos documentos.');
    } catch (error) {
        console.error(error);
        next(error);
    }
}


const userLoginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            throw new ValidationError('Debe ingresar un email correcto.');
        }
        const user = await userService.userByEmail(email, req.logger);
        if (!isValidPassword(user, password)) {
            throw new AuthenticationError('El usuario o la contraseña no coinciden.');
        }
        const cart = await cartService.getCartByUserId(user._id, req.logger);
        const tokenUser = {
            usercartId: cart.user,
            _id: user._id,
            name: user.first_name + " " + user.last_name,
            email: user.email,
            role: user.role
        };
        const access_token = generateJWToken(tokenUser);
        res.cookie('jwtCookieToken', access_token, {
            maxAge: 12000000,
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });
        const userDto = new UserResponseLoginDto(user)
        response(res, 200, userDto, 'Login Success');
    } catch (error) {
        next(error)
    }
};

const registerUserController = async (req, res, next) => {
    try {
        const { first_name, last_name, age, email, password, role } = req.body;
        const exists = await userService.userByEmail(email, req.logger);
        if (exists) {
            throw new ConflictError('El usuario ya existe.');
        }
        let userRole = role;
        if (!role || (role !== 'admin' && role !== 'premium')) {
            userRole = 'user';
        }
        const newUser = new UserCreateDto(first_name, last_name, age, email, password, userRole);
        const user = await userService.userSave(newUser, req.logger);
        const newCart = await cartService.createEmptyCart(user._id, req.logger);
        await userService.updateInfo(user._id, { cart: newCart._id });
        const userDto = new UserResponseDto(user)
        response(res, 201, userDto, 'Usuario registrado correctamente.');
    } catch (error) {
        next(error);
    }
};

const profileEdit = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const { userUpdate } = req.body;
        const user = await userService.updateInfo(_id, userUpdate, req.logger);
        const userDto = new UserResponseDto(user)
        response(res, 201, userDto, 'Perfil editado correctamente.');
    } catch (error) {
        next(error);
    }
};

const reqPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = jwt.sign({ email }, 'resetpassword123456', { expiresIn: '1h' });
        const resetLink = `http://localhost:8080/api/users/reset-password/${token}`;
        const mailOptions = {
            from: 'bernardodieta@gmail.com',
            to: email,
            subject: 'Reinicio de contraseña',
            html: `<a href="${resetLink}">Nueva Contraseña</a>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new ServerError('Error enviando el mail.');
            }
            res.send(resetLink);
        });

    } catch (error) {
        next(error);
    }
};

const resetPasswordToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const decoded = jwt.verify(token, 'resetpassword123456');
        const user = await userService.userByEmail(decoded.email, req.logger);

        if (bcrypt.compareSync(newPassword, user.password)) {
            throw new ConflictError('La nueva password no puede ser igual a la anterior.');
        }
        user.password = bcrypt.hashSync(newPassword, 10);
        await userService.updateInfo(user._id, user, req.logger);
        response(res, 201, 'Constraseña actualizada');
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new NotFoundError('El link ya expiro, vuelva a solicitar otro link.');
        }
        next(error);
    }
};

const updatePremiumUser = async (req, res, next) => {
    try {
        const { _id } = req.user;
        const user = await userService.userById(_id, req.logger);
        if (user.documents && user.documents.length >= 4) {
            user.role = 'PREMIUM';
        } else {
            return res.status(400).json({
                error: true,
                message: 'El usuario debe tener al menos 4 documentos cargados para ser promovido a PREMIUM.'
            });
        }
        const userUpda = {
            role: 'PREMIUM'
        }
        const updatedUser = await userService.updateInfo(_id, userUpda, req.logger);
        const userDto = new UserResponseDto(updatedUser);
        response(res, 201, userDto, 'Usuario cambiado a Premium.');
    } catch (error) {
        next(error);
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: config.gmailAccount,
        pass: config.gmailAppPassword
    }
});

const TuninguserListController = catchedAsync(userListController)
const TuningprofileById = catchedAsync(profileById)
const TuningCuserById = catchedAsync(CuserById)
const TuninguserLoginController = catchedAsync(userLoginController)
const TuningregisterUserController = catchedAsync(registerUserController)
const TuningprofileEdit = catchedAsync(profileEdit)
const TuningreqPasswordReset = catchedAsync(reqPasswordReset)
const TuningresetPasswordToken = catchedAsync(resetPasswordToken)
const TuninguserDocumentUpload = catchedAsync(userDocumentUpload)
const TuningupdatePremiumUser = catchedAsync(updatePremiumUser)
export {
    TuninguserListController as userListController,
    TuningprofileById as profileById,
    TuningCuserById as CuserById,
    TuninguserLoginController as userLoginController,
    TuningregisterUserController as registerUserController,
    TuningprofileEdit as profileEdit,
    TuningreqPasswordReset as reqPasswordReset,
    TuningresetPasswordToken as resetPasswordToken,
    TuninguserDocumentUpload as userDocumentUpload,
    TuningupdatePremiumUser as updatePremiumUser,
    verifyAuth,
    logOut
}