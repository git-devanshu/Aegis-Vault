const mongoose = require('mongoose');

const weeklyScheduleSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},

    mondayScheduleData : {type : String, required : true},
    mondayNonce : {type : String, required : true},

    tuesdayScheduleData : {type : String, required : true},
    tuesdayNonce : {type : String, required : true},

    wednesdayScheduleData : {type : String, required : true},
    wednesdayNonce : {type : String, required : true},

    thursdayScheduleData : {type : String, required : true},
    thursdayNonce : {type : String, required : true},

    fridayScheduleData : {type : String, required : true},
    fridayNonce : {type : String, required : true},

    saturdayScheduleData : {type : String, required : true},
    saturdayNonce : {type : String, required : true},

    sundayScheduleData : {type : String, required : true},
    sundayNonce : {type : String, required : true}
});

const WeeklySchedules = mongoose.model('weeklySchedules', weeklyScheduleSchema, 'weeklySchedules');

module.exports = {WeeklySchedules};

/*

scheduleData :

[
    {
        title,
        startTime,
        endTime
    }
]

*/