const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    hideRemovedLabels : {type : Boolean, default : false},
    hideShowPasswordButton : {type : Boolean, default : false},
    disablePasswordModifications : {type : Boolean, default : false},
    hideDeleteExpenseButton : {type : Boolean, default : false},
    hideInvestments : {type : Boolean, default : false},
    getEmailNotifications : {type : Boolean, default : false}
});

const Settings = mongoose.model('settings', settingsSchema, 'settings');

module.exports = {Settings};