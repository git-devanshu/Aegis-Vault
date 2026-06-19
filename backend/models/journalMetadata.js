const mongoose = require('mongoose');

const journalMetadataSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    metadataData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const JournalMetadata = mongoose.model('journalMetadata', journalMetadataSchema, 'journalMetadata');

module.exports = {JournalMetadata};

/*

metadataData :

[
    {
        date,
        journalKey
    }
]

*/