import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';
import { Avatar, ButtonGroup, Divider, Flex, Heading, Menu, MenuButton, MenuList, Spacer, Text } from '@chakra-ui/react'
import useLanguage from "../hooks/useLanguage";
import useAppContext from '../hooks/useAppContext';
import { theme } from '../themes/theme';
import { getAuthUser } from "../utility/helpers";
import { apiRequest, validateAndStartLoading } from "../utility/api";

import ActionButton from "../common-components/form/ActionButton";
import PinInputBox from "./form/PinInputBox";
import { createHash, decryptMasterKey } from "../utility/crypto";


export default function PinModal() {
    const {DISPLAY, TOASTS} = useLanguage();
    
    const {setMasterKey,
        userSalt, setUserSalt, setNewPassKeyGenerated,
        setHideRemovedLabels, setHideShowPasswordButton, setDisablePasswordModifications,
        setAllowBankAccountDeletion,
        setAllowIncomeTrackerDeletion, setAllowExpenseDeletion, setAllowNewCategoryCreation, setHideAccountSnapshotInAnalytics,
        setHideAccountBalanceInCard, setAllowFDDeletion, setAllowRDDeletion, setAllowGoldAssetDeletion, setAllowStockDeletion, setHideClosedFD, setHideClosedRD, setHideSoldGoldAssets, setHideSoldStocks,
        setDisableShoppingListModifications, setDisableFoodListModifications, setDisableWatchlistModifications, setDisableReadingListModifications, setDisableWishlistModifications, setDisableTodoListModifications, setDisableTripListModifications, setDisableNotepadModifications,
        setUse12HourClockInSchedule, setDisableJournalModifications, setHideWeeklyScheduleItems, setHideHighPriorityTasks, setHideCompletedTasks, setHideHighPriorityNotes, setDisableNoteModifications
    } = useAppContext();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [securityPin, setSecurityPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // For detecting the ?salt url param and automatically calling pin verification api
    useEffect(()=>{
        async function detectUserSalt(){
            const salt = searchParams.get('salt');
            if(salt){
                await verifySecurityPin();
            }
        }
        detectUserSalt();
    }, [searchParams]);

    const fetchUserSalt = async(e) =>{
        if(securityPin.length !== 6) return;
        const {email} = getAuthUser();
        setIsLoading(true);
        await apiRequest({
            method: 'GET',
            endpoint: `/api/ss/get-user-salt/${email}`,
            setIsLoading,
            secure: false,
            defaultSuccessToast: false,
            onSuccess: (res) =>{
                setUserSalt(res.data.userSalt);
                navigate(`?salt=${encodeURIComponent(res.data.userSalt)}`);
            }
        });
    }

    const verifySecurityPin = async(e) =>{
        if(securityPin.length !== 6) return;
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        try{
            const pinHash = await createHash(securityPin, userSalt);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/verify-pin',
                data: {pinHash},
                toastId,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedMasterKey = await decryptMasterKey(res?.data?.pinEncryptedKey, securityPin, res?.data?.pinSalt, res?.data?.pinNonce);
                    setMasterKey(decryptedMasterKey);
                    setNewPassKeyGenerated(res?.data?.newPassKeyGenerated);

                    setHideShowPasswordButton(res?.data?.userSettings?.hideShowPasswordButton);
                    setHideRemovedLabels(res?.data?.userSettings?.hideRemovedLabels);
                    setDisablePasswordModifications(res?.data?.userSettings?.disablePasswordModifications);
                    setAllowBankAccountDeletion(res?.data?.userSettings?.allowBankAccountDeletion);
                    setAllowIncomeTrackerDeletion(res?.data?.userSettings?.allowIncomeTrackerDeletion);
                    setAllowExpenseDeletion(res?.data?.userSettings?.allowExpenseDeletion);
                    setAllowNewCategoryCreation(res?.data?.userSettings?.allowNewCategoryCreation);
                    setHideAccountSnapshotInAnalytics(res?.data?.userSettings?.hideAccountSnapshotInAnalytics);

                    setHideAccountBalanceInCard(res?.data?.userSettings?.hideAccountBalanceInCard);
                    setAllowFDDeletion(res?.data?.userSettings?.allowFDDeletion);
                    setAllowRDDeletion(res?.data?.userSettings?.allowRDDeletion);
                    setAllowGoldAssetDeletion(res?.data?.userSettings?.allowGoldAssetDeletion);
                    setAllowStockDeletion(res?.data?.userSettings?.allowStockDeletion);
                    setHideClosedFD(res?.data?.userSettings?.hideClosedFD);
                    setHideClosedRD(res?.data?.userSettings?.hideClosedRD);
                    setHideSoldGoldAssets(res?.data?.userSettings?.hideSoldGoldAssets);
                    setHideSoldStocks(res?.data?.userSettings?.hideSoldStocks);

                    setDisableShoppingListModifications(res?.data?.userSettings?.disableShoppingListModifications);
                    setDisableFoodListModifications(res?.data?.userSettings?.disableFoodListModifications);
                    setDisableWatchlistModifications(res?.data?.userSettings?.disableWatchlistModifications);
                    setDisableReadingListModifications(res?.data?.userSettings?.disableReadingListModifications);
                    setDisableWishlistModifications(res?.data?.userSettings?.disableWishlistModifications);
                    setDisableTodoListModifications(res?.data?.userSettings?.disableTodoListModifications);
                    setDisableTripListModifications(res?.data?.userSettings?.disableTripListModifications);
                    setDisableNotepadModifications(res?.data?.userSettings?.disableNotepadModifications);
                    setUse12HourClockInSchedule(res?.data?.userSettings?.use12HourClockInSchedule);
                    setDisableJournalModifications(res?.data?.userSettings?.disableJournalModifications);
                    setHideWeeklyScheduleItems(res?.data?.userSettings?.hideWeeklyScheduleItems);
                    setHideHighPriorityTasks(res?.data?.userSettings?.hideHighPriorityTasks);
                    setHideCompletedTasks(res?.data?.userSettings?.hideCompletedTasks);
                    setHideHighPriorityNotes(res?.data?.userSettings?.hideHighPriorityNotes);
                    setDisableNoteModifications(res?.data?.userSettings?.disableNoteModifications);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
        navigate('.', {replace:true}); // remove url params
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Heading color={theme.primary} size='lg' textAlign='center' marginBottom={theme.spacing}>
                    ⛉Aegis
                </Heading>

                <Text color={theme.text} fontSize={theme.headingSize} textAlign='center' marginBottom={theme.marginL}>
                    {DISPLAY.LABELS.ENTER_PIN}
                </Text>
                <Text fontSize={theme.textSize} color={theme.textSecondary} textAlign='center' marginBottom={theme.spacing}>{DISPLAY.TEXT.PIN_REQUIRED}</Text>

                <form>
                    <PinInputBox value={securityPin} onChange={(value) => setSecurityPin(value)} required={true} mask={true} autoFocus={true}/>
                    <Text color={theme.textSecondary} fontSize={theme.textSize} textAlign='center'>
                        <a href="/reset-pin" style={{textDecoration: 'underline'}}>{DISPLAY.TEXT.FORGOT_PIN}</a>
                    </Text>
                    <ButtonGroup width='full' marginTop={theme.spacing}>
                        <ActionButton name={DISPLAY.BUTTONS.BACK} onClick={()=>navigate('/home')} disabled={isLoading} />
                        <ActionButton name={DISPLAY.BUTTONS.VERIFY} onClick={fetchUserSalt} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                    </ButtonGroup>
                </form>
            </div>
        </div>
    );
}
