const express = require('express');
const { fetchLabels, fetchPasswords, addPassword, updatePassword, deletePassword, updateLabels, fetchAllPasswords } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/pm
const pmRouter = express.Router();

pmRouter.get('/labels', checkAuthorization, fetchLabels);
pmRouter.get('/passwords/:labelIndex', checkAuthorization, fetchPasswords);

pmRouter.post('/passwords', checkAuthorization, addPassword);
pmRouter.put('/passwords', checkAuthorization, updatePassword);
pmRouter.delete('/passwords/:passwordId', checkAuthorization, deletePassword);

pmRouter.put('/labels', checkAuthorization, updateLabels);

pmRouter.get('/passwords', checkAuthorization, fetchAllPasswords);

module.exports = {pmRouter};
