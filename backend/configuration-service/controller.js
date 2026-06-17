const {Users} = require('../models/users');
const {Settings} = require('../models/settings');
const {getLanguageConstants} = require('../utility/language');

require('dotenv').config();


/*
* @P: GET /api/config/settings
* Fetch user settings
*/
const fetchUserSettings = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const existingUser = await Users.findById(req.id);
        if(!existingUser){
            return res.status(404).json({ message : RESPONSES.AUTH.USER_NOT_FOUND });
        }

        const userSettings = await Settings.findOne({ userId : req.id });
        if(!userSettings){
            return res.status(404).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const userSalt = existingUser.userSalt;
        res.status(200).json({ message : RESPONSES.COMMON.SUCCESS, userSettings, userSalt });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* @P: POST /api/config/settings
* Save user settings
*/
const saveUserSettings = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {
            passwordHash,
            hideRemovedLabels, hideShowPasswordButton, disablePasswordModifications,
            allowBankAccountDeletion, 
            allowIncomeTrackerDeletion, allowExpenseDeletion, allowNewCategoryCreation, hideAccountSnapshotInAnalytics,
            hideAccountBalanceInCard, allowFDDeletion, allowRDDeletion, allowGoldAssetDeletion, allowStockDeletion, hideClosedFD, hideClosedRD, hideSoldGoldAssets, hideSoldStocks
        } = req.body;

        if(
            hideRemovedLabels === null || hideShowPasswordButton === null || disablePasswordModifications === null ||
            allowBankAccountDeletion === null ||
            allowIncomeTrackerDeletion === null || allowExpenseDeletion === null || allowNewCategoryCreation === null || hideAccountSnapshotInAnalytics === null ||
            hideAccountBalanceInCard === null || allowFDDeletion === null || allowRDDeletion === null || allowGoldAssetDeletion === null || allowStockDeletion === null || hideClosedFD === null || hideClosedRD === null || hideSoldGoldAssets === null || hideSoldStocks === null 
        ){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const existingUser = await Users.findById(req.id);
        if(!existingUser){
            return res.status(404).json({ message : RESPONSES.AUTH.USER_NOT_FOUND });
        }

        if(existingUser.passwordHash !== passwordHash){
            return res.status(401).json({ message : RESPONSES.AUTH.INVALID_CREDENTIALS });
        }

        const updatedSettings = await Settings.findOneAndUpdate({
                userId: req.id
            }, {
                hideRemovedLabels, hideShowPasswordButton, disablePasswordModifications,
                allowBankAccountDeletion, 
                allowIncomeTrackerDeletion, allowExpenseDeletion, allowNewCategoryCreation, hideAccountSnapshotInAnalytics,
                hideAccountBalanceInCard, allowFDDeletion, allowRDDeletion, allowGoldAssetDeletion, allowStockDeletion, hideClosedFD, hideClosedRD, hideSoldGoldAssets, hideSoldStocks
            }
        );

        if(!updatedSettings){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message : RESPONSES.CONFIG.SETTINGS_SAVED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/config/
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
    fetchUserSettings,
    saveUserSettings
};
