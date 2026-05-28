class ApiError extends Error {
    constructor(
        statusCode,
        message = "SOmething went wrong",
        error = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.error = error
        this.success = false
        this.data = null;
        this.errors = errors

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }