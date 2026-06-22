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
    hideAccountSnapshotInAnalytics : {type : Boolean, default : false},
    hideAccountBalanceInCard : {type : Boolean, default : false},
    allowFDDeletion : {type : Boolean, default : true},
    allowRDDeletion : {type : Boolean, default : true},
    allowGoldAssetDeletion : {type : Boolean, default : true},
    allowStockDeletion : {type : Boolean, default : true},
    hideClosedFD : {type : Boolean, default : false},
    hideClosedRD : {type : Boolean, default : false},
    hideSoldGoldAssets : {type : Boolean, default : false},
    hideSoldStocks : {type : Boolean, default : false},
    disableShoppingListModifications : {type : Boolean, default : false},
    disableFoodListModifications : {type : Boolean, default : false},
    disableWatchlistModifications : {type : Boolean, default : false},
    disableReadingListModifications : {type : Boolean, default : false},
    disableWishlistModifications : {type : Boolean, default : false},
    disableTodoListModifications : {type : Boolean, default : false},
    disableTripListModifications : {type : Boolean, default : false},
    disableNotepadModifications : {type : Boolean, default : false},
    use12HourClockInSchedule : {type : Boolean, default : false},
    disableJournalModifications : {type : Boolean, default : false},
    hideWeeklyScheduleItems : {type : Boolean, default : false},
    hideHighPriorityTasks : {type : Boolean, default : false},
    hideCompletedTasks : {type : Boolean, default : false},
    hideHighPriorityNotes : {type : Boolean, default : false},
    disableNoteModifications : {type : Boolean, default : false}
});

const Settings = mongoose.model('settings', settingsSchema, 'settings');

module.exports = {Settings};