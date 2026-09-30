const {ExpenseCategories} = require('../models/expenseCategories');
const {ExpenseTrackers} = require('../models/expenseTrackers');
const {Expenses} = require('../models/expenses');
const {CreditCardSpendings} = require('../models/creditCardSpendings');
const {CreditCards} = require('../models/creditCards');
const {getLanguageConstants} = require('../utility/language');
const {updateBankAccount} = require('../accounts-layer/helper');

require('dotenv').config();


/*
* GET /api/em/trackers/{accountIndex}
* Fetch all trackers for a specific bank account
*/
const fetchAllAccountTrackers = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const trackerData = await ExpenseTrackers.find({ userId: req.id, accountIndex }).sort({trackerIndex: -1});
        const responseMessage = !trackerData?.length ? RESPONSES.EXPENSE_MANAGER.NO_TRACKER_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, trackerData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/em/expenses/{trackerIndex}/{accountIndex}
* Fetch all expenses for a specific tracker of a specific bank account
*/
const fetchAllTrackerExpenses = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const trackerIndex = Number(req.params.trackerIndex);
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(trackerIndex) || Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const expenseData = await Expenses.find({ userId: req.id, trackerIndex, accountIndex });
        const responseMessage = !expenseData?.length ? RESPONSES.EXPENSE_MANAGER.NO_EXPENSE_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, expenseData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/em/categories
* Fetch all custom categories of a specific user
*/
const fetchAllUserCategories = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const categoryData = await ExpenseCategories.findOne({ userId: req.id });
        res.status(200).json({ message : RESPONSES.COMMON.SUCCESS, categoryData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/trackers
* Add Tracker to a specific account of a specific user
*/
const addIncomeTracker = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, trackerData, trackerDataNonce, limitsData, limitsDataNonce, accountData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        
        if(Number.isNaN(accountIndexNumber) || !trackerData?.length || !trackerDataNonce?.length || !limitsData?.length || !limitsDataNonce?.length || !accountData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const isAccountUpdated = await updateBankAccount(req.id, accountData, accountIndexNumber, nonce);
        if(!isAccountUpdated){
            return res.status(500).json({ message : RESPONSES.ACCOUNTS_LAYER.ERROR_UPDATING_BALANCE });
        }

        const highestAccountTracker = await ExpenseTrackers.findOne({userId: req.id, accountIndex: accountIndexNumber}).sort({trackerIndex: -1});
        const trackerIndex = highestAccountTracker ? highestAccountTracker.trackerIndex + 1 : 0;

        const newTracker = new ExpenseTrackers({
            userId: req.id,
            accountIndex: accountIndexNumber,
            trackerIndex,
            trackerData,
            trackerDataNonce,
            limitsData,
            limitsDataNonce
        });
        await newTracker.save();

        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.TRACKER_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}

/*
* DELETE /api/em/trackers/{trackerId}
* Delete a specific tracker, do not allow deletion if expenses are present under it
*/
const deleteIncomeTracker = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const trackerId = req.params.trackerId;
        const {accountData, nonce} = req.body;

        if(!trackerId || !accountData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const incomeTracker = await ExpenseTrackers.findOne({_id: trackerId, userId: req.id});
        if(!incomeTracker){
            return res.status(404).json({ message : RESPONSES.EXPENSE_MANAGER.TRACKER_NOT_FOUND });
        }

        const presentExpenses = await Expenses.exists({userId: req.id, accountIndex: incomeTracker.accountIndex, trackerIndex: incomeTracker.trackerIndex});
        if(presentExpenses){
            return res.status(409).json({ message : RESPONSES.EXPENSE_MANAGER.CANNOT_DELETE_TRACKER });
        }

        const isAccountUpdated = await updateBankAccount(req.id, accountData, incomeTracker.accountIndex, nonce);
        if(!isAccountUpdated){
            return res.status(500).json({ message : RESPONSES.ACCOUNTS_LAYER.ERROR_UPDATING_BALANCE });
        }

        await incomeTracker.deleteOne();
        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.TRACKER_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/expenses
* Add expense in a specific tracker of a specific bank account
*/
const addExpense = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, trackerIndex, categoryIndex, expenseData, nonce, accountData, accountNonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        const trackerIndexNumber = Number(trackerIndex);
        const categoryIndexNumber = Number(categoryIndex);

        if(Number.isNaN(accountIndexNumber) || Number.isNaN(trackerIndexNumber) || Number.isNaN(categoryIndexNumber) || !expenseData?.length || !nonce?.length || !accountData?.length || !accountNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const isAccountUpdated = await updateBankAccount(req.id, accountData, accountIndexNumber, accountNonce);
        if(!isAccountUpdated){
            return res.status(500).json({ message : RESPONSES.ACCOUNTS_LAYER.ERROR_UPDATING_BALANCE });
        }

        const newExpense = new Expenses({
            userId: req.id,
            accountIndex: accountIndexNumber,
            trackerIndex: trackerIndexNumber,
            categoryIndex: categoryIndexNumber,
            expenseData,
            nonce
        });
        await newExpense.save();

        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.EXPENSE_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/expenses/multiple
* Add multiple expenses in one request
*/
const addMultipleExpenses = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {expenses, accountData, accountNonce} = req.body;
        if(!Array.isArray(expenses) || !expenses.length || !accountData?.length || !accountNonce?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const formattedExpenses = [];
        for(const expense of expenses){
            const { accountIndex, trackerIndex, categoryIndex, expenseData, nonce } = expense;
            const accountIndexNumber = Number(accountIndex);
            const trackerIndexNumber = Number(trackerIndex);
            const categoryIndexNumber = Number(categoryIndex);

            if(Number.isNaN(accountIndexNumber) || Number.isNaN(trackerIndexNumber) || Number.isNaN(categoryIndexNumber) || !expenseData?.length || !nonce?.length){
                return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
            }

            formattedExpenses.push({
                userId: req.id,
                accountIndex: accountIndexNumber,
                trackerIndex: trackerIndexNumber,
                categoryIndex: categoryIndexNumber,
                expenseData,
                nonce
            });
        }

        const isAccountUpdated = await updateBankAccount(req.id, accountData, Number(expenses[0].accountIndex), accountNonce);
        if(!isAccountUpdated){
            return res.status(500).json({ message: RESPONSES.ACCOUNTS_LAYER.ERROR_UPDATING_BALANCE });
        }

        await Expenses.insertMany(formattedExpenses);

        res.status(200).json({ message: RESPONSES.EXPENSE_MANAGER.EXPENSE_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message: RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/em/expenses/{expenseId}
* Delete a specific expense
*/
const deleteExpense = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const expenseId = req.params.expenseId;
        const {accountData, nonce} = req.body;
        if(!expenseId || !accountData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const currentExpense = await Expenses.findOne({ _id: expenseId, userId: req.id });
        if(!currentExpense){
            return res.status(404).json({ message : RESPONSES.EXPENSE_MANAGER.EXPENSE_NOT_FOUND });
        }

        const isAccountUpdated = await updateBankAccount(req.id, accountData, currentExpense.accountIndex, nonce);
        if(!isAccountUpdated){
            return res.status(500).json({ message : RESPONSES.ACCOUNTS_LAYER.ERROR_UPDATING_BALANCE });
        }

        await currentExpense.deleteOne();
        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.EXPENSE_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/em/expenses/transfer
* Transfer the expenses from one tracker to another by changing the trackerIndex
* Accept the array of _ids of the expenses and target trackerIndex
*/
const transferExpenses = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {expenseIds, targetTrackerIndex} = req.body;
        const trackerIndexNumber = Number(targetTrackerIndex);
        if(!Array.isArray(expenseIds) || expenseIds.length === 0 || Number.isNaN(trackerIndexNumber)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        await Expenses.updateMany({
                _id: { $in: expenseIds },
                userId: req.id
            }, {
                trackerIndex: trackerIndexNumber
            }
        );

        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.EXPENSES_TRANSFERRED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/categories
* Create or update the expense categories array
*/
const updateExpenseCategories = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {categoryData, nonce} = req.body;
        if(!categoryData?.length || !nonce?.length){
            return res.status(400).json({message: RESPONSES.COMMON.UNEXPECTED_ERROR});
        }

        await ExpenseCategories.findOneAndUpdate({userId: req.id}, {
                categoryData,
                nonce
            }, {
                upsert: true,
                new: true
            }
        );

        res.status(200).json({ message: RESPONSES.EXPENSE_MANAGER.CATEGORIES_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({message: RESPONSES.COMMON.SERVER_ERROR});
    }
}


/*
* POST /api/em/limits
* Update category budgets for a specific income tracker
*/
const updateExpenseLimits = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, trackerIndex, limitsData, limitsDataNonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        const trackerIndexNumber = Number(trackerIndex);

        if(Number.isNaN(accountIndexNumber) || Number.isNaN(trackerIndexNumber) || !limitsData?.length || !limitsDataNonce?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedTracker = await ExpenseTrackers.findOneAndUpdate({
                userId: req.id,
                accountIndex: accountIndexNumber,
                trackerIndex: trackerIndexNumber
            }, {
                limitsData,
                limitsDataNonce
            }
        );
        if(!updatedTracker){
            return res.status(404).json({ message: RESPONSES.EXPENSE_MANAGER.TRACKER_NOT_FOUND });
        }

        res.status(200).json({ message: RESPONSES.EXPENSE_MANAGER.LIMITS_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message: RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/credit-card
* Add a new credit card for a specific bank account
*/
const addNewCreditCard = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, cardsData, billingCycleData, cardsDataNonce, billingCycleDataNonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
 
        if(Number.isNaN(accountIndexNumber) || !cardsData?.length || !billingCycleData?.length || !cardsDataNonce?.length || !billingCycleDataNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const highestAccountCreditCard = await CreditCards.findOne({userId: req.id, accountIndex: accountIndexNumber}).sort({ccIndex: -1});
        const ccIndex = highestAccountCreditCard ? highestAccountCreditCard.ccIndex + 1 : 0;

        const newCreditCard = new CreditCards({
            userId: req.id,
            accountIndex: accountIndexNumber,
            ccIndex,
            cardsData,
            billingCycleData,
            cardsDataNonce,
            billingCycleDataNonce
        });
        await newCreditCard.save();

        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.CREDIT_CARD_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/em/credit-card
* Update the addon/companion cards, billing cycle or spending limit for already existing credit card
*/
const updateCreditCardsDetails = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, ccIndex, cardsData, billingCycleData, cardsDataNonce, billingCycleDataNonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        const ccIndexNumber = Number(ccIndex);
        
        if(Number.isNaN(accountIndexNumber) || Number.isNaN(ccIndexNumber) || !cardsData?.length || !billingCycleData?.length || !cardsDataNonce?.length || !billingCycleDataNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedCreditCard = await CreditCards.findOneAndUpdate({
            userId: req.id,
            accountIndex: accountIndexNumber,
            ccIndex: ccIndexNumber
        }, {
            cardsData, 
            billingCycleData, 
            cardsDataNonce, 
            billingCycleDataNonce
        }
    );
    if(!updatedCreditCard){
        return res.status(404).json({ message: RESPONSES.EXPENSE_MANAGER.CARD_NOT_FOUND });
    }

    res.status(200).json({ message: RESPONSES.EXPENSE_MANAGER.CARD_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/em/credit-card/{cardId}
* Delete a credit card with all its addon cards only if it has no spendings under it
*/
const deleteCreditCard = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const cardId = req.params.cardId;
        if(!cardId){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const creditCard = await CreditCards.findOne({_id: cardId, userId: req.id});
        if(!creditCard){
            return res.status(404).json({ message : RESPONSES.EXPENSE_MANAGER.CARD_NOT_FOUND });
        }

        const presentSpendings = await CreditCardSpendings.exists({userId: req.id, accountIndex: creditCard.accountIndex, ccIndex: creditCard.ccIndex});
        if(presentSpendings){
            return res.status(409).json({ message : RESPONSES.EXPENSE_MANAGER.CANNOT_DELETE_CARD });
        }

        await creditCard.deleteOne();
        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.CARD_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/em/credit-card/{accountIndex}
* Fetch all credit cards for a specific bank account
*/
const fetchAllAccountCreditCards = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const creditCardData = await CreditCards.find({ userId: req.id, accountIndex }).sort({ccIndex: -1});
        const responseMessage = !creditCardData?.length ? RESPONSES.EXPENSE_MANAGER.NO_CARD_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, creditCardData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/em/credit-card-spendings/{ccIndex}/{accountIndex}
* Fetch all spendings of a specific credit card of a specific bank account
*/
const fetchAllCardCreditCardSpendings = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const ccIndex = Number(req.params.ccIndex);
        const accountIndex = Number(req.params.accountIndex);
        if(Number.isNaN(ccIndex) || Number.isNaN(accountIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const spendingData = await CreditCardSpendings.find({ userId: req.id, ccIndex, accountIndex });
        const responseMessage = !spendingData?.length ? RESPONSES.EXPENSE_MANAGER.NO_SPENDINGS_ADDED : RESPONSES.COMMON.SUCCESS;
        res.status(200).json({ message : responseMessage, spendingData });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/credit-card-spendings
* Add a spending under a specific credit card
*/
const addCreditCardSpending = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {accountIndex, ccIndex, categoryIndex, spendingData, nonce} = req.body;
        const accountIndexNumber = Number(accountIndex);
        const ccIndexNumber = Number(ccIndex);
        const categoryIndexNumber = Number(categoryIndex);

        if(Number.isNaN(accountIndexNumber) || Number.isNaN(ccIndexNumber) || Number.isNaN(categoryIndexNumber) || !spendingData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newSpending = new CreditCardSpendings({
            userId: req.id,
            accountIndex: accountIndexNumber,
            ccIndex: ccIndexNumber,
            categoryIndex: categoryIndexNumber,
            spendingData,
            nonce
        });
        await newSpending.save();

        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.SPENDING_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/em/credit-card-spendings/{spendingId}
* Delete credit card spending of a specific credit card
*/
const deleteCreditCardSpending = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const spendingId = req.params.spendingId;
        if(!spendingId){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedSpending = await CreditCardSpendings.findOneAndDelete({ _id: spendingId, userId: req.id });
        if(!deletedSpending){
            return res.status(404).json({ message : RESPONSES.EXPENSE_MANAGER.SPENDING_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.EXPENSE_MANAGER.SPENDING_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/credit-card/pay-bill
* Pay the credit card bill by marking those spendings as paid and add expenses for them under a tracker
*/
const payCreditCardBill = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {spendingIDs, expenses, accountData, accountNonce} = req.body;
        if(!Array.isArray(spendingIDs) || !Array.isArray(expenses) || !spendingIDs?.length || !expenses?.length || !accountData?.length || !accountNonce?.length || spendingIDs.length !== expenses.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const formattedExpenses = [];
        for(const expense of expenses){
            const { accountIndex, trackerIndex, categoryIndex, expenseData, nonce } = expense;
            const accountIndexNumber = Number(accountIndex);
            const trackerIndexNumber = Number(trackerIndex);
            const categoryIndexNumber = Number(categoryIndex);

            if(Number.isNaN(accountIndexNumber) || Number.isNaN(trackerIndexNumber) || Number.isNaN(categoryIndexNumber) || !expenseData?.length || !nonce?.length){
                return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
            }

            formattedExpenses.push({
                userId: req.id,
                accountIndex: accountIndexNumber,
                trackerIndex: trackerIndexNumber,
                categoryIndex: categoryIndexNumber,
                expenseData,
                nonce
            });
        }

        const isAccountUpdated = await updateBankAccount(req.id, accountData, Number(expenses[0].accountIndex), accountNonce);
        if(!isAccountUpdated){
            return res.status(500).json({ message: RESPONSES.ACCOUNTS_LAYER.ERROR_UPDATING_BALANCE });
        }

        await Expenses.insertMany(formattedExpenses);

        await CreditCardSpendings.updateMany({
                _id: { $in: spendingIDs }
            }, {
                $set: { paymentDue: false }
            }
        );

        res.status(200).json({ message: RESPONSES.EXPENSE_MANAGER.BILL_PAID });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/em/
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
* POST /api/em/
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
    fetchAllAccountTrackers,
    fetchAllTrackerExpenses,
    fetchAllUserCategories,
    addIncomeTracker,
    deleteIncomeTracker,
    addExpense,
    addMultipleExpenses,
    deleteExpense,
    transferExpenses,
    updateExpenseCategories,
    updateExpenseLimits,
    addNewCreditCard,
    updateCreditCardsDetails,
    deleteCreditCard,
    fetchAllAccountCreditCards,
    fetchAllCardCreditCardSpendings,
    addCreditCardSpending,
    deleteCreditCardSpending,
    payCreditCardBill
};
