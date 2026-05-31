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


const updateBankAccount = async(userId, accountData, accountIndex, nonce) =>{
    const updatedBankAccount = await BankAccounts.findOneAndUpdate(
        {userId, accountIndex},
        {accountData, nonce}
    );
    return updatedBankAccount ? true : false;
}


module.exports = {
    updateBankAccount
};