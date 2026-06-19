const {Users} = require('../models/users');
const {PlannerCollections} = require('../models/plannerCollections');
const {Tasks} = require('../models/tasks');
const {WeeklySchedules} = require('../models/weeklySchedules');
const {JournalMetadata} = require('../models/journalMetadata');
const {Journals} = require('../models/journals');
const {NoteMetadata} = require('../models/noteMetadata');
const {Notes} = require('../models/notes');
const {getLanguageConstants} = require('../utility/language');

require('dotenv').config();


/*
* GET /api/pl/collections
* Fetch all planner collections of a specific user
*/
const fetchPlannerCollections = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const collections = await PlannerCollections.find({ userId : req.id });
        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, collections });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/pl/journal-metadata
* Fetch journal metadata of a specific user
*/
const fetchJournalMetadata = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const metadata = await JournalMetadata.findOne({ userId : req.id });
        if(!metadata){
            return res.status(404).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, metadata });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/pl/note-metadata
* Fetch note metadata of a specific user
*/
const fetchNoteMetadata = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const metadata = await NoteMetadata.findOne({ userId : req.id });
        if(!metadata){
            return res.status(404).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, metadata });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/pl/weekly-schedule
* Fetch weekly schedule of a specific user
*/
const fetchWeeklySchedule = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const schedule = await WeeklySchedules.findOne({ userId : req.id });
        if(!schedule){
            return res.status(404).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, schedule });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/pl/tasks/:taskDate
* Fetch all tasks of a specific date
*/
const fetchTasksByDate = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const taskDate = req.params.taskDate;
        if(!taskDate?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const tasks = await Tasks.find({ userId : req.id, taskDate });
        res.status(200).json({ message: RESPONSES.COMMON.SUCCESS, tasks });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/pl/collections
* Update the data in specific planner collection based on type
*/
const updatePlannerCollection = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {type, collectionData, nonce} = req.body;
        if(!type || !collectionData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedCollection = await PlannerCollections.findOneAndUpdate({ userId: req.id, type }, {
                collectionData,
                nonce
            }
        );
        if(!updatedCollection){
            return res.status(404).json({ message : RESPONSES.COMMON.COLLECTION_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.CONFIG.COLLECTION_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/pl
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
* @P: POST /api/pl
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
* @P: POST /api/pl
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
    fetchPlannerCollections,
    fetchJournalMetadata,
    fetchNoteMetadata,
    fetchWeeklySchedule,
    fetchTasksByDate,
    updatePlannerCollection
};