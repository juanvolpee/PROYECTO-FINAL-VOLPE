import { faker } from "@faker-js/faker";

export const fakeusers = (req, res) => {
    let first_name = faker.name.firstName()
    let last_name = faker.name.lastName()
    let age = faker.random.numeric(2)
    let email = faker.internet.email()
    let password = faker.internet.password()

    res.send({first_name,last_name,age,email,password})
}