const express = require('express');
const { fetchAllAccountFDs, fetchAllAccountRDs, fetchAllAccountGoldAssets, fetchAllAccountStocks, addFixedDeposit, addRecurringDeposit, addGoldAsset, addStock, closeFixedDeposit, rolloverFixedDeposit, deleteFixedDeposit, closeRecurringDeposit, deleteRecurringDeposit } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/im
const imRouter = express.Router();

imRouter.get('/fd/:accountIndex', checkAuthorization, fetchAllAccountFDs);
imRouter.get('/rd/:accountIndex', checkAuthorization, fetchAllAccountRDs);
imRouter.get('/gold/:accountIndex', checkAuthorization, fetchAllAccountGoldAssets);
imRouter.get('/stocks/:accountIndex', checkAuthorization, fetchAllAccountStocks);

imRouter.post('/fd', checkAuthorization, addFixedDeposit);
imRouter.post('/rd', checkAuthorization, addRecurringDeposit);
imRouter.post('/gold', checkAuthorization, addGoldAsset);
imRouter.post('/stocks', checkAuthorization, addStock);

imRouter.put('/fd/close', checkAuthorization, closeFixedDeposit);
imRouter.put('/fd/rollover', checkAuthorization, rolloverFixedDeposit);
imRouter.delete('/fd/:id', checkAuthorization, deleteFixedDeposit);

imRouter.put('/rd/close', checkAuthorization, closeRecurringDeposit);
imRouter.delete('/rd/:id', checkAuthorization, deleteRecurringDeposit);



module.exports = {imRouter};