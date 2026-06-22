const express = require('express');
const { fetchPlannerCollections, fetchJournalMetadata, fetchNoteMetadata, fetchWeeklySchedule, fetchTasksByDate, updatePlannerCollection, updateWeeklySchedule, addTask, deleteTask, updateTask, addJournal, fetchJournal, updateJournal, deleteJournal, fetchNote, addNote, updateNote, deleteNote } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/pl
const plRouter = express.Router();

plRouter.get('/collections', checkAuthorization, fetchPlannerCollections);
plRouter.get('/journal-metadata', checkAuthorization, fetchJournalMetadata);
plRouter.get('/note-metadata', checkAuthorization, fetchNoteMetadata);
plRouter.get('/weekly-schedule', checkAuthorization, fetchWeeklySchedule);
plRouter.get('/tasks/:taskDate', checkAuthorization, fetchTasksByDate);

plRouter.put('/collections', checkAuthorization, updatePlannerCollection);
plRouter.put('/weekly-schedule', checkAuthorization, updateWeeklySchedule);

plRouter.post('/tasks', checkAuthorization, addTask);
plRouter.delete('/tasks/:id', checkAuthorization, deleteTask);
plRouter.put('/tasks', checkAuthorization, updateTask);

plRouter.get('/journal/:journalKey', checkAuthorization, fetchJournal);
plRouter.post('/journal', checkAuthorization, addJournal);
plRouter.put('/journal', checkAuthorization, updateJournal);
plRouter.delete('/journal/:journalKey', checkAuthorization, deleteJournal);

plRouter.get('/note/:noteKey', checkAuthorization, fetchNote);
plRouter.post('/note', checkAuthorization, addNote);
plRouter.put('/note', checkAuthorization, updateNote);
plRouter.delete('/note/:noteKey', checkAuthorization, deleteNote);


module.exports = {plRouter};
