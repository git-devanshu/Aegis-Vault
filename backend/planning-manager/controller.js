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
* PUT /api/pl/weekly-schedule
* Update the weekly schedule of a specific user
*/
const updateWeeklySchedule = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const { mondayScheduleData, mondayNonce, tuesdayScheduleData, tuesdayNonce, wednesdayScheduleData, wednesdayNonce, thursdayScheduleData, thursdayNonce, fridayScheduleData, fridayNonce, saturdayScheduleData, saturdayNonce, sundayScheduleData, sundayNonce } = req.body;

        if(!mondayScheduleData?.length || !mondayNonce?.length || !tuesdayScheduleData?.length || !tuesdayNonce?.length || !wednesdayScheduleData?.length || !wednesdayNonce?.length || !thursdayScheduleData?.length || !thursdayNonce?.length || !fridayScheduleData?.length || !fridayNonce?.length || !saturdayScheduleData?.length || !saturdayNonce?.length || !sundayScheduleData?.length || !sundayNonce?.length){
            return res.status(400).json({ message: RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedSchedule = await WeeklySchedules.findOneAndUpdate({ 
                userId: req.id 
            }, {
                mondayScheduleData, mondayNonce,
                tuesdayScheduleData, tuesdayNonce,
                wednesdayScheduleData, wednesdayNonce,
                thursdayScheduleData, thursdayNonce,
                fridayScheduleData, fridayNonce,
                saturdayScheduleData, saturdayNonce,
                sundayScheduleData, sundayNonce
            }, {
                new: true
            }
        );

        if(!updatedSchedule){
            return res.status(404).json({ message: RESPONSES.PLANNING_MANAGER.SCHEDULE_NOT_FOUND });
        }

        return res.status(200).json({ message: RESPONSES.PLANNING_MANAGER.SCHEDULE_UPDATED});
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/pl/tasks
* Add a new task in the calendar
*/
const addTask = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const { taskDate, taskMetadata, metadataNonce, taskDescription, descriptionNonce } = req.body;

        if(!taskDate?.length || !taskMetadata?.length || !metadataNonce?.length || !taskDescription?.length || !descriptionNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newTask = new Tasks({
            userId: req.id,
            taskDate,
            taskMetadata,
            metadataNonce,
            taskDescription,
            descriptionNonce
        });
        await newTask.save();

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.TASK_CREATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/pl/tasks/:id
* Delete a task from the calendar
*/
const deleteTask = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const id = req.params.id;
        if(!id?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedTask = await Tasks.findOneAndDelete({ _id: id, userId: req.id });
        if(!deletedTask){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.TASK_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.TASK_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/pl/tasks
* Update the task
*/
const updateTask = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const { id, taskDate, taskMetadata, metadataNonce, taskDescription, descriptionNonce } = req.body;
        if(!id?.length || !taskDate?.length || !taskMetadata?.length || !metadataNonce?.length || !taskDescription?.length || !descriptionNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedTask = await Tasks.findOneAndUpdate({
            _id: id,
            userId: req.id
        }, {
            taskDate,
            taskMetadata,
            metadataNonce,
            taskDescription,
            descriptionNonce
        });
        if(!updatedTask){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.TASK_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.TASK_COMPLETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/pl/journal
* Add new journal, update the metadata and create new journal
*/
const addJournal = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {journalKey, journalData, nonce, metadataData, metadataNonce} = req.body;
        if(!journalKey?.length || !journalData?.length || !nonce?.length || !metadataData?.length || !metadataNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedJournalMetadata = await JournalMetadata.findOneAndUpdate({ userId: req.id }, {
            metadataData,
            nonce: metadataNonce
        });

        if(!updatedJournalMetadata){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newJournal = new Journals({
            userId: req.id,
            journalKey,
            journalData,
            nonce
        });
        await newJournal.save();

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.JOURNAL_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/pl/journal
* Update the journal data, no need to update the metadata
*/
const updateJournal = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {journalKey, journalData, nonce} = req.body;
        if(!journalKey?.length || !journalData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedJournalData = await Journals.findOneAndUpdate({ userId: req.id, journalKey }, {
            journalData, nonce
        });

        if(!updatedJournalData){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.JOURNAL_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.JOURNAL_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/pl/journal/:journalKey
* Delete the journal and update the metadata as well
*/
const deleteJournal = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const journalKey = req.params.journalKey;
        const {metadataData, nonce} = req.body;

        if(!journalKey?.length || !metadataData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedJournal = await Journals.findOneAndDelete({ userId: req.id, journalKey });
        if(!deletedJournal){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.JOURNAL_NOT_FOUND });
        }

        const updatedJournalMetadata = await JournalMetadata.findOneAndUpdate({ userId: req.id }, {
            metadataData,
            nonce
        });

        if(!updatedJournalMetadata){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.JOURNAL_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/pl/journal/:journalKey
* Fetch the journal data for a specific journalKey
*/
const fetchJournal = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const journalKey = req.params.journalKey;
        if(!journalKey?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const journal = await Journals.findOne({ userId: req.id, journalKey });

        if(!journal){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.JOURNAL_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.COMMON.SUCCESS, journal });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* POST /api/pl/note
* Add new note, update the metadata and create new note
*/
const addNote = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {noteKey, noteData, nonce, metadataData, metadataNonce} = req.body;
        if(!noteKey?.length || !noteData?.length || !nonce?.length || !metadataData?.length || !metadataNonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedNoteMetadata = await NoteMetadata.findOneAndUpdate({ userId: req.id }, {
            metadataData,
            nonce: metadataNonce
        });

        if(!updatedNoteMetadata){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const newNote = new Notes({
            userId: req.id,
            noteKey,
            noteData,
            nonce
        });
        await newNote.save();

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.NOTE_ADDED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* PUT /api/pl/note
* Update the note data, no need to update the metadata
*/
const updateNote = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const {noteKey, noteData, nonce, metadataData, metadataNonce} = req.body;
        if(!noteKey?.length || !noteData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const updatedNoteData = await Notes.findOneAndUpdate({ userId: req.id, noteKey }, {
            noteData,
            nonce
        });

        if(!updatedNoteData){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.NOTE_NOT_FOUND });
        }

        const updatedNoteMetadata = await NoteMetadata.findOneAndUpdate({ userId: req.id }, {
            metadataData,
            nonce: metadataNonce
        });

        if(!updatedNoteMetadata){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.NOTE_UPDATED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* DELETE /api/pl/note/:noteKey
* Delete the note and update the metadata as well
*/
const deleteNote = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const noteKey = req.params.noteKey;
        const {metadataData, nonce} = req.body;

        if(!noteKey?.length || !metadataData?.length || !nonce?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const deletedNote = await Notes.findOneAndDelete({ userId: req.id, noteKey });
        if(!deletedNote){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.NOTE_NOT_FOUND });
        }

        const updatedNoteMetadata = await NoteMetadata.findOneAndUpdate({ userId: req.id }, {
            metadataData,
            nonce
        });

        if(!updatedNoteMetadata){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        res.status(200).json({ message : RESPONSES.PLANNING_MANAGER.NOTE_DELETED });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


/*
* GET /api/pl/note/:noteKey
* Fetch the note data for a specific noteKey
*/
const fetchNote = async(req, res) =>{
    const {RESPONSES} = getLanguageConstants(req.lang);
    try{
        const noteKey = req.params.noteKey;
        if(!noteKey?.length){
            return res.status(400).json({ message : RESPONSES.COMMON.UNEXPECTED_ERROR });
        }

        const note = await Notes.findOne({ userId: req.id, noteKey });

        if(!note){
            return res.status(404).json({ message : RESPONSES.PLANNING_MANAGER.NOTE_NOT_FOUND });
        }

        res.status(200).json({ message : RESPONSES.COMMON.SUCCESS, note });
    }
    catch(error){
        console.log('Server error: ', error);
        res.status(500).json({ message : RESPONSES.COMMON.SERVER_ERROR });
    }
}


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
    updatePlannerCollection,
    updateWeeklySchedule,
    addTask,
    deleteTask,
    updateTask,
    addJournal,
    updateJournal,
    deleteJournal,
    fetchJournal,
    addNote,
    updateNote,
    deleteNote,
    fetchNote
};