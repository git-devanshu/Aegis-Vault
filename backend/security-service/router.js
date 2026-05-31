const express = require('express');
const { checkEmailAvailability, registerNewUser, getUserSaltFromEmail, loginUser, fetchAllUserSessions, terminateSession, terminateAllOtherSessions, generateNewPassKey, verifySecurityPin } = require('./controller');
const { checkAuthorization } = require('../middlewares/checkAuthorization');

// endpoint prefix : /api/ss
const ssRouter = express.Router();

ssRouter.get('/email-exists/:email', checkEmailAvailability);
ssRouter.post('/signup', registerNewUser);

ssRouter.get('/get-user-salt/:email', getUserSaltFromEmail);
ssRouter.post('/login', loginUser);

ssRouter.post('/verify-pin', checkAuthorization, verifySecurityPin);

ssRouter.get('/all-sessions', checkAuthorization, fetchAllUserSessions);
ssRouter.delete('/user-session/:sessionId', checkAuthorization, terminateSession);
ssRouter.delete('/all-sessions', checkAuthorization, terminateAllOtherSessions);

ssRouter.post('/new-passkey', checkAuthorization, generateNewPassKey);

module.exports = {ssRouter};