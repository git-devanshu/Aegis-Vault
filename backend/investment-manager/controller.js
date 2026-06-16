const {Users} = require('../models/users');
const {BankAccounts} = require('../models/bankAccounts');
const {FixedDeposits} = require('../models/fixedDeposits');
const {GoldAssets} = require('../models/goldAssets');
const {RecurringDeposits} = require('../models/recurringDeposits');
const {Stocks} = require('../models/stocks');
const {Settings} = require('../models/settings');
const {getLanguageConstants} = require('../utility/language');

require('dotenv').config();


/*
* GET /api/im/fd/{accountIndex}
* Fetch all fixed deposits for a specific bank account
*/
const fetchAllAccountFDs = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const fdData = await FixedDeposits.find({ userId: req.id, accountIndex }).sort({fdIndex: -1});
        const responseMessage = !fdData?.length ? RESPONSES.INVESTMENT_MANAGER.NO_FD_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, fdData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/im/rd/{accountIndex}
* Fetch all recurring deposits for a specific bank account
*/
const fetchAllAccountRDs = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const rdData = await RecurringDeposits.find({ userId: req.id, accountIndex }).sort({rdIndex: -1});
        const responseMessage = !rdData?.length ? RESPONSES.INVESTMENT_MANAGER.NO_RD_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, rdData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/im/gold/{accountIndex}
* Fetch all gold assets for a specific bank account
*/
const fetchAllAccountGoldAssets = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const goldAssetData = await GoldAssets.find({ userId: req.id, accountIndex });
        const responseMessage = !goldAssetData?.length ? RESPONSES.INVESTMENT_MANAGER.NO_GOLD_ASSET_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, goldAssetData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/im/stocks/{accountIndex}
* Fetch all stocks for a specific bank account
*/
const fetchAllAccountStocks = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const stockData = await Stocks.find({ userId: req.id, accountIndex });
        const responseMessage = !stockData?.length ? RESPONSES.INVESTMENT_MANAGER.NO_STOCK_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, stockData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/im/fd
* Add Fixed Deposit to a specific account of a specific user
*/
const addFixedDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, fdData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        
        if(Number.isNaN(accountIndexNumber) || !fdData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const highestAccountFD = await FixedDeposits.findOne({userId: req.id, accountIndex: accountIndexNumber}).sort({fdIndex: -1});
        const fdIndex = highestAccountFD ? highestAccountFD.fdIndex + 1 : 0;

        const newFD = new FixedDeposits({
            userId: req.id,
            accountIndex: accountIndexNumber,
            fdIndex,
            status: 0,
            fdData,
            nonce
        });
        await newFD.save();

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/im/rd
* Add Recurring Deposit to a specific account of a specific user
*/
const addRecurringDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, rdData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        
        if(Number.isNaN(accountIndexNumber) || !rdData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const highestAccountRD = await RecurringDeposits.findOne({userId: req.id, accountIndex: accountIndexNumber}).sort({rdIndex: -1});
        const rdIndex = highestAccountRD ? highestAccountRD.rdIndex + 1 : 0;

        const newRD = new RecurringDeposits({
            userId: req.id,
            accountIndex: accountIndexNumber,
            rdIndex,
            status: 0,
            rdData,
            nonce
        });
        await newRD.save();

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.RD_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/im/gold
* Add Gold Asset to a specific account of a specific user
*/
const addGoldAsset = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, assetData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        
        if(Number.isNaN(accountIndexNumber) || !assetData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newGoldAsset = new GoldAssets({
            userId: req.id,
            accountIndex: accountIndexNumber,
            status: 0,
            assetData,
            nonce
        });
        await newGoldAsset.save();

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.GOLD_ASSET_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/im/stocks
* Add Stock to a specific account of a specific user
*/
const addStock = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, stockData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        
        if(Number.isNaN(accountIndexNumber) || !stockData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newStock = new Stocks({
            userId: req.id,
            accountIndex: accountIndexNumber,
            status: 0,
            stockData,
            nonce
        });
        await newStock.save();

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.STOCK_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/im/fd/close
* Close a Fixed Deposit by updating its status and closed date
*/
const closeFixedDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {id, fdData, nonce} = req.body;
        if(!id?.length || !fdData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedFD = await FixedDeposits.updateOne(
            {_id: id, userId: req.id},
            {$set: {
                status: 2,
                fdData,
                nonce
            }}
        );

        if(!updatedFD){
            return res.status(404).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_CLOSED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/im/fd/rollover
* Rollover a Fixed Deposit by marking current entry rolled and creating a new entry
*/
const rolloverFixedDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {id, accountIndex, fdIndex, fdData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        const fdIndexNumber = Number(fdIndex);

        if(!id?.length || Number.isNaN(accountIndexNumber) || Number.isNaN(fdIndexNumber) || !fdData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedFD = await FixedDeposits.updateOne(
            {_id: id, userId: req.id},
            {$set: {status: 1}}
        );
        if(!updatedFD){
            return res.status(404).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_NOT_FOUND });
        }

        const rolledFD = new FixedDeposits({
            userId: req.id,
            accountIndex: accountIndexNumber,
            fdIndex: fdIndexNumber,
            status: 0,
            fdData,
            nonce
        });
        await rolledFD.save();

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_ROLLED_OVER });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/im/fd/{id}
* Delete all entries of a specific Fixed Deposit
*/
const deleteFixedDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const id = req.params.id;
        if(!id?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const fd = await FixedDeposits.findOne({ _id: id, userId: req.id });
        if(!fd){
            return res.status(404).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_NOT_FOUND });
        }

        await FixedDeposits.deleteMany({
            userId: req.id,
            accountIndex: fd.accountIndex,
            fdIndex: fd.fdIndex
        });

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.FD_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/im/rd/close
* Close a Recurring Deposit by updating its status and closed date
*/
const closeRecurringDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {id, rdData, nonce} = req.body;
        if(!id?.length || !rdData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedRD = await RecurringDeposits.updateOne(
            {_id: id, userId: req.id},
            {$set: {
                status: 1,
                rdData,
                nonce
            }}
        );

        if(!updatedRD){
            return res.status(404).json({ message : RESPONSES.INVESTMENT_MANAGER.RD_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.RD_CLOSED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/im/rd/{id}
* Delete a specific Recurring Deposit
*/
const deleteRecurringDeposit = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const id = req.params.id;
        if(!id?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const rd = await RecurringDeposits.findOneAndDelete({ _id: id, userId: req.id });
        if(!rd){
            return res.status(404).json({ message : RESPONSES.INVESTMENT_MANAGER.RD_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.INVESTMENT_MANAGER.RD_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/im/gold/sell
* Sell a Gold Asset
*/
const sellGoldAsset = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {id, assetData, nonce} = req.body;
        if(!id?.length || !assetData?.length || !nonce?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedGoldAsset = await GoldAssets.updateOne(
            { _id: id, userId: req.id }, 
            { $set:{
                    status: 1,
                    assetData,
                    nonce
                }
            }
        );

        if(!updatedGoldAsset){
            return res.status(404).json({ message: RESPONSES.INVESTMENT_MANAGER.GOLD_ASSET_NOT_FOUND });
        }
        res.status(200).json({ message: RESPONSES.INVESTMENT_MANAGER.GOLD_ASSET_SOLD });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message: RESPONSES.COMMON.SERVER_ERROR });
    }
};


/*
* DELETE /api/im/gold/{id}
* Delete a Gold Asset
*/
const deleteGoldAsset = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const id = req.params.id;
        if(!id?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedGoldAsset = await GoldAssets.findOneAndDelete({ _id: id, userId: req.id });
        if(!deletedGoldAsset){
            return res.status(404).json({ message: RESPONSES.INVESTMENT_MANAGER.GOLD_ASSET_NOT_FOUND });
        }

        res.status(200).json({ message: RESPONSES.INVESTMENT_MANAGER.GOLD_ASSET_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message: RESPONSES.COMMON.SERVER_ERROR });
    }
};


/*
* PUT /api/im/stocks/sell
* Sell a Stock
*/
const sellStock = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {id, stockData, nonce} = req.body;
        if(!id?.length || !stockData?.length || !nonce?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedStock = await Stocks.updateOne(
            { _id: id, userId: req.id },
            { $set:{
                    status: 1,
                    stockData,
                    nonce
                }
            }
        );

        if(!updatedStock){
            return res.status(404).json({ message: RESPONSES.INVESTMENT_MANAGER.STOCK_NOT_FOUND });
        }
        res.status(200).json({ message: RESPONSES.INVESTMENT_MANAGER.STOCK_SOLD });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message: RESPONSES.COMMON.SERVER_ERROR });
    }
};


/*
* DELETE /api/im/stocks/{id}
* Delete a Stock
*/
const deleteStock = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const id = req.params.id;
        if(!id?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedStock = await Stocks.findOneAndDelete({ _id: id, userId: req.id });
        if(!deletedStock){
            return res.status(404).json({ message: RESPONSES.INVESTMENT_MANAGER.STOCK_NOT_FOUND });
        }

        res.status(200).json({ message: RESPONSES.INVESTMENT_MANAGER.STOCK_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message: RESPONSES.COMMON.SERVER_ERROR });
    }
};


/*
* POST /api/im/
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* POST /api/im/
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


module.exports = {
    fetchAllAccountFDs,
    fetchAllAccountRDs,
    fetchAllAccountGoldAssets,
    fetchAllAccountStocks,
    addFixedDeposit,
    addRecurringDeposit,
    addGoldAsset,
    addStock,
    closeFixedDeposit,
    rolloverFixedDeposit,
    deleteFixedDeposit,
    closeRecurringDeposit,
    deleteRecurringDeposit,
    deleteGoldAsset,
    sellGoldAsset,
    deleteStock,
    sellStock
};