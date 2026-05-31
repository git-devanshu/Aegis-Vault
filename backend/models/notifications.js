const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},

    notificationData : {type : String, required : true},

    nonce : {type : String, required : true},

    viewed : {type : Boolean, required : true}
});

const Notifications = mongoose.model('notifications', notificationSchema, 'notifications');

module.exports = {Notifications};

/*

notificationData {
    message,
    date,
    time
}

This object is stringified and then encrypted on client side

*/