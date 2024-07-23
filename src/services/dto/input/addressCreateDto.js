export default class AddressCreateDto {
    constructor(_id, country, state, city, zipcode, addressText, numext) {
        this.userId = _id;
        this.country = country;
        this.state = state;
        this.city = city;
        this.zipcode = zipcode;
        this.addressText = addressText;
        this.numext = numext;
    }
}