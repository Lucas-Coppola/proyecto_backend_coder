export class CustomError {
    static createError({name='error', cause, message, code=1}){
        const error = new Error(message);
        error.name = name
        error.cause = cause
        error.message = message
        error.code = code
        throw error
    }
}