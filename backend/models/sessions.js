const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    device : {type : String, required : true},
    deviceType : {type : String, required : true},
    deviceLocation: {type : String, required : true},
    coordinates: {type : Array, required : false},
    createdAt : {type : Date, required : true},
    lastSeenAt : {type : Date, required : true}
});

const Sessions = mongoose.model('sessions', sessionSchema, 'sessions');

module.exports = {Sessions};

/*

{device} is Browser on OS
{deviceType} is mobile/desktop

*/
