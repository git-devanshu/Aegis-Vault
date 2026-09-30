const express = require('express');
const { fetchAllAccountTrackers, fetchAllTrackerExpenses, fetchAllUserCategories, addIncomeTracker, deleteIncomeTracker, addExpense, deleteExpense, transferExpenses, addMultipleExpenses, updateExpenseCategories, updateExpenseLimits, addNewCreditCard, updateCreditCardsDetails, deleteCreditCard, fetchAllAccountCreditCards, fetchAllCardCreditCardSpendings, addCreditCardSpending, deleteCreditCardSpending, payCreditCardBill } = require('./controller');
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

emRouter.post('/categories', checkAuthorization, updateExpenseCategories);
emRouter.post('/limits', checkAuthorization, updateExpenseLimits);

emRouter.get('/credit-card/:accountIndex', checkAuthorization, fetchAllAccountCreditCards);
emRouter.post('/credit-card', checkAuthorization, addNewCreditCard);
emRouter.put('/credit-card', checkAuthorization, updateCreditCardsDetails)
emRouter.delete('/credit-card/:cardId', checkAuthorization, deleteCreditCard);
emRouter.post('/credit-card/pay-bill', checkAuthorization, payCreditCardBill);

emRouter.get('/credit-card-spendings/:ccIndex/:accountIndex', checkAuthorization, fetchAllCardCreditCardSpendings);
emRouter.post('/credit-card-spendings', checkAuthorization, addCreditCardSpending);
emRouter.delete('/credit-card-spendings/:spendingId', checkAuthorization, deleteCreditCardSpending);

module.exports = {emRouter};
