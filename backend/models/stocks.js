const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},

    accountIndex : {type : Number, required : true},

    status : {type : Number, required : true},

    stockData : {type : String, required : true},

    nonce : {type : String, required : true}
});

const Stocks = mongoose.model('stocks', stockSchema, 'stocks');

module.exports = {Stocks};

/*

status :
0 -> held
1 -> sold


stockData {
    name,
    symbol,
    units,
    unitPrice,
    totalPrice,
    purchaseDate
}

This object is stringified and then encrypted on client side

*/