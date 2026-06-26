const jwt = require('jsonwebtoken');
const { Users } = require('../models/users');
const { Sessions } = require('../models/sessions');
const { getLanguageConstants } = require('../utility/language');

require('dotenv').config();

const checkAuthorization = async(req, res, next) =>{
    const {RESPONSES} = getLanguageConstants(req.headers['x-aegis-language']);
    const token = req.headers.authorization;

    if(!token){
        return res.status(401).json({ message : RESPONSES.AUTH.UNAUTHORIZED, relogin: true });
    }

    try{
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        if(!decoded.id || !decoded.email || !decoded.name){
            return res.status(401).json({ message : RESPONSES.AUTH.UNAUTHORIZED, relogin: true });
        }
        req.id = decoded.id;
        req.email = decoded.email;
        req.name = decoded.name;
        req.privilege = decoded.privilege || 'user';
        req.lang = req.headers['x-aegis-language'];
        req.sessionId = decoded.sessionId;

        const currentSession = await Sessions.findById(decoded.sessionId);
        if(!currentSession) {
            return res.status(404).json({ message : RESPONSES.AUTH.SESSION_EXPIRED, relogin: true });
        }

        if(currentSession.userId.toString() !== req.id){
            return res.status(401).json({ message : RESPONSES.AUTH.UNAUTHORIZED, relogin: true });
        }

        const existingUser = await Users.findById(req.id).lean();
        if(!existingUser?.isActive){
            return res.status(401).json({ message : RESPONSES.AUTH.ACCOUNT_DISABLED, relogin: true });
        }

        currentSession.lastSeenAt = new Date();
        await currentSession.save();

        next();
    }
    catch(error){
        res.status(401).json({ message : RESPONSES.AUTH.SESSION_EXPIRED, relogin: true });
    }
}

module.exports = {checkAuthorization};
