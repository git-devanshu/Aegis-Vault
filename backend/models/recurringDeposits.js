const mongoose = require('mongoose');

const recurringDepositSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},

    accountIndex : {type : Number, required : true},

    rdIndex : {type : Number, required : true},

    status : {type : Number, required : true},

    rdData : {type : String, required : true},

    nonce : {type : String, required : true}
});

const RecurringDeposits = mongoose.model('recurringDeposits', recurringDepositSchema, 'recurringDeposits');

module.exports = {RecurringDeposits};

/*

status :
0 -> active
1 -> matured
2 -> closed


rdData {
    holderName,
    nominee,
    installment,
    rate,
    period,
    startDate,
    maturityDate,
    maturityAmount
}

This object is stringified and then encrypted on client side

*/