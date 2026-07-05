import { useMemo } from 'react';
import ReactCountryFlag from 'react-country-flag';
import SYSTEM_DATA from '../assets/system-data.json';


/* DISPLAY constants */
import deDisplay from '../constants/de/display.json';
import enDisplay from '../constants/en/display.json';
import esDisplay from '../constants/es/display.json';
import frDisplay from '../constants/fr/display.json';
import hiDisplay from '../constants/hi/display.json';
import jaDisplay from '../constants/ja/display.json';
import ruDisplay from '../constants/ru/display.json';
import zhDisplay from '../constants/zh/display.json';


/* TOASTS constants */
import deToasts from '../constants/de/toasts.json';
import enToasts from '../constants/en/toasts.json';
import esToasts from '../constants/es/toasts.json';
import frToasts from '../constants/fr/toasts.json';
import hiToasts from '../constants/hi/toasts.json';
import jaToasts from '../constants/ja/toasts.json';
import ruToasts from '../constants/ru/toasts.json';
import zhToasts from '../constants/zh/toasts.json';



const LANGUAGE_FILES = {
    de: {
        DISPLAY: deDisplay,
        TOASTS: deToasts
    },
    en: {
        DISPLAY: enDisplay,
        TOASTS: enToasts
    },
    es: {
        DISPLAY: esDisplay,
        TOASTS: esToasts
    },
    fr: {
        DISPLAY: frDisplay,
        TOASTS: frToasts
    },
    hi: {
        DISPLAY: hiDisplay,
        TOASTS: hiToasts
    },
    ja: {
        DISPLAY: jaDisplay,
        TOASTS: jaToasts
    },
    ru: {
        DISPLAY: ruDisplay,
        TOASTS: ruToasts
    },
    zh: {
        DISPLAY: zhDisplay,
        TOASTS: zhToasts
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
export function setLanguage(code) {
    localStorage.setItem('aegis-language', code);
}

/* Get selected name */
export function getLanguageName(code){
    return SYSTEM_DATA.SUPPORTED_LANGUAGES.find(lang => lang.code === code) ?.name || 'Unknown';
}
