export class ClientError extends Error {
    constructor(message, status = 400, type) {
        super(message);
        this.statusCode = status;
        this.type = type;
    }
}
export class SendMailError extends Error {
    constructor(message) {
        super(message, 400, 'Error de servicios de Email.')
    }
}

export class ValidationError extends ClientError {
    constructor(message) {
        super(message, 400, 'Error de validación');
    }
}

export class NotFoundError extends ClientError {
    constructor(message) {
        super(message, 404, 'Recurso no encontrado');
    }
}

export class AuthenticationError extends ClientError {
    constructor(message) {
        super(message, 401, 'Error de autenticación');
    }
}

export class AuthorizationError extends ClientError {
    constructor(message) {
        super(message, 403, 'Error de autorización');
    }
}
export class FavoriteError extends ClientError {
    constructor(message) {
        super(message, 400, 'Error al agregar a favoritos');
    }
}
export class DatabaseError extends Error {
    constructor(message, status = 503) {
        super(message);
        this.statusCode = status;
        this.type = 'Error de base de datos';
    }
}

export class ServerError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.statusCode = status;
        this.type = 'Error interno del servidor';
    }
}

export class ConflictError extends ClientError {
    constructor(message) {
        super(message, 409, 'Conflicto de recursos');
    }
}