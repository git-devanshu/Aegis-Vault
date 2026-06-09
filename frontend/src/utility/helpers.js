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


// functions to handle the JWT
export function saveAuthToken(token) {
    localStorage.setItem('aegis-token', token);
    const decoded = decodeToken(token);
    const user = {
        email : decoded.email,
        name : decoded.name
    }
    localStorage.setItem('aegis-user', JSON.stringify(user));
}

export function getAuthToken() {
    const token = localStorage.getItem('aegis-token');
    return token;
}

export function getAuthUser() {
    const user = JSON.parse(localStorage.getItem('aegis-user'));
    return { email: user.email, name: user.name };
}

export function removeAuthToken() {
    localStorage.removeItem('aegis-token');
    localStorage.removeItem('aegis-user');
}


// function that donwloads the passKey as txt file
export function downloadPassKeyFile(passKey) {
    const blob = new Blob([passKey], { type: "text/plain" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "passkey.txt";
    link.click();

    URL.revokeObjectURL(url);
}


// function that fetches device details for session creation
export function getDeviceDetails() {
    const parser = new UAParser();

    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';
    const deviceType = parser.getDevice().type || 'desktop';

    return {
        deviceType,
        device:`${browser} on ${os}`
    };
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


export const getCategoryDisplayName = (category, DISPLAY) =>{
    if(!category) return '';
    if(category.categoryIndex >= 0 && category.categoryIndex <= 12){
        return DISPLAY.DEFAULT_EXPENSE_CATEGORIES[category.name] || category.name;
    }
    return category.name;
}


export const getCategoryMap = (categoryData) =>{
    return Object.fromEntries(
        categoryData.map(category => [
            category.categoryIndex,
            category
        ])
    );
}


export const getCssVariable = variableName =>{
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
};


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