const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    taskDate : {type : String, required : true},
    taskMetadata : {type : String, required : true},
    metadataNonce : {type : String, required : true},
    taskDescription : {type : String, required : true},
    descriptionNonce : {type : String, required : true}
});

const Tasks = mongoose.model('tasks', taskSchema, 'tasks');

module.exports = {Tasks};

/*

taskDate : YYYY-MM-DD

taskMetadata :
{
    name,
    startTime,
    endTime,
    priority,
    checked
}

taskDescription :
{
    description
}

*/