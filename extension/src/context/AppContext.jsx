import {createContext, useContext, useState} from "react";

const AppContext = createContext();

export default function AppProvider({children}){
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [user, setUser] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [masterKey, setMasterKey] = useState("");
    const [passwordVault, setPasswordVault] = useState([]);

    const clearVault = () =>{
        setIsUnlocked(false);
        setMasterKey("");
        setPasswordVault([]);
    };

    const clearSession = () =>{
        setIsAuthenticated(false);
        setUser(null);
        clearVault();
    };

    const value = {
        isAuthenticated,
        setIsAuthenticated,

        user,
        setUser,

        isUnlocked,
        setIsUnlocked,

        masterKey,
        setMasterKey,

        passwordVault,
        setPasswordVault,

        clearVault,
        clearSession
    };

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);