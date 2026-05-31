import React, { createContext, useState, useCallback } from 'react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    // vault related context
    const [masterKey, setMasterKey] = useState(null);
    const [userSalt, setUserSalt] = useState(null);
    const [newPassKeyGenerated, setNewPassKeyGenerated] = useState(0);

    // user settings context (not to be cleared once loaded)
    const [hideRemovedLabels, setHideRemovedLabels] = useState(false);
    const [hideShowPasswordButton, setHideShowPasswordButton] = useState(false);
    const [disablePasswordModifications, setDisablePasswordModifications] = useState(false);
    const [hideDeleteExpenseButton, setHideDeleteExpenseButton] = useState(false);
    const [hideInvestments, setHideInvestments] = useState(false);
    const [getEmailNotifications, setGetEmailNotifications] = useState(false);
    
    const clearMasterKey = useCallback(() => {
        setMasterKey(null);
    }, []);

    const value = {
        masterKey, setMasterKey,
        clearMasterKey,
        hasKey: !!masterKey,
        userSalt, setUserSalt,
        newPassKeyGenerated, setNewPassKeyGenerated,
        hideRemovedLabels, setHideRemovedLabels,
        hideShowPasswordButton, setHideShowPasswordButton,
        disablePasswordModifications, setDisablePasswordModifications,
        hideDeleteExpenseButton, setHideDeleteExpenseButton,
        hideInvestments, setHideInvestments,
        getEmailNotifications, setGetEmailNotifications
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
