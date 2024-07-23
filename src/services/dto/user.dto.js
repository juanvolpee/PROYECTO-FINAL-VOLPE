
export default class UserDto {
    constructor(user) {
        this._id = user._id
        this.fullname = user.first_name + user.last_name
        this.email = user.email
        this.age = user.age
        this.role = user.role
        this.fecha_reg = user.fecha_reg
        this.favProducts = user.favProducts
    }
}