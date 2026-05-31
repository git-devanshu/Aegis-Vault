import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import useLanguage from './useLanguage';

export default function useAppContext() {
    const { TOASTS } = useLanguage();

    const context = useContext(AppContext);
    if (!context) {
        throw new Error(TOASTS.COMMON.UNKNOWN_ERROR);
    }
    return context;
};