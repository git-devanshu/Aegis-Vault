const mongoose = require('mongoose');

const goldAssetSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    accountIndex : {type : Number, required : true},
    status : {type : Number, required : true},
    assetData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const GoldAssets = mongoose.model('goldAssets', goldAssetSchema, 'goldAssets');

module.exports = {GoldAssets};

/*

status :
0 -> active
1 -> sold


assetData {
    holderName,
    assetType,
    assetName,
    weight,
    rate,
    totalPrice,
    purchaseDate,
    broker
}

This object is stringified and then encrypted on client side

*/