import { Error } from "../../service/errors/enums.js";

export const handleErrors = () => (error, req, res, next) => {
    console.log(error.name);
    console.log(error.message);
    console.log(error.cause);
    console.log(error.code);

    const errorr = {
        name: error.name,
        message: error.message,
        cause: error.cause,
        code: error.code
    }
    
    switch (error.code) {
        case Error.INVALID_TYPES_ERROR:
            return res.send({ status: 'error', error: errorr});
            break;
        case Error.ROUTING_ERROR:
            return res.send({ status: 'error', error: errorr});
            break;
        case Error.DATABASE_ERROR:
            return res.send({ status: 'error', error: errorr});
            break;
        default:
            return res.send({ status: 'error', error: 'error no encontrado' });
            break;
    }
}