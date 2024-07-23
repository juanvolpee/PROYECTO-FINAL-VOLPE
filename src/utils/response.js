export const response = (res, statusCode, payload, msg, success = true) => {
    res.status(statusCode).json({
        msg,
        success,
        error: !success,
        payload
      
    });
};