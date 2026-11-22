import React, { useState, useEffect } from 'react';
import { theme } from '../../themes/theme';
import toast from 'react-hot-toast';

import BANKS from '../../assets/banks.json';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { encryptData } from '../../utility/crypto';

import { Flex, Text, Grid, Image, Box, Spacer } from '@chakra-ui/react';
import InputBox from '../form/InputBox';
import ActionButton from '../form/ActionButton';
import Popup from './Popup'

export default function UpdateAccountPopup({showUpdateAccountPopup, setShowUpdateAccountPopup, account, accountData, setAccountData}) {
    if(!account) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const bank = BANKS.banks[account.bankId];

    const [accountNumber, setAccountNumber] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(account){
            setAccountNumber(account.accountNo);
            setTotalIncome(account.totalIncome);
            setTotalExpense(account.totalExpense);
        }
    }, [account]);

    {/* @NonProduction */}
    const updateAccountData = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const updatedAccount = {
                countryCode: account.countryCode,
                bankId: account.bankId,
                accountNo: accountNumber,
                accountAlias: account.accountAlias,
                totalIncome: totalIncome, 
                totalExpense: totalExpense
            };
            const {encryptedData: accountDataEncrypted, nonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/al/update-account',
                data: {
                    accountData: accountDataEncrypted, 
                    accountIndex: account.accountIndex, 
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res)=>{
                    const updatedAccountForUI = {
                        ...account,
                        totalIncome, 
                        totalExpense,
                        accountNo: accountNumber
                    };
                    setAccountData(accountData.map(acc =>{
                            if(acc.accountIndex === account.accountIndex){
                                return updatedAccountForUI;
                            }
                            return acc;
                        })
                    );
                    setShowUpdateAccountPopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <Popup isOpen={showUpdateAccountPopup} onClose={()=> setShowUpdateAccountPopup(false)} title={DISPLAY.TEXT.UPDATE_ACCOUNT} bg={theme.bg} borderColor={theme.success}>
            
            {/* @NonProduction */}
            <Text color={theme.text} fontSize={theme.textSize} ml={theme.marginL} mb={theme.spacing}>{bank.bankName}</Text>
            <form>
                <InputBox type='text' label={DISPLAY.LABELS.ACCOUNT_NUMBER} value={accountNumber} onChange={(e)=> setAccountNumber(e.target.value)} required={true} maxLen={30} />
                <InputBox type='number' label={DISPLAY.TEXT.TOTAL_INCOME} value={totalIncome} onChange={(e)=> setTotalIncome(e.target.value)} required={true} min={1} />
                <InputBox type='number' label={DISPLAY.TEXT.TOTAL_EXPENSE} value={totalExpense} onChange={(e)=> setTotalExpense(e.target.value)} required={true} min={1} />
                <ActionButton name={DISPLAY.BUTTONS.SAVE} onClick={updateAccountData} disabled={isLoading} isLoading={isLoading} actionType='primary' customStyle={{marginBottom: theme.marginS}} />
            </form>

        </Popup>
    )
}
