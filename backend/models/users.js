const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email : {type : String, required : true, unique : true},
    name : {type : String, required : true},

    passwordHash : {type : String, required : true},
    pinHash : {type : String, required : true},
    passKeyHash : {type : String, default : '0'},
    userSalt : {type : String, required : true},

    passwordSalt : {type : String, required : true},
    pinSalt : {type : String, required : true},
    passwordNonce : {type : String, required : true},
    pinNonce : {type : String, required : true},
    passwordEncryptedKey : {type : String, required : true},
    pinEncryptedKey : {type : String, required : true},

    newPassKeyGenerated : {type : Number, default : 0},
    isActive : {type : Boolean, default : true},
    privilege : {type : String, default : 'user'}
});

const Users = mongoose.model('users', userSchema, 'users');

module.exports = {Users};


/*

{userSalt} is used for calculating the hash of security pin (pinHash) and password (passwordHash)

{passwordSalt} and {passwordNonce} are used for client side cryptography of master key using password

{pinSalt} and {pinNonce} are used for client side cryptography of master key using security pin

These salt and nonce are not used by server, they are sent to client for crypto processes on successful verifications

*/