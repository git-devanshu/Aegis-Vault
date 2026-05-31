const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    accountIndex : {type : Number, required : true},
    trackerIndex : {type : Number, required : true},
    expenseData : {type : String, required : true},
    nonce : {type : String, required : true},
    categoryIndex : {type : Number, required : true}
});

const Expenses = mongoose.model('expenses', expenseSchema, 'expenses');

module.exports = {Expenses};

/*

expenseData {
    amount,
    spentAt,
    spentDate
}

This object is stringified and then encrypted on client side

*/