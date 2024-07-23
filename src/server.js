import express from 'express'
import config from './config/config.js';
import cookieParser from "cookie-parser";
import passport from "passport";
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUIExpress from 'swagger-ui-express'
import cors from 'cors'
import { __dirname } from "../utilsdir.js";
import { passportCall } from "./utils.js";
import initializePassport from "./config/passport.config.js";
import { UsersExtRouter } from './routes/usersExt.routes.js'
import { ProductsExtRouter } from './routes/productsExt.routes.js'
import { CartRouter } from './routes/cartsExt.routes.js';
import { OrdersRoutes } from './routes/ordersExt.routes.js';
import { AddressRoutes } from './routes/addressExt.routes.js';
import MongoSingleton from './config/mongodb-singleton.js';
import { resError } from './utils/resError.js';
import { addLogger } from './config/CustomLogger.js'
import { DatabaseError } from './utils/errors.js';
import cluster from 'cluster';
import { cpus } from 'os';
import { QuestionsExtRouter } from './routes/questions.routes.js';

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:3000', "http://localhost:3001"],
    credentials: true,
    optionsSuccessStatus: 200
}))

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion de API Ecommerce",
            description: "Documentacion para uso de aplicacion de ecommerce."
        }
    },
    apis: [
        "./src/docs/Products/products.yaml",
        "./src/docs/Users/users.yaml",
        "./src/docs/cart/cart.yaml",        
    ]
    //apis: [`./src/docs/**/*.yaml`]
}

server.use(cookieParser("CoderS3cr3tC0d3"));

initializePassport();
server.use(passport.initialize());
server.use(passportCall("jwt"));
server.use(express.static(__dirname + "/"));


const cartRouter = new CartRouter()
const userExtRouter = new UsersExtRouter()
const productsExtRouter = new ProductsExtRouter()
const orderRoutes = new OrdersRoutes()
const addressRoutes = new AddressRoutes()
const questionRouter = new QuestionsExtRouter()
if (cluster.isPrimary) {
    const numeroProcesadores = cpus().length
    for (let i = 0; i < numeroProcesadores; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork()
    })
} else {
    server.use(addLogger)
    server.use("/api/users", userExtRouter.getRouter())
    server.use('/api/products', productsExtRouter.getRouter())
    server.use('/api/cart', cartRouter.getRouter())
    server.use('/api/orders', orderRoutes.getRouter())
    server.use('/api/address', addressRoutes.getRouter())
    server.use('/api/questions', questionRouter.getRouter())

    const specs = swaggerJSDoc(swaggerOptions);
    server.use('/apidocs', swaggerUIExpress.serve, swaggerUIExpress.setup(specs))

    
    server.use((err, req, res, next) => {
        const { statusCode = 500, message, type } = err;
        resError(res, statusCode, message, type || 'Error Interno del Servidor');
    });

    const SERVER_PORT = config.port;
    server.listen(SERVER_PORT, () => {
        console.log('Server en puerto:', SERVER_PORT);
    })

    const mongoInstance = async () => {
        try {
            await MongoSingleton.getInstance()
        } catch (error) {
            req.logger.error(`${req.method} en ${req.url} - Error:'Error al Conectar con la base de datos.' ${error} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new DatabaseError('Error al Conectar con la base de datos.')
        }
    };
    mongoInstance();

}
