import { useMemo } from 'react';
import ReactCountryFlag from 'react-country-flag';
import SYSTEM_DATA from '../assets/system-data.json';


/* DISPLAY constants */
import enDisplay from '../constants/en/display.json';


/* TOASTS constants */
import enToasts from '../constants/en/toasts.json';



const LANGUAGE_FILES = {
    en:{
        DISPLAY: enDisplay,
        TOASTS: enToasts
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


/* Get the flag for selected language */
export function getLanguageIcon(language) {
    let countryCode = 'GB';

    switch(language){
        case 'hi': countryCode = 'IN'; break;
        case 'ru': countryCode = 'RU'; break;
        case 'zh': countryCode = 'CN'; break;
        case 'ja': countryCode = 'JP'; break;
        case 'de': countryCode = 'DE'; break;
        case 'fr': countryCode = 'FR'; break;
        case 'es': countryCode = 'ES'; break;
    }

    return (
        <div style={{ width:'20px', height:'20px', borderRadius:'50%', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <ReactCountryFlag countryCode={countryCode} svg style={{width:'28px', height:'28px'}} />
        </div>
    );
}

/* Set Language */
export function setLanguage(language) {
    localStorage.setItem('aegis-language', language);
}

/* Get selected name */
export function getLanguageName(code){
    return SYSTEM_DATA.SUPPORTED_LANGUAGES.find(lang => lang.code === code) ?.name || 'Unknown';
}
