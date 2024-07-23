
export const resError = (res, status, message,type) => {
    res.status(status).json({
        error: true,
        type,        
        message,
        

    })
}