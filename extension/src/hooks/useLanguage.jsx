import { useState, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';
import SYSTEM_DATA from '../utility/system-data.json';
import { saveStorage, getStorage } from '../utility/helpers';


/* DISPLAY constants */
import deDisplay from '../constants/de/display.json';
import enDisplay from '../constants/en/display.json';
import esDisplay from '../constants/es/display.json';
import frDisplay from '../constants/fr/display.json';
import hiDisplay from '../constants/hi/display.json';
import jaDisplay from '../constants/ja/display.json';
import ruDisplay from '../constants/ru/display.json';
import zhDisplay from '../constants/zh/display.json';



const LANGUAGE_FILES = {
    de: { DISPLAY: deDisplay },
    en: { DISPLAY: enDisplay },
    es: { DISPLAY: esDisplay },
    fr: { DISPLAY: frDisplay },
    hi: { DISPLAY: hiDisplay },
    ja: { DISPLAY: jaDisplay },
    ru: { DISPLAY: ruDisplay },
    zh: { DISPLAY: zhDisplay }
};


const LANGUAGE_CHANGED_EVENT = "AEGIS_LANGUAGE_CHANGED";


/* For usage in .jsx files */
export default function useLanguage() {
    const [languageData, setLanguageData] = useState(LANGUAGE_FILES.en);

    useEffect(() => {
        async function loadLanguage(){
            const language = (await getStorage("aegis-language")) ?? "en";
            setLanguageData(LANGUAGE_FILES[language] || LANGUAGE_FILES.en);
        }
    
        loadLanguage();
        window.addEventListener(LANGUAGE_CHANGED_EVENT, loadLanguage);
    
        return () => {
            window.removeEventListener(LANGUAGE_CHANGED_EVENT, loadLanguage);
        };
    }, []);

    return languageData;
}

/* For usage in .js files */
export async function getLanguageConstants() {
    const language = await getStorage('aegis-language') || 'en';
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
export async function setLanguage(code){
    await saveStorage("aegis-language", code);
    window.dispatchEvent(new Event(LANGUAGE_CHANGED_EVENT));
}


/* Get selected name */
export function getLanguageName(code){
    return SYSTEM_DATA.SUPPORTED_LANGUAGES.find(lang => lang.code === code) ?.name || 'Unknown';
}
