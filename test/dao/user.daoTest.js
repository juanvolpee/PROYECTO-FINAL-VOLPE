import mongoose from "mongoose";
import UserServiceDao from "../../src/services/dao/mongo/users.serivces.js";
import chai from "chai";

mongoose.connect("mongodb://localhost:27017/tests?retryWrites=true&w=majority");
const expect = chai.expect;

describe('Users Services', () => {
    before(function () {
        this.usersDao = new UserServiceDao()
    });

    beforeEach(async function () {
        this.timeout(5000);
        await mongoose.connection.collection('users').drop().catch(err => {
            if (err.code === 26) {
                console.log('Colección no encontrada, saltando el drop.');
            } else {
                throw err;
            }
        });
    });

    it('Los usuarios deben ser devueltos en formato Array', async function () {
        const emptyArray = [];
        const result = await this.usersDao.userList();

        expect(result).to.be.deep.equal(emptyArray);
        expect(Array.isArray(result)).to.be.ok;
        expect(Array.isArray(result)).to.be.equal(true);
        expect(result.length).to.be.deep.equal(emptyArray.length);
    });

    it('El usuario debe ser devuelto en formato Array', async function () {
        const testUser = {
            first_name: "Roberto",
            last_name: "Carlos",
            age: 25,
            email: "carlitos@gmail.com",
            password: "123123",
            role: "admin"
        };
    
        const resultsave = await this.usersDao.userSave(testUser);
    
        let tempId = resultsave._id;
    
        const result = await this.usersDao.userById(tempId);
        console.log(result);
    
        expect(result).to.be.an('array');
        expect(result.length).to.be.equal(1);
        expect(result[0]).to.be.an('object');
        expect(result[0].first_name).to.be.equal(testUser.first_name);
        expect(result[0].last_name).to.be.equal(testUser.last_name);
    });

    it('El usuario debe guardarse correctamente en la base de datos.', async function () {
        const testUser = {
            first_name: "Roberto",
            last_name: "Carlos",
            age: 25,
            email: "carlitos@gmail.com",
            password: "123123",
            role: "admin"
        };

        const result = await this.usersDao.userSave(testUser);
        let tempId = result._id

        expect(result._id).to.be.ok;
    });

    it('El Usuario debe poder actualizar sus datos en la base de datos', async function () {
        const testUser = {
            first_name: "Roberto",
            last_name: "Carlos",
            age: 25,
            email: "carlitos@gmail.com",
            password: "123123",
            role: "admin"
        };
        const savedUser = await this.usersDao.userSave(testUser);
        let tempId = savedUser._id;

        const testUpdateUser = {
            first_name: 'Juan'
        };

        const updatedUser = await this.usersDao.updateInfo(tempId, testUpdateUser);

        expect(updatedUser).to.be.not.null;
        expect(updatedUser.first_name).to.be.equal('Juan');
    })

    afterEach(async function () {
        await mongoose.connection.collection('users').drop().catch(err => {
            if (err.code === 26) {
                console.log('Colección no encontrada, saltando el drop.');
            } else {
                throw err;
            }
        });
    });
});