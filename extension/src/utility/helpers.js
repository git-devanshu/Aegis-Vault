import {UAParser} from 'ua-parser-js';


// decode the JWT and return the payload
export function decodeToken(token) {
    try {
        if(!token){
            return null;
        }
        const base64Url = token.split('.')[1]; // Get the payload part
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Base64URL to Base64
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload); // Parse JSON payload
        if(!decoded.exp || decoded.exp * 1000 < Date.now()) return null; //check expiry

        return decoded;
    } 
    catch (error) {
        console.error('Invalid token: ', error);
        return null;
    }
}


// function to fetch the server's base URL
export function getBaseURL() {
    return import.meta.env.VITE_SERVER_URL;
}


export const saveStorage = (key, value) =>{
    return new Promise((resolve)=>{
        chrome.storage.local.set({[key]: value}, resolve);
    });
};

export const getStorage = (key) =>{
    return new Promise((resolve)=>{
        chrome.storage.local.get([key], (result)=>{
            resolve(result[key]);
        });
    });
};

export const removeStorage = (key) =>{
    return new Promise((resolve)=>{
        chrome.storage.local.remove(key, resolve);
    });
};

export const clearStorage = () =>{
    return new Promise((resolve)=>{
        chrome.storage.local.clear(resolve);
    });
};


// function that fetches device details for session creation
export function getDevice() {
    const parser = new UAParser();

    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';
    const device = `${browser} on ${os}`;

    return device;
}


// function to calculate session expiry date
export function getSessionExpiry(createdAt) {
    return new Date(
        new Date(createdAt).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toLocaleString('en-GB');
}


// function to take the bank color and return suitable text color (black or white)
export function getContrastColor(hex){
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);

    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return brightness > 155 ? '#010101' : '#FEFEFE';
}


export const getCssVariable = variableName =>{
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
}


// return time in 12 hour clock or 24 hour clock
export const formatTime = (time, use12HourClockInSchedule = false) =>{
    if(!time?.length) return '';
    if(!use12HourClockInSchedule){
        return time;
    }

    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}


export function normalizeWebsite(site){
    if(!site){
        return "";
    }
    return site
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
}


export async function getCurrentHostname(){
    try{
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if(!tab?.url){
            return "";
        }
        const hostname = new URL(tab.url).hostname;
        return normalizeWebsite(hostname);
    }
    catch(error){
        console.log(error);
        return "";
    }
}


//function to get the current date in different formats
/*
type values : 
1 - DD-MM-YYYY
2 - DD M_name, YYYY
3 - D_name DD M_name, YYYY
4 - YYYY
5 - hh:mm
6 - YYYY-MM
else - YYYY-MM-DD
*/
export function getCurrentDate(type){
    const date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth();
    var m_name = date.toLocaleString('default', {month : 'long'});
    var yy = date.getFullYear();
    var d_name = date.toLocaleString('default', {weekday : 'long'});
    var h = date.getHours();
    var min = date.getMinutes();

    if(type === 1){
        return dd.toString(10).padStart(2, '0') + '-' + (mm+1).toString(10).padStart(2, '0') + '-' + yy;
    }
    else if(type === 2){
        return dd + ' ' + m_name + ', ' + yy;
    }
    else if(type === 3){
        return d_name + ' ' + dd + ' ' + m_name + ', ' + yy;
    }
    else if(type === 4){
        return yy;
    }
    else if(type === 5){
        return h.toString(10).padStart(2, '0') + ':' + min.toString(10).padStart(2, '0');
    }
    else if(type === 6){
        return yy + '-' + (mm+1).toString(10).padStart(2, '0');
    }
    else{
        return yy + '-' + (mm+1).toString(10).padStart(2, '0') + '-' + dd.toString(10).padStart(2, '0');
    }
}