import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { theme } from '../../themes/theme';
import { createHash, encryptMasterKey, decryptMasterKey } from '../../utility/crypto';
import { Heading, Text } from '@chakra-ui/react'
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import useLanguage from "../../hooks/useLanguage";
import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import PinInputBox from "../../common-components/form/PinInputBox";
import toast from "react-hot-toast";


export default function ResetPassword() {
    const {DISPLAY, TOASTS} = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [userSalt, setUserSalt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passKey, setPassKey] = useState('');
    const [securityPin, setSecurityPin] = useState('');

    const [pinEncryptedKey, setPinEncryptedKey] = useState('');
    const [pinSalt, setPinSalt] = useState('');
    const [pinNonce, setPinNonce] = useState('');

    const [showPasskeyDiv, setShowPasskeyDiv] = useState(false);
    const [showNewPasswordDiv, setShowNewPasswordDiv] = useState(false);


    useEffect(()=>{
        async function switchStep(){
            const email = searchParams.get('email') || '';
            const salt = searchParams.get('salt') || '';
            const encrypted_base = searchParams.get('encrypted_base') || '';
            const pin_salt = searchParams.get('pin_salt') || '';
            const pin_nonce = searchParams.get('pin_nonce') || '';

            setEmail(email);

            if(salt.length){
                setUserSalt(salt);
                setShowPasskeyDiv(true);
            }
            if(encrypted_base.length && pin_salt.length && pin_nonce.length){
                setPinEncryptedKey(encrypted_base);
                setPinSalt(pin_salt);
                setPinNonce(pin_nonce);
                setShowNewPasswordDiv(true);
            }
        }
        switchStep();
    }, [searchParams]);


    const fetchUserSalt = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        await apiRequest({
            method: 'GET',
            endpoint: `/api/ss/get-user-salt/${email}`,
            toastId,
            setIsLoading,
            secure: false,
            onSuccess: (res) =>{
                setUserSalt(res.data.userSalt);
                navigate(`/reset-password?email=${encodeURIComponent(email)}&salt=${encodeURIComponent(res.data.userSalt)}`, {replace: true});
            }
        });
    }


    const verifyUserPasskey = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        try{
            const passKeyHash = await createHash(passKey, userSalt);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/verify-passkey',
                data: {email, passKeyHash},
                toastId,
                setIsLoading,
                secure: false,
                onSuccess: (res) =>{
                    setPinEncryptedKey(res.data.pinEncryptedKey);
                    setPinSalt(res.data.pinSalt);
                    setPinNonce(res.data.pinNonce);
                    navigate(`/reset-password?email=${encodeURIComponent(email)}&salt=${encodeURIComponent(userSalt)}&encrypted_base=${encodeURIComponent(res.data.pinEncryptedKey)}&pin_salt=${encodeURIComponent(res.data.pinSalt)}&pin_nonce=${encodeURIComponent(res.data.pinNonce)}`, {replace: true});
                }
            });
        }
        catch(error) {
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }


    const setNewPassword = async(e) =>{
        if(securityPin.length !== 6) return;
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        try{
            const decryptedMasterKey = await decryptMasterKey(pinEncryptedKey, securityPin, pinSalt, pinNonce);
            const { encryptedMasterKey: passwordEncryptedKey, salt: passwordSalt, nonce: passwordNonce } = await encryptMasterKey(decryptedMasterKey, password);
            const passwordHash = await createHash(password, userSalt);
            const pinHash = await createHash(securityPin, userSalt);

            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/reset-password',
                data: { email, passwordEncryptedKey, passwordSalt, passwordNonce, passwordHash, pinHash },
                toastId,
                setIsLoading,
                secure: false,
                onSuccess: (res)=> {
                    setEmail('');
                    setPassword('');
                    setPassKey('');
                    setSecurityPin('');
                    setPinEncryptedKey('');
                    setPinNonce('');
                    setPinSalt('');
                    setUserSalt('');
                    setTimeout(()=> navigate('/login', {replace: true}), 1000);
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
                    {DISPLAY.LABELS.RESET_PASSWORD}
                </Text>

                {!showPasskeyDiv && !showNewPasswordDiv &&
                    <form>
                        <InputBox type='email' label={DISPLAY.LABELS.EMAIL} name='email' value={email} onChange={(e)=> setEmail(e.target.value)} required={true} minLen={6} maxLen={30}/>
                        <ActionButton name={DISPLAY.BUTTONS.NEXT} onClick={fetchUserSalt} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.marginL}}/>
                    </form>
                }
                {showPasskeyDiv && !showNewPasswordDiv && 
                    <form>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center' marginBottom={theme.spacing}>
                            {DISPLAY.TEXT.ENTER_PASSKEY}
                        </Text>
                        <InputBox type='text' label={DISPLAY.LABELS.PASSKEY} name='passKey' value={passKey} onChange={(e)=> setPassKey(e.target.value)} required={true} />
                        <ActionButton name={DISPLAY.BUTTONS.VERIFY} onClick={verifyUserPasskey} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.marginL}}/>
                    </form>
                }
                {showNewPasswordDiv && 
                    <form>
                        <PinInputBox value={securityPin} onChange={(value) => setSecurityPin(value)} mask={true} required={true}/>
                        <InputBox type='password' label={DISPLAY.LABELS.NEW_PASSWORD} name='password' value={password} onChange={(e)=> setPassword(e.target.value)} required={true} minLen={8} maxLen={30}/>
                        <ActionButton name={DISPLAY.BUTTONS.RESET_PASSWORD} onClick={setNewPassword} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.marginL}}/>
                    </form>
                }

                <Text color={theme.textSecondary} fontSize={theme.textSize} marginTop={theme.marginL} textAlign='center'>
                    {DISPLAY.TEXT.DONT_HIT_BACK}
                </Text>
            </div>
        </div>
    );
}
