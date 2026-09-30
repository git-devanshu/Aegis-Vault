const mongoose = require('mongoose');

const creditCardSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    accountIndex : {type : Number, required : true},
    ccIndex : {type : Number, required : true},
    cardsData : {type : String, required : true},
    billingCycleData : {type : String, required : true},
    cardsDataNonce : {type : String, required : true},
    billingCycleDataNonce : {type : String, required : true}
});

const CreditCards = mongoose.model('creditCards', creditCardSchema, 'creditCards');

module.exports = {CreditCards};

/*

cardsData [
    {
        cardName,
        cardNumber,
        network
    }
]

The card at 0 index will be primary card and other cards will be treated as companion/add-on cards
This array of object is stringified and then encrypted on client side

billingCycleData {
    spendingLimit,
    billingDate
}

Always process the billing date for present month before any other calculations
This object is stringified and then encrypted on client side

*/
