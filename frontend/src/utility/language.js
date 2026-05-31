export function initializeLanguage() {
    const params = new URLSearchParams(window.location.search);

    const urlLanguage = params.get('lang');

    if(urlLanguage){
        localStorage.setItem('aegis-language', urlLanguage);
        return urlLanguage;
    }

    return (localStorage.getItem('aegis-language') || 'en');
}
