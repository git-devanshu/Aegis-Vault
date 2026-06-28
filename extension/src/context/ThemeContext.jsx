import { createContext, useEffect, useState } from "react";
import { getStorage, saveStorage } from "../utility/helpers";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
    const [aegisTheme, setAegisTheme] = useState("dark");

    useEffect(() => {
        async function loadTheme(){
            const savedTheme = await getStorage("aegis-theme");
            if(savedTheme){
                setAegisTheme(savedTheme);
            }
        }
        loadTheme();
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-aegis-theme", aegisTheme);
        saveStorage("aegis-theme", aegisTheme);
    }, [aegisTheme]);

    function toggleAegisTheme(){
        setAegisTheme(aegisTheme === "dark" ? "light" : "dark");
    }

    return(
        <ThemeContext.Provider value={{ aegisTheme, setAegisTheme, toggleAegisTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
