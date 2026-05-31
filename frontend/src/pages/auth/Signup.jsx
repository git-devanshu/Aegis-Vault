import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import { createSalt, createHash, createMasterKey, createPassKey, encryptData, encryptMasterKey } from '../../utility/crypto';
import { Heading, Text } from '@chakra-ui/react'
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { downloadPassKeyFile } from '../../utility/helpers';
import useLanguage from "../../hooks/useLanguage";
import SYSTEM_DATA from '../../assets/system-data.json';
import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import PinInputBox from "../../common-components/form/PinInputBox";
import Popup from "../../common-components/popup/Popup";


export default function Signup() {
    const {DISPLAY, TOASTS} = useLanguage();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email : '',
        name : '',
        password : '',
        securityPin : '',
    });

    const [passKey, setPassKey] = useState('');

    const [isEmailAvailable, setIsUserAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setUser({
            ...user,
            [name] : value
        });
    }

    const navigateToLogin = () =>{
        navigate('/login', {replace: true});
    }

    const checkEmailAvailability = async(e) =>{
        const toastId = validateAndStartLoading({
            e, 
            loadingMessage: TOASTS.AUTH.CHECK_EMAIL_AVAL, 
            setIsLoading
        });
        if(!toastId) return;
        await apiRequest({
            method: 'GET', 
            endpoint: `/api/ss/email-exists/${user.email}`,
            toastId, 
            setIsLoading, 
            secure: false,
            defaultSuccessToast: false,
            onSuccess: (res) =>{
                if(res.data.exists) toast.error(TOASTS.AUTH.EMAIL_USED, {id:toastId});
                else {
                    toast.success(TOASTS.AUTH.EMAIL_AVAILABLE, {id:toastId});
                    setIsUserAvailable(true);
                }
            }
        });
    }

    const signupUser = async(e) =>{
        const toastId = validateAndStartLoading({
            e, 
            loadingMessage: TOASTS.AUTH.CREATING_USER, 
            setIsLoading
        });
        if(!toastId) return;
        try{
            const userSalt = createSalt();
            const passKey = createPassKey();

            const passwordHash = await createHash(user.password, userSalt);
            const pinHash = await createHash(user.securityPin, userSalt);
            const passKeyHash = await createHash(passKey, userSalt);

            const masterKey = createMasterKey();
            const { encryptedMasterKey: passwordEncryptedKey, salt: passwordSalt, nonce: passwordNonce } = await encryptMasterKey(masterKey, user.password);
            const { encryptedMasterKey: pinEncryptedKey, salt: pinSalt, nonce: pinNonce } = await encryptMasterKey(masterKey, user.securityPin);

            const defaultLabels = [SYSTEM_DATA.PASSWORD_LABELS.OTHER]; //the default label is used by id for translation purpose
            const { encryptedData: labelList, nonce: labelNonce } = await encryptData(JSON.stringify(defaultLabels), masterKey);
            
            const requestPayload = {
                email: user.email, name: user.name,
                passwordHash, pinHash, passKeyHash, userSalt,
                pinEncryptedKey, passwordEncryptedKey, pinSalt, passwordSalt, pinNonce, passwordNonce,
                labelList, labelNonce
            }

            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/signup',
                data: requestPayload,
                toastId,
                successCode: 201,
                secure: false,
                setIsLoading,
                onSuccess: (res)=>{
                    setPassKey(passKey);
                    setShowSuccessPopup(true);
                }
            })
        }
        catch(error) {
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if(!passKey) return;
        downloadPassKeyFile(passKey);
    }, [passKey]);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Heading color={theme.primary} size='lg' textAlign='center' marginBottom={theme.spacing}>
                    ⛉Aegis
                </Heading>

                <Text color={theme.text} fontSize={theme.headingSize} textAlign='center' marginBottom={theme.spacing}>
                    {DISPLAY.LABELS.SIGNUP}
                </Text>

                {!isEmailAvailable && 
                    <form>
                        <InputBox type='email' label={DISPLAY.LABELS.EMAIL} name='email' value={user.email} onChange={handleChange} required={true} minLen={6} maxLen={30}/>
                        <Text fontSize={theme.textSize} color={theme.textSecondary} textAlign='center' marginTop={theme.marginL}>{DISPLAY.TEXT.TRY_ANOTHER_EMAIL}</Text>
                        <ActionButton name={DISPLAY.BUTTONS.NEXT} onClick={checkEmailAvailability} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.spacing}}/>
                    </form>
                }

                {isEmailAvailable && 
                    <form>
                        <InputBox type='email' label={DISPLAY.LABELS.EMAIL} name='email' value={user.email} onChange={handleChange} required={true} minLen={6} maxLen={50} readOnly={true}/>
                        <InputBox type='text' label={DISPLAY.LABELS.NAME} name='name' value={user.name} onChange={handleChange} required={true} minLen={2} maxLen={30}/>
                        <InputBox type='password' label={DISPLAY.LABELS.PASSWORD} name='password' value={user.password} onChange={handleChange} required={true} minLen={8} maxLen={30}/>
                        <PinInputBox value={user.securityPin} onChange={(value) => setUser({...user, securityPin : value})}/>
                        <Text fontSize={theme.textSize} color={theme.textSecondary} textAlign='center' marginTop={theme.marginL}>{DISPLAY.TEXT.PIN_TO_ACCESS_DATA}</Text>
                        <ActionButton name={DISPLAY.BUTTONS.SIGNUP} onClick={signupUser} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.spacing}}/>
                    </form>
                }

                <Text color={theme.textSecondary} fontSize={theme.textSize} marginTop={theme.marginL} textAlign='center'>
                    {DISPLAY.TEXT.ALREADY_REGISTERED} <a href="/login" style={{textDecoration: 'underline'}}>{DISPLAY.LABELS.LOGIN}</a>
                </Text>
            </div>

            {/* Registration successful popup */}
            <Popup isOpen={showSuccessPopup} onClose={()=> setShowSuccessPopup(false)} title={DISPLAY.TEXT.IMPORTANT} borderColor={theme.warning}>
                <Text align='center' color={theme.text}>{DISPLAY.TEXT.PASSKEY_DOWNLOADED}</Text>
                <Text align='center' color={theme.warning} my={theme.marginL}>{DISPLAY.TEXT.DO_NOT_LOSE_PASSKEY}</Text>
                <ActionButton name={DISPLAY.BUTTONS.UNDERSTAND} onClick={navigateToLogin} customStyle={{marginTop: theme.spacing, marginBottom: theme.marginL}}/>
            </Popup>
        </div>
    );
}
