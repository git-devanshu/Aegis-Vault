const mongoose = require('mongoose');

const passwordLabelSchema = new mongoose.Schema({
    userId : {type : mongoose.Schema.Types.ObjectId, required : true, unique : true},
    labelList : {type : String, required : true},
    labelNonce : {type : String, required : true}
});

const PasswordLabels = mongoose.model('passwordLabels', passwordLabelSchema, 'passwordLabels');

module.exports = {PasswordLabels};

/*

labelList is encrypted stringified array of label names

Removed label names start with *~Rem*

*/
