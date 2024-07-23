import mongoose from "mongoose";
import ProductServicesDao from "../../src/services/dao/mongo/products.services.js";
import chai from "chai";

mongoose.connect("mongodb://localhost:27017/tests?retryWrites=true&w=majority");
const expect = chai.expect;

describe('Product Services', () => {
    before(function () {
        this.productDao = new ProductServicesDao();
    });

    beforeEach(async function () {
        this.timeout(5000);
        await mongoose.connection.collection('products').drop().catch(err => {
            if (err.code === 26) {
                console.log('Colección no encontrada, saltando el drop.');
            } else {
                throw err;
            }
        });
    });

    it('Debe devolver todos los productos en formato Array', async function () {
        const filter = {};
        const options = {};
        const logger = console;

        const result = await this.productDao.getAllProducts(filter, options, logger);
        expect(result).to.be.an('object');
        expect(result.docs).to.be.an('array');
    });

    it('Debe guardar un producto correctamente en la base de datos', async function () {
        const testProduct = {            
            title: "Título del producto de prueba",
            description: "Descripción del producto de prueba",
            price: 100,
            stock: 50,
            pcode: "TEST123",
            category: "Categoría de prueba"
        };

        const logger = console;
        const result = await this.productDao.saveProduct(testProduct, logger);
        expect(result._id).to.be.ok;
    });

    it('Debe devolver un producto por su pcode', async function () {
        const testProduct = {            
            title: "Título del producto de prueba",
            description: "Descripción del producto de prueba",
            price: 100,
            stock: 50,
            pcode: "TEST123",
            category: "Categoría de prueba"
        };

        const logger = console;
        await this.productDao.saveProduct(testProduct, logger);
        const result = await this.productDao.getProductByPcode("TEST123", logger);
        expect(result).to.be.an('object');
        expect(result.pcode).to.equal("TEST123");
    });

    it('Debe devolver un producto por su ID', async function () {
        const testProduct = {            
            title: "Título del producto de prueba",
            description: "Descripción del producto de prueba",
            price: 100,
            stock: 50,
            pcode: "TEST123",
            category: "Categoría de prueba"
        };

        const logger = console;
        const savedProduct = await this.productDao.saveProduct(testProduct, logger);
        const result = await this.productDao.getProductById(savedProduct._id, logger);
        expect(result).to.be.an('object');
        expect(result._id.toString()).to.equal(savedProduct._id.toString());
    });

    it('Debe actualizar el stock de un producto', async function () {
        const testProduct = {            
            title: "Título del producto de prueba",
            description: "Descripción del producto de prueba",
            price: 100,
            stock: 50,
            pcode: "TEST123",
            category: "Categoría de prueba"
        };

        const logger = console;
        const savedProduct = await this.productDao.saveProduct(testProduct, logger);
        const newStock = 30;
        const updatedProduct = await this.productDao.updateProductStock(savedProduct._id, newStock, logger);
        expect(updatedProduct).to.be.an('object');
        expect(updatedProduct.stock).to.equal(newStock);
    });

    it('Debe borrar un producto correctamente', async function () {
        const testProduct = {            
            title: "Título del producto de prueba",
            description: "Descripción del producto de prueba",
            price: 100,
            stock: 50,
            pcode: "TEST123",
            category: "Categoría de prueba"
        };

        const logger = console;
        const savedProduct = await this.productDao.saveProduct(testProduct, logger);
        const result = await this.productDao.delProduct(savedProduct._id, logger);
        expect(result.deletedCount).to.equal(1);
    });

    it('Debe actualizar un producto correctamente', async function () {
        const testProduct = {           
            title: "Título del producto de prueba",
            description: "Descripción del producto de prueba",
            price: 100,
            stock: 50,
            pcode: "TEST123",
            category: "Categoría de prueba"
        };

        const logger = console;
        const savedProduct = await this.productDao.saveProduct(testProduct, logger);
        const updatedProductData = {           
            title: "Título actualizado",
            description: "Descripción actualizada",
            price: 150,
            stock: 60,
            pcode: "TEST456",
            category: "Categoría actualizada"
        };

        const updatedProduct = await this.productDao.updateProduct(savedProduct._id, updatedProductData, logger);
      
        expect(updatedProduct).to.be.an('object');        
        expect(updatedProduct.title).to.equal(updatedProductData.title);
        expect(updatedProduct.description).to.equal(updatedProductData.description);
        expect(updatedProduct.price).to.equal(updatedProductData.price);
        expect(updatedProduct.stock).to.equal(updatedProductData.stock);
        expect(updatedProduct.pcode).to.equal(updatedProductData.pcode);
        expect(updatedProduct.category).to.equal(updatedProductData.category);
    });

    afterEach(async function () {
        await mongoose.connection.collection('products').drop().catch(err => {
            if (err.code === 26) {
                console.log('Colección no encontrada, saltando el drop.');
            } else {
                throw err;
            }
        });
    });
    afterEach(async function () {
        await mongoose.connection.collection('carts').drop().catch(err => {
            if (err.code === 26) {
                console.log('Colección no encontrada, saltando el drop.');
            } else {
                throw err;
            }
        });
    });
    after(async function() {
        await mongoose.disconnect();
        console.log('Conexión a MongoDB cerrada');
    });
});
