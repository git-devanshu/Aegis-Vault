const mongoose = require('mongoose');

const creditCardSpendingsSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    accountIndex : {type : Number, required : true},
    ccIndex : {type : Number, required : true},
    spendingData : {type : String, required : true},
    paymentDue : {type : Boolean, default : true},
    nonce : {type : String, required : true},
    categoryIndex : {type : Number, required : true}
});

const CreditCardSpendings = mongoose.model('creditCardSpendings', creditCardSpendingsSchema, 'creditCardSpendings');

module.exports = {CreditCardSpendings};

/*

spendingData {
    amount,
    spentAt,
    spentDate,
    cardUsed
}

This object is stringified and then encrypted on client side

*/