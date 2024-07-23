export default class CartResponseDTO {
    constructor(cart) {
        this._id = cart._id;
        this.user = cart.user;
        this.items = cart.items.map(item => ({
            product: {
                _id: item.product._id,
                title: item.product.title,
                description: item.product.description,
                stock: item.product.stock,
                price: item.product.price,
                pcode: item.product.pcode,
                category: item.product.category,
                fecharegistro: item.product.fecharegistro,
                img: item.product.img.map(image => ({ path: image.path })),
                createdAt: item.product.createdAt,
                questions: item.product.questions
            },
            quantity: item.quantity,
            _id: item._id,
            createdAt: item.createdAt,
           
        }));            
        
    }
}
