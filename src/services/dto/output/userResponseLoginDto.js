export default class UserResponseLoginDto {
    constructor(user) {
        this.userId = user._id;
        this.firstName = user.first_name;
        this.lastName = user.last_name;        
        this.email = user.email;
        this.role = user.role; 
        this.cartId = user.cart;  
    }
}