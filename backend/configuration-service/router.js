const express = require('express');
const { fetchUserSettings, saveUserSettings } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/config
const configRouter = express.Router();

configRouter.get('/settings', checkAuthorization, fetchUserSettings);
configRouter.post('/settings', checkAuthorization, saveUserSettings);

module.exports = {configRouter};
