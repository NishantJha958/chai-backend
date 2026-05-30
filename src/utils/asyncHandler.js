/*
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)//execute the function
    }
    catch (error) {
        res.status(error.code || 500).json({
            success: false,//flag for checking that user request is successfull or not
            message: error.message//
        })
    }
}
    */
//now using promises
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}
//we should standardize the response and the error format


export { asyncHandler }