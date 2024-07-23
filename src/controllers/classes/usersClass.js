import moment from "moment";
import { createHash } from "../../utils.js";
export class UsersClass {
    constructor(first_name, last_name, age, email, password, role, cart, fecha_reg) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.age = age;
        this.email = email;
        this.password = createHash(password);
        this.role = role ? role : 'user'
        
        this.fecha_reg = moment().format();
    }
}