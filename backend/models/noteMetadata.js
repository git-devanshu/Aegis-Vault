const mongoose = require('mongoose');

const noteMetadataSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true},
    metadataData : {type : String, required : true},
    nonce : {type : String, required : true}
});

const NoteMetadata = mongoose.model('noteMetadata', noteMetadataSchema, 'noteMetadata');

module.exports = {NoteMetadata};

/*

metadataData :

[
    {
        title,
        priority,
        tag,
        color,
        noteKey
    }
]

*/