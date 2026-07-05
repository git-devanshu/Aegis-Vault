/* Import RESPONSES */
const deResponses = require('../constants/de/responses.json');
const enResponses = require('../constants/en/responses.json');
const esResponses = require('../constants/es/responses.json');
const frResponses = require('../constants/fr/responses.json');
const hiResponses = require('../constants/hi/responses.json');
const jaResponses = require('../constants/ja/responses.json');
const ruResponses = require('../constants/ru/responses.json');
const zhResponses = require('../constants/zh/responses.json');


const LANGUAGE_FILES = {
    de: { RESPONSES: deResponses }, 
    en: { RESPONSES: enResponses }, 
    es: { RESPONSES: esResponses }, 
    fr: { RESPONSES: frResponses }, 
    hi: { RESPONSES: hiResponses }, 
    ja: { RESPONSES: jaResponses }, 
    ru: { RESPONSES: ruResponses }, 
    zh: { RESPONSES: zhResponses }
};

function getLanguageConstants(language='en') {
    return (LANGUAGE_FILES[language] || LANGUAGE_FILES.en);
}

module.exports = {
    getLanguageConstants
};