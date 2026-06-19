const {Passwords} = require('../models/passwords');
const {PasswordLabels} = require('../models/passwordLabels');
const {getLanguageConstants} = require('../utility/language');

require('dotenv').config();


/*
* @P: GET /api/pm/passwords/{labelIndex}
* Fetch the passwords of a specific label index for a specific user
*/
const fetchPasswords = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const labelIndex = Number(req.params.labelIndex);
        if(Number.isNaN(labelIndex)){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }
        
        const dataArray = await Passwords.find({ userId: req.id, labelIndex });
        const responseMessage = dataArray?.length ? RESPONSES.COMMON.SUCCESS : RESPONSES.PASSWORD_MANAGER.NO_PASSWORD_ADDED;
        res.status(200).json({ message : responseMessage, dataArray });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: GET /api/pm/labels
* Fetch the password labels of a user
*/
const fetchLabels = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const userLabels = await PasswordLabels.findOne({ userId: req.id });
        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, userLabels });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: POST /api/pm/passwords
* Add a new password
*/
const addPassword = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {passwordData, labelIndex, nonce} = req.body;
        if(!passwordData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newPassword = new Passwords({
            userId: req.id,
            passwordData,
            labelIndex,
            nonce
        });
        await newPassword.save();
        res.status(200).json({ message: RESPONSES.PASSWORD_MANAGER.PASSWORD_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: PUT /api/pm/passwords
* Update existing password
*/
const updatePassword = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {id, passwordData, labelIndex, nonce} = req.body;
        if(!id?.length || !passwordData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedPassword = await Passwords.findOneAndUpdate({_id: id, userId: req.id}, {passwordData, labelIndex, nonce});
        if(!updatedPassword){
            return res.status(404).json({ message : RESPONSES.PASSWORD_MANAGER.PASSWORD_NOT_FOUND });
        }

        res.status(200).json({ message: RESPONSES.PASSWORD_MANAGER.PASSWORD_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: DELETE /api/pm/passwords/{passwordId}
* Delete existing password
*/
const deletePassword = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const passwordId = req.params.passwordId;
        if(!passwordId?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedPassword = await Passwords.findOneAndDelete({ _id: passwordId, userId: req.id });
        if(!deletedPassword){
            return res.status(404).json({ message : RESPONSES.PASSWORD_MANAGER.PASSWORD_NOT_FOUND });
        }

        res.status(200).json({ message: RESPONSES.PASSWORD_MANAGER.PASSWORD_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: PUT /api/pm/labels
* update the labels list (use when the labels array is updated)
*/
const updateLabels = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {labelList, labelNonce} = req.body;
        if(!labelList?.length || !labelNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedLabels = await PasswordLabels.findOneAndUpdate({userId: req.id}, {labelList, labelNonce});
        if(!updatedLabels){
            return res.status(404).json({ message : RESPONSES.PASSWORD_MANAGER.LABELS_NOT_FOUND });
        }
        
        res.status(200).json({ message : RESPONSES.PASSWORD_MANAGER.LABELS_LIST_UPDATED })
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: POST /api/pm
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
    fetchLabels,
    fetchPasswords,
    addPassword,
    updatePassword,
    deletePassword,
    updateLabels
};