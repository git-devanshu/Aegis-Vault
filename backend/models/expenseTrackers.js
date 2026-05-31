const mongoose = require('mongoose');

const expenseTrackerSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    accountIndex : {type : Number, required : true},
    trackerIndex : {type : Number, required : true},
    trackerData : {type : String, required : true},
    trackerDataNonce : {type : String, required : true},
    limitsData : {type : String, required : true},
    limitsDataNonce : {type : String, required : true}
});

const ExpenseTrackers = mongoose.model('expenseTrackers', expenseTrackerSchema, 'expenseTrackers');

module.exports = {ExpenseTrackers};

/*

trackerData {
    name,
    amount
}

This object is stringified and then encrypted on client side


limitsData [
    {
        categoryIndex,
        limit
    }
]

This array is stringified and then encrypted on client side

*/