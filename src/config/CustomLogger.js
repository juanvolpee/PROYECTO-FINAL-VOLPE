import winston, { transports } from "winston";
import config from './config.js'


const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        http: 3,
        info: 4,
        debug: 5
    },
    colors:
    {
        fatal: 'red',
        error: 'yellow',
        warning: 'magenta',
        info: 'blue',
        debug: 'white'
    }

}

winston.addColors(customLevels.colors)

const developmentLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({
            level: 'http',
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevels.colors }),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: './errors.log',
            level: 'warning',
            format: winston.format.simple()
        })
    ]
})

const productionLogger = winston.createLogger({
    levels: customLevels.levels,
    transports: [
        new winston.transports.Console({ level: 'http' }),
        new winston.transports.File({ filename: './errors.log', level: 'warning' })
    ]
})

export const addLogger = (req, res, next) => {
    if (config.enviroment === 'production') {
        req.logger = productionLogger;
        req.logger.warning(`${req.method} en ${req.url} ${JSON.stringify(req.body)}- at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
        req.logger.error(`${req.method} en ${req.url} ${JSON.stringify(req.body)}- at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
    } else {
        req.logger = developmentLogger;
        req.logger.http(`${req.method} en ${req.url} ${JSON.stringify(req.body)}- at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
        req.logger.warning(`${req.method} en ${req.url} ${JSON.stringify(req.body)}- at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
        req.logger.error(`${req.method} en ${req.url} ${JSON.stringify(req.body)}- at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
    }

    next()
}