const mongoose = require('mongoose');

const fixedDepositSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},

    accountIndex : {type : Number, required : true},

    fdIndex : {type : Number, required : true},

    status : {type : Number, required : true},

    fdData : {type : String, required : true},

    nonce : {type : String, required : true}
});

const FixedDeposits = mongoose.model('fixedDeposits', fixedDepositSchema, 'fixedDeposits');

module.exports = {FixedDeposits};

/*

status :
0 -> active
1 -> matured
2 -> rolled
3 -> closed


fdData {
    holderName,
    nominee,
    principal,
    rate,
    period,
    startDate,
    maturityDate,
    maturityAmount
}

This object is stringified and then encrypted on client side

*/