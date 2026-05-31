const {Users} = require('../models/users');
const {BankAccounts} = require('../models/bankAccounts');
const {ExpenseCategories} = require('../models/expenseCategories');
const {ExpenseTrackers} = require('../models/expenseTrackers');
const {Expenses} = require('../models/expenses');
const {FixedDeposits} = require('../models/fixedDeposits');
const {GoldAssets} = require('../models/goldAssets');
const {RecurringDeposits} = require('../models/recurringDeposits');
const {Stocks} = require('../models/stocks');
const {Settings} = require('../models/settings');
const {getLanguageConstants} = require('../utility/language');

require('dotenv').config();


/*
* POST /api/al/accounts
* Create a new bank account for a user
*/
const addBankAccount = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountData, nonce} = req.body;
        if(!accountData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const highestAccount = await BankAccounts.findOne({userId: req.id}).sort({accountIndex: -1});
        const accountIndex = highestAccount ? highestAccount.accountIndex + 1 : 0;

        const newAccount = new BankAccounts({
            userId: req.id,
            accountIndex,
            accountData,
            nonce
        });
        await newAccount.save();

        res.status(200).json({ message:RESPONSES.ACCOUNTS_LAYER.ACCOUNT_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/al/accounts
* Fetch all bank accounts of a user
*/
const fetchUserBankAccounts = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accounts = await BankAccounts.find({ userId: req.id });
        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, accounts });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/al/accounts/{accountId}
* Delete an account of a user, also deletes all related entities
*/
const deleteBankAccount = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountId = req.params.accountId;
        if(!accountId){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedAccount = await BankAccounts.findOneAndDelete({_id: accountId, userId: req.id});
        if(!deletedAccount){
            return res.status(404).json({ message : RESPONSES.ACCOUNTS_LAYER.ACCOUNT_NOT_FOUND });
        }

        const accountIndex = deletedAccount.accountIndex;

        await Promise.all([
            ExpenseTrackers.deleteMany({ userId: req.id, accountIndex }),
            Expenses.deleteMany({ userId: req.id, accountIndex }),
            FixedDeposits.deleteMany({ userId: req.id, accountIndex }),
            RecurringDeposits.deleteMany({ userId: req.id, accountIndex }),
            Stocks.deleteMany({ userId: req.id, accountIndex }),
            GoldAssets.deleteMany({ userId: req.id, accountIndex})
        ]);

        res.status(200).json({ message : RESPONSES.ACCOUNTS_LAYER.ACCOUNT_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/al/
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
* POST /api/al/
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
    fetchUserBankAccounts,
    addBankAccount,
    deleteBankAccount
};