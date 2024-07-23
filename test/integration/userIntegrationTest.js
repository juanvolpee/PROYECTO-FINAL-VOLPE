import chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe(" ", () => {
    before(function () {
        this.cookie;
        this.testUser = {
            first_name: "Roberto",
            last_name: "Carlos",
            age: 25,
            email: "carlitos@gmail.com",
            password: "123123",
            role: "admin"
        };
    })

    it("Debe poder registrar un usuario correctamente", async function () {
        const { statusCode } = await requester.post('/api/users/register').send(this.testUser)
        expect(statusCode).is.eql(201)
    })
    it("El usuario registrado recientemente debe pdoer realizar el login correctamente.", async function () {
        const testlogin = {
            email: this.testUser.email,
            password: this.testUser.password
        }

        const result = await requester.post('/api/users/login').send(testlogin)
        const cookieResult = result.headers['set-cookie'][0]

        const cookieData = cookieResult.split("=")
        this.cookie = {
            name: cookieData[0],
            value: cookieData[1]
        }

        expect(result.statusCode).is.eqls(200)
        expect(this.cookie.name).to.be.ok.and.eql('coderCookie')
        expect(this.cookie.value).to.be.ok
    })
})