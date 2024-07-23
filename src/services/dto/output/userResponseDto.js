export default class UserResponseDto {
    constructor(user) {
        this.id = user._id;
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.age = user.age;
        this.email = user.email;
        this.role = user.role;
        this.questions = user.questions;
        this.registrationDate = user.fecha_reg;
        this.documents = user.documents.map(doc => ({
            document_name: doc.document_name,
            path: doc.path
        }));

        if (user.favProducts) {
            this.favProducts = user.favProducts.map(product => ({
                productId: product.productId,
                id: product._id
            }));
        }

        this.cart = user.cart;
        if (user.purchasedProducts) {
            this.purchasedProducts = user.purchasedProducts.map(purchasedProduct => ({
                product: {
                    productId: purchasedProduct.product.productId,
                    status: purchasedProduct.product.status
                },
                id: purchasedProduct._id
            }));
        }
    }
}
