const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    accountData : {type : String, required : true},
    accountIndex : {type : Number, required : true},
    nonce : {type : String, required : true}
});

const BankAccounts = mongoose.model('bankAccounts', bankAccountSchema, 'bankAccounts');

module.exports = {BankAccounts};

/*

Use _id for account deletion

accountData {
    countryCode,
    bankId,
    accountNo,
    accountAlias,
    totalIncome,
    totalExpense
}

This object is stringified and then encrypted on client side

*/
