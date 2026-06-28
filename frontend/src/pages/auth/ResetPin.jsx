import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { theme } from '../../themes/theme';
import { createHash, encryptMasterKey, decryptMasterKey } from '../../utility/crypto';
import { Heading, Text } from '@chakra-ui/react'
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { getAuthUser } from "../../utility/helpers";
import useLanguage from "../../hooks/useLanguage";
import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import PinInputBox from "../../common-components/form/PinInputBox";



export default function ResetPin() {
    const {DISPLAY, TOASTS} = useLanguage();
    const navigate = useNavigate();

    const [userSalt, setUserSalt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [password, setPassword] = useState('');
    const [securityPin, setSecurityPin] = useState('');

    const [passwordEncryptedKey, setPasswordEncryptedKey] = useState('');
    const [passwordSalt, setPasswordSalt] = useState('');
    const [passwordNonce, setPasswordNonce] = useState('');

    const [showNewPinDiv, setShowNewPinDiv] = useState(false);


    const verifyUserPassword = async(e) =>{
        e.preventDefault();
        setIsLoading(true);
        const {email} = getAuthUser();
        await apiRequest({
            method: 'GET',
            endpoint: `/api/ss/get-user-salt/${email}`,
            setIsLoading,
            secure: false,
            defaultSuccessToast: false,
            onSuccess: (res) =>{
                setUserSalt(res.data.userSalt);
            }
        });

        if(!userSalt?.length) return;

        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        try{
            const passwordHash = await createHash(password, userSalt);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/verify-user',
                data: {passwordHash},
                toastId,
                setIsLoading,
                onSuccess: (res)=> {
                    setPasswordEncryptedKey(res.data.passwordEncryptedKey);
                    setPasswordSalt(res.data.passwordSalt);
                    setPasswordNonce(res.data.passwordNonce);
                    setShowNewPinDiv(true);
                }
            })
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    const setNewSecurityPin = async(e) =>{
        if(securityPin.length !== 6) return;
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        try{
            const decryptedMasterKey = await decryptMasterKey(passwordEncryptedKey, password, passwordSalt, passwordNonce);
            const { encryptedMasterKey: pinEncryptedKey, salt: pinSalt, nonce: pinNonce } = await encryptMasterKey(decryptedMasterKey, securityPin);
            const pinHash = await createHash(securityPin, userSalt);

            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/reset-pin',
                data: { pinEncryptedKey, pinSalt, pinNonce, pinHash },
                toastId,
                setIsLoading,
                onSuccess: (res)=> {
                    setPassword('');
                    setSecurityPin('');
                    setPasswordEncryptedKey('');
                    setPasswordSalt('');
                    setPasswordNonce('');
                    setUserSalt('');
                    setTimeout(()=> navigate('/home', {replace: true}), 1000);
                }
            });
        }
        catch(error) {
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Heading color={theme.primary} size='lg' textAlign='center' marginBottom={theme.spacing}>
                    ⛉Aegis
                </Heading>

                <Text color={theme.text} fontSize={theme.headingSize} textAlign='center' marginBottom={theme.spacing}>
                    {DISPLAY.LABELS.RESET_PIN}
                </Text>

                {!showNewPinDiv && 
                    <form>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center' marginBottom={theme.spacing}>
                            {DISPLAY.TEXT.ENTER_PASSWORD}
                        </Text>
                        <InputBox type='password' label={DISPLAY.LABELS.PASSWORD} name='password' value={password} onChange={(e)=> setPassword(e.target.value)} required={true} minLen={8} maxLen={30}/>
                        <ActionButton name={DISPLAY.BUTTONS.VERIFY} onClick={verifyUserPassword} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.marginL}}/>
                    </form>
                }
                {showNewPinDiv && 
                    <form>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center' marginBottom={theme.spacing}>
                            {DISPLAY.TEXT.ENTER_NEW_PIN}
                        </Text>
                        <PinInputBox value={securityPin} onChange={(value) => setSecurityPin(value)} mask={true} required={true}/>
                        <ActionButton name={DISPLAY.BUTTONS.RESET_PIN} onClick={setNewSecurityPin} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.marginL}}/>
                    </form>
                }

                <Text color={theme.textSecondary} fontSize={theme.textSize} marginTop={theme.marginL} textAlign='center'>
                    {DISPLAY.TEXT.DONT_REFRESH}
                </Text>
            </div>
        </div>
    );
}
