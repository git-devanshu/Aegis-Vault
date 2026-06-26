import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Flex, Text } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';


export default function AddTrackerPopup({isOpen, onClose, selectedAccount, refreshTracker, setRefreshTracker, accountDataArray, setAccountData}) {
    if(!selectedAccount){
        onClose(false);
        return null;
    }
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [tracker, setTracker] = useState({
        name: '',
        amount: 0
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>{
        setTracker({
            ...tracker,
            [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
        });
    }

    const addTracker = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const {encryptedData: trackerData, nonce: trackerDataNonce} = await encryptData(JSON.stringify(tracker), masterKey);
            const categoryLimits = [];
            const {encryptedData: limitsData, nonce: limitsDataNonce} = await encryptData(JSON.stringify(categoryLimits), masterKey);
            const updatedAccount = {
                countryCode: selectedAccount.countryCode,
                bankId: selectedAccount.bankId,
                accountNo: selectedAccount.accountNo,
                accountAlias: selectedAccount.accountAlias,
                totalIncome: selectedAccount.totalIncome + Number(tracker.amount),
                totalExpense: selectedAccount.totalExpense
            }
            const {encryptedData: accountData, nonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/trackers',
                data: {accountIndex: selectedAccount.accountIndex, trackerData, trackerDataNonce, limitsData, limitsDataNonce, accountData, nonce},
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    const updatedAccountForUI = {
                        ...selectedAccount, 
                        totalIncome: selectedAccount.totalIncome + Number(tracker.amount)
                    }
                    setAccountData(accountDataArray.map(account =>{
                            if(account.accountIndex === selectedAccount.accountIndex){
                                return updatedAccountForUI;
                            }
                            return account;
                        })
                    );
                    onClose(false);
                    setRefreshTracker(!refreshTracker);
                    setTracker({
                        name: '',
                        amount: 0
                    });
                }
            })
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }


    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.ADD_INCOME} bg={theme.bg} borderColor={theme.success}>
            <form>
                <InputBox type='text' label={DISPLAY.LABELS.INCOME_SOURCE} name='name' value={tracker.name} onChange={handleChange} required maxLen={50}/>
                <InputBox type='number' label={DISPLAY.LABELS.AMOUNT} name='amount' value={tracker.amount} onChange={handleChange} required min={0}/>
                <ActionButton name={DISPLAY.BUTTONS.ADD_INCOME} actionType='primary' isLoading={isLoading} disabled={isLoading || tracker.amount <= 0} onClick={addTracker} customStyle={{marginBottom: theme.marginS}} />
            </form>
        </Popup>
    );
}
