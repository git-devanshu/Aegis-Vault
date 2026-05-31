/* Import RESPONSES */
const enResponses = require('../constants/en/responses.json');


const LANGUAGE_FILES = {
    en:{
        RESPONSES: enResponses
    }
};

function getLanguageConstants(language='en') {
    return (LANGUAGE_FILES[language] || LANGUAGE_FILES.en);
}

module.exports = {
    getLanguageConstants
};