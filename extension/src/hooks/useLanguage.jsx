import { useMemo } from 'react';


/* DISPLAY constants */
import enDisplay from '../constants/en/display.json';


/* TOASTS constants */
import enResponses from '../constants/en/responses.json';



const LANGUAGE_FILES = {
    en:{
        DISPLAY: enDisplay,
        RESPONSES: enResponses
    }
};

/* For usage in .jsx files */
export default function useLanguage() {
    const language = localStorage.getItem('aegis-language') || 'en';

    return useMemo(()=>{
        return LANGUAGE_FILES[language] || LANGUAGE_FILES.en;
    }, [language]);
}

/* For usage in .js files */
export function getLanguageConstants() {
    const language = localStorage.getItem('aegis-language') || 'en';
    return (LANGUAGE_FILES[language] || LANGUAGE_FILES.en);
}

