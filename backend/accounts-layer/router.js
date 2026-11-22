const express = require('express');
const { addBankAccount, fetchUserBankAccounts, deleteBankAccount, updateBankAccountDetails } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/al
const alRouter = express.Router();

alRouter.get('/accounts', checkAuthorization, fetchUserBankAccounts);
alRouter.post('/accounts', checkAuthorization, addBankAccount);
alRouter.delete('/accounts/:accountId', checkAuthorization, deleteBankAccount);

// remove from production once done
alRouter.put('/update-account', checkAuthorization, updateBankAccountDetails);

module.exports = {alRouter};
