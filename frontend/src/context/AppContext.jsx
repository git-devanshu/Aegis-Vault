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

    const [allowBankAccountDeletion, setAllowBankAccountDeletion] = useState(false);

    const [allowIncomeTrackerDeletion, setAllowIncomeTrackerDeletion] = useState(true);
    const [allowExpenseDeletion, setAllowExpenseDeletion] = useState(true);
    const [allowNewCategoryCreation, setAllowNewCategoryCreation] = useState(true);
    const [hideAccountSnapshotInAnalytics, setHideAccountSnapshotInAnalytics] = useState(false);

    const [hideAccountBalanceInCard, setHideAccountBalanceInCard] = useState(false); // for investment vault only
    const [allowFDDeletion, setAllowFDDeletion] = useState(true);
    const [allowRDDeletion, setAllowRDDeletion] = useState(true);
    const [allowGoldAssetDeletion, setAllowGoldAssetDeletion] = useState(true);
    const [allowStockDeletion, setAllowStockDeletion] = useState(true);
    const [hideClosedFD, setHideClosedFD] = useState(false);
    const [hideClosedRD, setHideClosedRD] = useState(false);
    const [hideSoldGoldAssets, setHideSoldGoldAssets] = useState(false);
    const [hideSoldStocks, setHideSoldStocks] = useState(false);

    const [disableShoppingListModifications, setDisableShoppingListModifications] = useState(false);
    const [disableFoodListModifications, setDisableFoodListModifications] = useState(false);
    const [disableWatchlistModifications, setDisableWatchlistModifications] = useState(false);
    const [disableReadingListModifications, setDisableReadingListModifications] = useState(false);
    const [disableWishlistModifications, setDisableWishlistModifications] = useState(false);
    const [disableTodoListModifications, setDisableTodoListModifications] = useState(false);
    const [disableTripListModifications, setDisableTripListModifications] = useState(false);
    const [disableNotepadModifications, setDisableNotepadModifications] = useState(false);
    const [use12HourClockInSchedule, setUse12HourClockInSchedule] = useState(false);
    const [disableJournalModifications, setDisableJournalModifications] = useState(false);
    const [hideWeeklyScheduleItems, setHideWeeklyScheduleItems] = useState(false);
    const [hideHighPriorityTasks, setHideHighPriorityTasks] = useState(false);
    const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
    const [hideHighPriorityNotes, setHideHighPriorityNotes] = useState(false);
    const [disableNoteModifications, setDisableNoteModifications] = useState(false);    

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

        allowBankAccountDeletion, setAllowBankAccountDeletion,

        allowIncomeTrackerDeletion, setAllowIncomeTrackerDeletion,
        allowExpenseDeletion, setAllowExpenseDeletion,
        allowNewCategoryCreation, setAllowNewCategoryCreation,
        hideAccountSnapshotInAnalytics, setHideAccountSnapshotInAnalytics,

        hideAccountBalanceInCard, setHideAccountBalanceInCard,
        allowFDDeletion, setAllowFDDeletion,
        allowRDDeletion, setAllowRDDeletion,
        allowGoldAssetDeletion, setAllowGoldAssetDeletion,
        allowStockDeletion, setAllowStockDeletion,
        hideClosedFD, setHideClosedFD,
        hideClosedRD, setHideClosedRD,
        hideSoldGoldAssets, setHideSoldGoldAssets,
        hideSoldStocks, setHideSoldStocks,

        disableShoppingListModifications, setDisableShoppingListModifications,
        disableFoodListModifications, setDisableFoodListModifications,
        disableWatchlistModifications, setDisableWatchlistModifications,
        disableReadingListModifications, setDisableReadingListModifications,
        disableWishlistModifications, setDisableWishlistModifications,
        disableTodoListModifications, setDisableTodoListModifications,
        disableTripListModifications, setDisableTripListModifications,
        disableNotepadModifications, setDisableNotepadModifications,
        use12HourClockInSchedule, setUse12HourClockInSchedule,
        disableJournalModifications, setDisableJournalModifications,
        hideWeeklyScheduleItems, setHideWeeklyScheduleItems,
        hideHighPriorityTasks, setHideHighPriorityTasks,
        hideCompletedTasks, setHideCompletedTasks,
        hideHighPriorityNotes, setHideHighPriorityNotes,
        disableNoteModifications, setDisableNoteModifications
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
