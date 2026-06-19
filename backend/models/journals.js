const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    journalKey : {type : String, required : true},
    journalData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const Journals = mongoose.model('journals', journalSchema, 'journals');

module.exports = {Journals};

/*

journalData is encrypted string for the journal note

*/