export default class AddressRepository{
    constructor(dao){
        this.dao = dao
    }
    getFullAddress = async (userId,logger) => {
        return this.dao.getFullAddress(userId,logger)
    }
    saveAddress = async (addressData,logger) => {
        return this.dao.saveAddress(addressData,logger)
    }
}