const {Users} = require('../models/users');
const {Sessions} = require('../models/sessions');
const {Settings} = require('../models/settings');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();


const checkEmailExists = async(email) => {
    const existingUser = await Users.findOne({ email });
    if(existingUser) {
        return true;
    }
    return false;
}


const createNewUserSession = async(existingUser, deviceType, device, deviceLocation, coordinates) => {
    const newSession = await Sessions.create({
        userId : existingUser._id,
        deviceType,
        device,
        deviceLocation,
        coordinates,
        createdAt : new Date(),
        lastSeenAt : new Date()
    });

    const tokenPayload = {
        id : existingUser._id,
        email : existingUser.email,
        name : existingUser.name,
        privilege : existingUser.privilege,
        sessionId : newSession._id
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn : '30d' });
    return token;
}


module.exports = {
    checkEmailExists,
    createNewUserSession
};