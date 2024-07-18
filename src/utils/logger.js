import winston from 'winston'
import { envConfig } from '../config/config.js'
import { Router } from 'express';

const router = Router();

const { dbEnvironment } = envConfig

const customLevelOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        debug: 'white',
        http: 'white',
        info: 'blue',
        warning: 'yellow',
        error: 'red',
        fatal: 'red'
    }
}

export let logger

if (dbEnvironment === 'PRODUCTIVO') {
    logger = winston.createLogger({
        levels: customLevelOptions.levels,
        transports: [
            new winston.transports.Console({
                level: 'info',
                format: winston.format.combine(
                    winston.format.colorize({ colors: customLevelOptions.colors }),
                    winston.format.simple()
                )
            }),
            new winston.transports.File({
                filename: './errors.log',
                level: 'error',
                format: winston.format.simple()
            })
        ]
    });
} else if (dbEnvironment === 'DESARROLLO') {
    logger = winston.createLogger({
        levels: customLevelOptions.levels,
        transports: [
            new winston.transports.Console({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.colorize({ colors: customLevelOptions.colors }),
                    winston.format.simple()
                )
            })
        ]
    });
}

// middleware 
export const addLogger = (req, res, next) => {
    req.logger = logger
    req.logger.info(`${req.method} en ${req.url} - ${new Date().toLocaleString()}`);
    next();
}

router.get('/', (req, res) => {

    if (dbEnvironment === 'DESARROLLO') {

        req.logger.debug('Esto es un mensaje de debug');
        req.logger.http('Esto es un mensaje de http');
        req.logger.info('Esto es un mensaje de info');
        req.logger.warning('Esto es un mensaje de warning');
        req.logger.error('Esto es un mensaje de error');
        req.logger.fatal('Esto es un mensaje de fatal');

        return res.send('Se han enviado los mensajes de prueba, para un entorno de desarrollo, en consola');

    } else if (dbEnvironment === 'PRODUCTIVO') {

        req.logger.info('Esto es un mensaje de info');
        req.logger.warning('Esto es un mensaje de warning');
        req.logger.error('Esto es un mensaje de error');
        req.logger.fatal('Esto es un mensaje de fatal');

        return res.send('Se han enviado los mensajes de prueba, para un entorno productivo, en consola');

    } else {
        return res.send('No hay ningun entorno seleccionado para app');
    }

});

export default router


// const numeroDeProcesadores = cpus().length
// console.log('número de hilos: ', numeroDeProcesadores)