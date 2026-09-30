const {BankAccounts} = require('../models/bankAccounts');

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