import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [aegisTheme, setAegisTheme] = useState(localStorage.getItem('aegis-theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-aegis-theme', aegisTheme);
        localStorage.setItem('aegis-theme', aegisTheme);
    }, [aegisTheme]);

    function toggleAegisTheme() {
        setAegisTheme(aegisTheme === 'dark' ? 'light' : 'dark');
    }

    return (
        <ThemeContext.Provider value={{ aegisTheme, setAegisTheme, toggleAegisTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
