const {Users} = require('../models/users');
const {Sessions} = require('../models/sessions');
const {Settings} = require('../models/settings');
const {PasswordLabels} = require('../models/passwordLabels');
const {PlannerCollections} = require('../models/plannerCollections');
const {WeeklySchedules} = require('../models/weeklySchedules');
const {JournalMetadata} = require('../models/journalMetadata');
const {NoteMetadata} = require('../models/noteMetadata');

const {getLanguageConstants} = require('../utility/language');
const {checkEmailExists, createNewUserSession} = require('./helper');

const geoip = require('geoip-lite');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

require('dotenv').config();

/*
* GET /api/ss/email-exists/{email}
* Checks if the email id is already is in use
* Returns true or false, toast messages should be handled on client side as per use
*/
const checkEmailAvailability = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const email = req.params.email;
        if(!email?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.FIELD_REQUIRED });
        }

        const exists = await checkEmailExists(email);
        res.status(200).json({ exists });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/ss/signup
* Register a new user with privilege 'user'
*/
const registerNewUser = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const { 
            email, name, 
            passwordHash, pinHash, userSalt, 
            passwordSalt, pinSalt, passwordNonce, pinNonce, pinEncryptedKey, passwordEncryptedKey, passKeyHash, 
            labelList, labelNonce,
            journalMetadata, journalNonce, noteMetadata, noteNonce, allCollectionsData, allCollectionsNonce, scheduleData, scheduleNonce, plannerCollectionTypes
        } = req.body;

        if(!email?.length || !name?.length || !passwordHash?.length || !pinHash?.length || !passwordEncryptedKey?.length || !pinEncryptedKey?.length || !passwordSalt?.length || !pinSalt?.length || !passwordNonce?.length || !pinNonce?.length || !passKeyHash?.length || !labelList?.length || !labelNonce?.length || !userSalt?.length || !journalMetadata?.length || !journalNonce?.length || !noteMetadata?.length || !noteNonce?.length || !allCollectionsData?.length || !allCollectionsNonce?.length || !scheduleData?.length || !scheduleNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.FIELD_REQUIRED });
        }

        if(await checkEmailExists(email)){
            return res.status(400).json({ message : RESPONSES.AUTH.EMAIL_EXISTS });
        }

        const newUser = await Users.create({
            email, name, passwordHash, pinHash, passwordSalt, pinSalt, passwordNonce, pinNonce, pinEncryptedKey, passwordEncryptedKey, passKeyHash, userSalt
        });

        const userSettings = new Settings({
            userId: newUser._id
        });
        await userSettings.save();

        const userPasswordLabels = new PasswordLabels({
            userId: newUser._id, labelList, labelNonce
        });
        await userPasswordLabels.save();

        const userJournalMetadata = new JournalMetadata({
            userId: newUser._id, metadataData: journalMetadata, nonce: journalNonce
        });
        await userJournalMetadata.save();

        const userNoteMetadata = new NoteMetadata({
            userId: newUser._id, metadataData: noteMetadata, nonce: noteNonce
        });
        await userNoteMetadata.save();
        
        await PlannerCollections.insertMany(
            plannerCollectionTypes.map(type =>({
                userId: newUser._id,
                type, collectionData: allCollectionsData, nonce: allCollectionsNonce
            }))
        );

        const userWeeklySchedule = new WeeklySchedules({
            userId: newUser._id,
            mondayScheduleData: scheduleData, mondayNonce: scheduleNonce,
            tuesdayScheduleData: scheduleData, tuesdayNonce: scheduleNonce,
            wednesdayScheduleData: scheduleData, wednesdayNonce: scheduleNonce,
            thursdayScheduleData: scheduleData, thursdayNonce: scheduleNonce,
            fridayScheduleData: scheduleData, fridayNonce: scheduleNonce,
            saturdayScheduleData: scheduleData, saturdayNonce: scheduleNonce,
            sundayScheduleData: scheduleData, sundayNonce: scheduleNonce
        });
        await userWeeklySchedule.save();
        
        res.status(201).json({ message : RESPONSES.AUTH.SIGNUP_SUCCESS });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/ss/get-user-salt/{email}
* Returns the userSalt for the user if the email exists
*/
const getUserSaltFromEmail = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const email = req.params.email;
        if(!email?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.FIELD_REQUIRED });
        }

        const existingUser = await Users.findOne({ email });
        if(!existingUser){
            return res.status(404).json({ message : RESPONSES.AUTH.USER_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.COMMON.SUCCESS, userSalt: existingUser.userSalt });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/ss/login
* Login to existing account, create session and return signed jwt
*/
const loginUser = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const { email, passwordHash, deviceType, device } = req.body;
        if(!email?.length || !passwordHash?.length || !device?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.FIELD_REQUIRED });
        }

        const existingUser = await Users.findOne({ email });
        if(!existingUser) {
            return res.status(400).json({ message : RESPONSES.AUTH.USER_NOT_FOUND });
        }

        if(!existingUser.isActive){
            return res.status(401).json({ message : RESPONSES.AUTH.ACCOUNT_DISABLED });
        }

        if(passwordHash !== existingUser.passwordHash){
            return res.status(401).json({ message : RESPONSES.AUTH.INVALID_CREDENTIALS });
        }

        const totalActiveSessions = await Sessions.countDocuments({ userId: req.id });
        if(totalActiveSessions >= 6){
            return res.status(403).json({ message: RESPONSES.AUTH.SESSION_LIMIT_REACHED });
        }

        /* Remove all similar sessions */
        await Sessions.deleteMany({
            userId:existingUser._id,
            device,
            deviceType
        });

        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        const geo = geoip.lookup(ip);
        const deviceLocation = geo ? `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}` : 'Unknown';
        const coordinates = geo?.ll || [0, 0];

        const token = await createNewUserSession(existingUser, deviceType, device, deviceLocation, coordinates);

        return res.status(200).json({ message : RESPONSES.AUTH.LOGIN_SUCCESS, token });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: POST /api/ss/verify-pin
* verify user's security pin and return keys and settings
*/
const verifySecurityPin = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const { pinHash } = req.body;
        if(!req.email?.length || !pinHash?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.FIELD_REQUIRED });
        }

        const existingUser = await Users.findOne({email: req.email});
        if(!existingUser){
            return res.status(404).json({ message : RESPONSES.AUTH.USER_NOT_FOUND });
        }

        if(pinHash !== existingUser.pinHash.toString()){
            return res.status(400).json({ message : RESPONSES.AUTH.INVALID_CREDENTIALS });
        }

        const pinEncryptedKey = existingUser.pinEncryptedKey;
        const pinSalt = existingUser.pinSalt;
        const pinNonce = existingUser.pinNonce;
        const newPassKeyGenerated = existingUser.newPassKeyGenerated;

        const userSettings = await Settings.findOne({ userId : req.id });
        if(!userSettings){
            return res.status(404).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message : RESPONSES.AUTH.PIN_VERIFIED, pinEncryptedKey, pinSalt, pinNonce, userSettings, newPassKeyGenerated });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: POST /api/ss/verify-passkey
* 
*/
// const verifyPassKey = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{
//         const { email, passKey } = req.body;
//         if(!email?.length || !passKey?.length){
//             return res.status(400).json({ message : "all fields are required" });
//         }

//         const existingUser = await Users.findOne({email});
//         if(!existingUser){
//             return res.status(404).json({ message : "user not found" });
//         }

//         const isMatch = await bcrypt.compareSync(passKey, existingUser.passKey);

//         if(!isMatch || existingUser.passKey === "0" || passKey === "0"){
//             return res.status(400).json({ message : "verification failed!" });
//         }

//         const pinEncryptedKey = existingUser.pinEncryptedKey;
//         const pinSalt = existingUser.pinSalt;
//         const pinNonce = existingUser.pinNonce;

//         res.status(200).json({ message : "verification successful", pinEncryptedKey, pinSalt, pinNonce });
//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* @P: POST /api/ss/verify-user
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* POST /api/ss/reset-password
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* @P: POST /api/ss/reset-pin
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* @P: POST /api/ss/new-passkey
* Save the newly created PassKey
*/
const generateNewPassKey = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {passKeyHash} = req.body;
        if(!passKeyHash?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedUser = await Users.findByIdAndUpdate(req.id, {passKeyHash, $inc: { newPassKeyGenerated: 1 }});
        if(!updatedUser){
            return res.status(404).json({ message : RESPONSES.AUTH.USER_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.AUTH.NEW_PASSKEY_GENERATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: GET /api/ss/all-sessions
* Fetches all the active sessions of a specific user
*/
const fetchAllUserSessions = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const allUserSessions = await Sessions.find({ userId: req.id });
        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, allUserSessions });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: DELETE /api/ss/all-sessions
* Terminate All user sessions except the current one
*/
const terminateAllOtherSessions = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        await Sessions.deleteMany({
            userId: req.id,
            _id: { $ne: req.sessionId }
        });

        res.status(200).json({ message:RESPONSES.AUTH.ALL_SESSIONS_TERMINATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: DELETE /api/ss/user-session/{sessionId}
* Terminate user session from sessionId, use the same for logout
* A user can terminate his own sessions only
*/
const terminateSession = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const sessionId = req.params.sessionId;
        if(!sessionId){
            return res.status(404).json({ message: RESPONSES.AUTH.SESSION_NOT_FOUND });
        }

        const currentSession = await Sessions.findById(sessionId);
        if(!currentSession){
            return res.status(404).json({ message: RESPONSES.AUTH.SESSION_NOT_FOUND });
        }

        if(currentSession.userId.toString() !== req.id){
            res.status(402).json({ message : RESPONSES.AUTH.UNAUTHORIZED });
        }

        await Sessions.findByIdAndDelete(sessionId);
        res.status(200).json({ message : RESPONSES.AUTH.LOGOUT_SUCCESSFUL });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/ss/
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* POST /api/ss/
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* POST /api/ss/
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


/*
* POST /api/ss/
* 
*/
// const  = async(req, res) =>{
//     const {RESPONSES} = getLanguageConstants(req.lang);
//     try{

//     }
//     catch(error){
//         console.log('Server error: ', error);
//         res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
//     }
// }


module.exports = {
    checkEmailAvailability,
    registerNewUser,
    getUserSaltFromEmail,
    loginUser,
    verifySecurityPin,
    fetchAllUserSessions,
    terminateSession,
    terminateAllOtherSessions,
    generateNewPassKey
};
