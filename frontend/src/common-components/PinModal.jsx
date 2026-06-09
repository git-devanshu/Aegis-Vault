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
        userSalt, setUserSalt,
        setNewPassKeyGenerated,
        setHideRemovedLabels,
        hideShowPasswordButton, setHideShowPasswordButton,
        disablePasswordModifications, setDisablePasswordModifications,
        allowBankAccountDeletion, setAllowBankAccountDeletion,
        allowIncomeTrackerDeletion, setAllowIncomeTrackerDeletion,
        allowExpenseDeletion, setAllowExpenseDeletion,
        allowNewCategoryCreation, setAllowNewCategoryCreation,
        hideAccountSnapshotInAnalytics, setHideAccountSnapshotInAnalytics,
    } = useAppContext();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [securityPin, setSecurityPin] = useState('123456');
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
        const {email} = getAuthUser();
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        await apiRequest({
            method: 'GET',
            endpoint: `/api/ss/get-user-salt/${email}`,
            toastId,
            setIsLoading,
            secure: false,
            onSuccess: (res) =>{
                setUserSalt(res.data.userSalt);
                navigate(`?salt=${encodeURIComponent(res.data.userSalt)}`);
            }
        });
    }

    const verifySecurityPin = async(e) =>{
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
                        <a href="/" style={{textDecoration: 'underline'}}>{DISPLAY.TEXT.FORGOT_PIN}</a>
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
