const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    hideRemovedLabels : {type : Boolean, default : false},
    hideShowPasswordButton : {type : Boolean, default : false},
    disablePasswordModifications : {type : Boolean, default : false},
    allowBankAccountDeletion : {type : Boolean, default : false},
    allowIncomeTrackerDeletion : {type : Boolean, default : true},
    allowExpenseDeletion : {type : Boolean, default : true},
    allowNewCategoryCreation : {type : Boolean, default : true},
    hideAccountSnapshotInAnalytics : {type : Boolean, default : false},
});

const Settings = mongoose.model('settings', settingsSchema, 'settings');

module.exports = {Settings};