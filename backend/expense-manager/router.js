const express = require('express');
const { fetchAllAccountTrackers, fetchAllTrackerExpenses, fetchAllUserCategories, addIncomeTracker, deleteIncomeTracker, addExpense, deleteExpense, transferExpenses, addMultipleExpenses } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/em
const emRouter = express.Router();

emRouter.get('/trackers/:accountIndex', checkAuthorization, fetchAllAccountTrackers);
emRouter.get('/expenses/:trackerIndex/:accountIndex', checkAuthorization, fetchAllTrackerExpenses);
emRouter.get('/categories', checkAuthorization, fetchAllUserCategories);

emRouter.post('/trackers', checkAuthorization, addIncomeTracker);
emRouter.delete('/trackers/:trackerId', checkAuthorization, deleteIncomeTracker);

emRouter.post('/expenses', checkAuthorization, addExpense);
emRouter.post('/expenses/multiple', checkAuthorization, addMultipleExpenses);
emRouter.delete('/expenses/:expenseId', checkAuthorization, deleteExpense);
emRouter.put('/expenses/transfer', checkAuthorization, transferExpenses);


module.exports = {emRouter};
