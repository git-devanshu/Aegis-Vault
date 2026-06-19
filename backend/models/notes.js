const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    noteKey : {type : String, required : true},
    noteData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const Notes = mongoose.model('notes', noteSchema, 'notes');

module.exports = {Notes};

/*

noteData :

{
    data,
    updatedAt
}

*/