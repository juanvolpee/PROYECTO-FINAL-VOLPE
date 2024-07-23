import mongoose from 'mongoose';
import UserServicesDao from '../../src/services/dao/mongo/users.serivces.js';
import ProductServicesDao from '../../src/services/dao/mongo/products.services.js';
import CartServicesDao from '../../src/services/dao/mongo/carts.services.js';
import chai from 'chai';

mongoose.connect('mongodb://localhost:27017/tests?retryWrites=true&w=majority');
const expect = chai.expect;
console.log('Conexión a MongoDB establecida');

describe('Cart Services', function () {

    before(async function () {
        console.log('Antes de todos los tests');
        this.userDao = new UserServicesDao();
        this.productDao = new ProductServicesDao();
        this.cartsDao = new CartServicesDao();
    });

    beforeEach(async function () {
        await mongoose.connection.collection('carts').deleteMany({}).catch(err => {
            console.log('Error borrando la colección de carritos:', err);
        });
        await mongoose.connection.collection('products').deleteMany({}).catch(err => {
            console.log('Error borrando la colección de productos:', err);
        });
    });

    async function createTestUser() {
        const testUser = {
            first_name: "Roberto",
            last_name: "Carlos",
            age: 25,
            email: "carlitos2233@gmail.com",
            password: "123123",
            role: "admin"
        };
        await this.userDao.deleteUserByEmail(testUser.email, console);
        return await this.userDao.userSave(testUser, console);
    }

    async function createTestProduct() {
        const testProduct = {
            name: 'Producto de prueba',
            title: 'Título del producto de prueba',
            description: 'Descripción del producto de prueba',
            price: 100,
            stock: 50,
            pcode: 'TEST12323',
            category: 'Categoría de prueba',
        };
        return await this.productDao.saveProduct(testProduct, console);
    }

    it('Debe crear un carrito vacío para un usuario', async function () {
        const savedUser = await createTestUser.call(this);
        const result = await this.cartsDao.createEmptyCart(savedUser._id, console);
        expect(result).to.be.an('object');
        expect(result.user.toString()).to.equal(savedUser._id.toString());
        expect(result.items).to.be.an('array').that.is.empty;
    });

    it('Debe agregar un producto al carrito', async function () {
        const savedUser = await createTestUser.call(this);
        const savedProduct = await createTestProduct.call(this);
        const productDetails = { items: { product: savedProduct._id, quantity: 2 } };
        const result = await this.cartsDao.addProductToCart({ user: savedUser._id }, productDetails, console);

        expect(result).to.be.an('object');
        expect(result.user.toString()).to.equal(savedUser._id.toString());
        expect(result.items).to.be.an('array').that.is.not.empty;
        expect(result.items[0].product.toString()).to.equal(savedProduct._id.toString());
        expect(result.items[0].quantity).to.equal(2);
    });

    it('Debe eliminar un producto del carrito', async function () {
        const savedUser = await createTestUser.call(this);
        const savedProduct = await createTestProduct.call(this);
        const productDetails = { items: { product: savedProduct._id, quantity: 2 } };
        await this.cartsDao.addProductToCart({ user: savedUser._id }, productDetails, console);
        const result = await this.cartsDao.removeProduct(savedUser._id, savedProduct._id, console);

        expect(result.modifiedCount).to.equal(1);
        const cart = await this.cartsDao.getCartByUserId(savedUser._id, console);
        expect(cart.items).to.be.an('array').that.is.empty;
    });

    it('Debe obtener un carrito por el ID de usuario', async function () {

        const savedUser = await createTestUser.call(this);
        const savedProduct = await createTestProduct.call(this);
        const productDetails = { items: { product: savedProduct._id, quantity: 2 } };
        await this.cartsDao.addProductToCart({ user: savedUser._id }, productDetails, console);
        const result = await this.cartsDao.getCartByUserId(savedUser._id, console);
        expect(result).to.be.an('object');
        expect(result).to.have.property('user');
        expect(result).to.have.property('items');
        expect(result.user.toString()).to.equal(savedUser._id.toString());
        expect(result.items).to.be.an('array');
        expect(result.items).to.have.lengthOf.at.least(1);
        const item = result.items[0];
        expect(item).to.have.property('product');
        expect(item).to.have.property('quantity');
        const productIdInItem = item.product._id ? item.product._id : item.product;
        expect(productIdInItem.toString()).to.equal(savedProduct._id.toString());
        expect(item.quantity).to.equal(2);
    });

    afterEach(async function () {
        await mongoose.connection.collection('carts').deleteMany({}).catch(err => {
            console.log('Error borrando la colección de carritos:', err);
        });
        await mongoose.connection.collection('products').deleteMany({}).catch(err => {
            console.log('Error borrando la colección de productos:', err);
        });
    });
    after(async function () {
        await mongoose.disconnect();
        console.log('Conexión a MongoDB cerrada');
    });
});
