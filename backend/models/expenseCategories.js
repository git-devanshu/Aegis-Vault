const mongoose = require('mongoose');

const expenseCategorySchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    categoryData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const ExpenseCategories = mongoose.model('expenseCategories', expenseCategorySchema, 'expenseCategories');

module.exports = {ExpenseCategories};

/*

categoryData [
    {
        name,
        icon,
        categoryIndex
    }
]

This array is stringified and then encrypted on client side

*/
