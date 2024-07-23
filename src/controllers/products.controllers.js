import { userService, productService } from '../services/services.js'
import Product from '../services/dto/productsClass.js'
import moment from 'moment'
import { catchedAsync } from "../utils/catchedAsync.js";
import { ConflictError, FavoriteError, NotFoundError, ServerError } from '../utils/errors.js';
import { response } from "../utils/response.js";


const getListProducts = async (req, res, next) => {
    try {
        const { limit = 60, page = 1, sort, category, stock, startDate, endDate } = req.query;
        let filter = {};
        let sortOption = {};
        if (category) {
            filter.category = category;
        }
        if (stock) {
            filter.stock = parseInt(stock);
        }
        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            filter.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            filter.createdAt = { $lte: new Date(endDate) };
        }

        if (sort === 'asc' || sort === 'desc') {
            sortOption.price = sort === 'asc' ? 1 : -1;
        }
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sortOption,
            lean: true
        };
        const products = await productService.getAllProducts(filter, options, req.logger);
        const totalPages = products.totalPages;
        const hasNextPage = products.hasNextPage;
        const hasPrevPage = products.hasPrevPage;
        const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
        const nextPage = hasNextPage ? parseInt(page) + 1 : null;
        const prevLink = hasPrevPage ? `/?page=${prevPage}&limit=${limit}&sort=${sort}&category=${category}&stock=${stock}` : null;
        const nextLink = hasNextPage ? `/?page=${nextPage}&limit=${limit}&sort=${sort}&category=${category}&stock=${stock}` : null;

        const result = {
            data: products.docs,
            totalPages,
            prevPage,
            nextPage,
            page: parseInt(page),
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        };
        if (products.docs.length > 0) {
            return response(res, 200, result);
        } else {
            throw new NotFoundError('No se encontraron productos para mostrar.');
        }
    } catch (error) {
        next(error);
    }
};

const toggleFavorite = async (req, res, next) => {
    try {
        const { _id } = req.user
        const { productId } = req.params;
        const user = await userService.userById(_id, req.logger);
        const isFavorite = user.favProducts.some(product => product.productId.toString() === productId);
        const filter = { _id: _id };
        let update;

        if (isFavorite) {
            update = {
                $pull: {
                    "favProducts": { productId: productId }
                }
            };
        } else {
            update = {
                $addToSet: {
                    "favProducts": { productId: productId }
                }
            };
        }
        const result = await userService.updateInfo(filter, update, req.logger);
        result.password = ''
        if (result) {
            return response(res, 200, result)
        } else {
            req.logger.error(`${req.method} en ${req.url} - Error:'No se pudo agregar el producto a favoritos' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new FavoriteError('No se pudo agregar el producto a favoritos')
        }
    } catch (error) {
        next(error)
    }
};

const saveProductController = async (req, res, next) => {
    try {
        let img = [];
        const { title, description, stock, price, pcode, category } = req.body;
        const exists = await productService.getProductByPcode(pcode, req.logger);
        if (exists) {
            req.logger.warning(`${req.method} en ${req.url} - Error: Ya existe un producto con ese Product code - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new ConflictError('Ya existe un producto con ese Product code');
        }

        if (req.files && req.files.length > 0) {
            img = req.files.map(file => ({ path: file.path }));
            console.log('img:', img);
        }

        let owner = req.user.role === 'premium' ? req.user.email : 'admin';
        
        const product = new Product(title, description, stock, price, pcode, category, moment().format(), img, owner);

        const newProduct = await productService.saveProduct(product, req.logger);
        return response(res, 201, newProduct);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params
        console.log(id)
        const product = await productService.getProductById(id, req.logger)
        if (!product) {
            req.logger.warning(`${req.method} en ${req.url} - Error: No existe un producto con ese id - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new NotFoundError('No existe un producto con ese id')
        }
        return response(res, 201, product)
    } catch (error) {
        next(error)
    }
}

const updateProductById = async (req, res, next) => {
    try {
        const { productId } = req.params
        const { product } = req.body
        const prod = await productService.updateProduct(productId, product, req.logger)
        if (prod) {
            return response(res, 201, prod)
        } else {
            req.logger.error(`${req.method} en ${req.url} - Error: 'No se pudo actualizar el producto.' - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`)
            throw new ServerError('No se pudo actualizar el producto.')
        }
    } catch (error) {
        next(error)
    }
}

const deletProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id, req.logger);
        if (!product) {
            req.logger.warning(`${req.method} en ${req.url} - Error: No existe un producto con ese id - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`);
            throw new NotFoundError('No existe un producto con ese id');
        }
        if (req.user.role === 'admin' || (req.user.role === 'premium' && product.owner === req.user.email)) {
            const deletProduct = await productService.delProduct(id, req.logger);
            return response(res, 201, deletProduct);
        } else {
            return response(res, 403, { error: 'El producto no te pertenece o no tienes privilegios para poder borrarlo.' }, false);
        }
    } catch (error) {
        next(error);
    }
};

const valorationAdd = async (req, res, next) => {
    const { _id } = req.user
    const { productId } = req.params;
    const { message, star } = req.body;
    const result = await productService.valAdd(productId, _id, message, star, req.logger)
    response(res, 201, result)

}

const TuningvalorationAdd = catchedAsync(valorationAdd)
const TuninggetListProducts = catchedAsync(getListProducts);
const TuningrtoggleFavorite = catchedAsync(toggleFavorite);
const TuningsaveProductController = catchedAsync(saveProductController);
const TuninggetProductById = catchedAsync(getProductById);
const TuningupdateProductById = catchedAsync(updateProductById);
const TuningdeletProductById = catchedAsync(deletProductById)

export {
    TuningvalorationAdd as valorationAdd,
    TuninggetListProducts as getListProducts,
    TuningrtoggleFavorite as toggleFavorite,
    TuningsaveProductController as saveProductController,
    TuninggetProductById as getProductById,
    TuningupdateProductById as updateProductById,
    TuningdeletProductById as deletProductById
};

