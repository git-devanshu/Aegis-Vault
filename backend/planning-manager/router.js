const express = require('express');
const { fetchPlannerCollections, fetchJournalMetadata, fetchNoteMetadata, fetchWeeklySchedule, fetchTasksByDate, updatePlannerCollection } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/pl
const plRouter = express.Router();

plRouter.get('/collections', checkAuthorization, fetchPlannerCollections);
plRouter.get('/journal-metadata', checkAuthorization, fetchJournalMetadata);
plRouter.get('/note-metadata', checkAuthorization, fetchNoteMetadata);
plRouter.get('/weekly-schedule', checkAuthorization, fetchWeeklySchedule);
plRouter.get('/tasks/:taskDate', checkAuthorization, fetchTasksByDate);

plRouter.put('/collections', checkAuthorization, updatePlannerCollection);

// plRouter.post('/', checkAuthorization, );
// plRouter.delete('/', checkAuthorization, );

// plRouter.get('/', checkAuthorization, );
// plRouter.post('/', checkAuthorization, );
// plRouter.put('/', checkAuthorization, );
// plRouter.delete('/', checkAuthorization, );

// plRouter.get('/', checkAuthorization, );
// plRouter.post('/', checkAuthorization, );
// plRouter.put('/', checkAuthorization, );
// plRouter.delete('/', checkAuthorization, );


module.exports = {plRouter};
