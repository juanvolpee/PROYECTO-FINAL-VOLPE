import { Router } from "express";
import { AuthorizationError,AuthenticationError } from "../utils/errors.js";
export default class CustomRouter {
    constructor() {
        this.router = Router();
        this.init();
    }
    init() {
        this.router.use();
    }
    getRouter() {
        return this.router;
    }
    get(path, policies, ...callbacks) {
        this.router.get(path, this.handlePolicies(policies), this.applyCallbacks(callbacks));
    }

    post(path, policies, ...callbacks) {
        this.router.post(path, this.handlePolicies(policies), this.applyCallbacks(callbacks));
    }

    put(path, policies, ...callbacks) {
        this.router.put(path, this.handlePolicies(policies), this.applyCallbacks(callbacks));
    }

    delete(path, policies, ...callbacks) {
        this.router.delete(path, this.handlePolicies(policies), this.applyCallbacks(callbacks));
    }

    applyCallbacks(callbacks) {
        return callbacks.map((callback) => async (req, res, next) => {
            try {
                await callback(req, res, next);
            } catch (error) {
                console.error(error);
                next(error)
            }
        });
    }

    handlePolicies = (policies) => (req, res, next) => {
        if (policies[0] === "PUBLIC") return next();
        if (!req.user) {
            throw new AuthenticationError("Usuario no autenticado o falta token.")
        }

        if (!policies.includes(req.user.role.toUpperCase())) {
            throw new AuthorizationError("El usuario no tiene privilegios, revisa tus roles!")
        }
        next();
    };

}
