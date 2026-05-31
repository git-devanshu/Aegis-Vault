import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from '../../themes/theme';
import { createHash } from '../../utility/crypto';
import { Heading, Text } from '@chakra-ui/react'
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { getDeviceDetails, saveAuthToken } from '../../utility/helpers';
import useLanguage from "../../hooks/useLanguage";
import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";


export default function Login() {
    const {DISPLAY, TOASTS} = useLanguage();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email : '',
        password : ''
    });

    const [userSalt, setUserSalt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setUser({
            ...user,
            [name] : value
        });
    }

    const fetchUserSalt = async(e) =>{
        const toastId = validateAndStartLoading({
            e, 
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        await apiRequest({
            method: 'GET',
            endpoint: `/api/ss/get-user-salt/${user.email}`,
            toastId,
            setIsLoading,
            secure: false,
            onSuccess: (res) =>{
                setUserSalt(res.data.userSalt);
            }
        });
    }

    const loginUser = async(e) =>{
        const toastId = validateAndStartLoading({
            e, 
            loadingMessage: TOASTS.COMMON.LOADING, 
            setIsLoading
        });
        if(!toastId) return;
        const passwordHash = await createHash(user.password, userSalt);
        const { deviceType, device } = getDeviceDetails();
        await apiRequest({
            method: 'POST', 
            endpoint: '/api/ss/login',
            data: {
                email: user.email,
                passwordHash,
                deviceType,
                device
            },
            toastId, 
            setIsLoading, 
            secure: false,
            onSuccess: (res) =>{
                saveAuthToken(res.data.token);
                setTimeout(()=> navigate('/home', {replace: true}), 1500);
            }
        });
    }
    
    return (
        <div className="auth-page">
            <div className="auth-container">
                <Heading color={theme.primary} size='lg' textAlign='center' marginBottom={theme.spacing}>
                    ⛉Aegis
                </Heading>

                <Text color={theme.text} fontSize={theme.headingSize} textAlign='center' marginBottom={theme.spacing}>
                    {DISPLAY.LABELS.WELCOME}
                </Text>

                <form>
                    <InputBox type='email' label={DISPLAY.LABELS.EMAIL} name='email' value={user.email} onChange={handleChange} required={true} minLen={6} maxLen={30}/>
                    
                    {userSalt && <InputBox type='password' label={DISPLAY.LABELS.PASSWORD} name='password' value={user.password} onChange={handleChange} required={true} minLen={8} maxLen={30}/>}
                    
                    <Text color={theme.textSecondary} fontSize={theme.textSize} marginTop={theme.marginS} textAlign='center'>
                        <a href="/" style={{textDecoration: 'underline'}}>{DISPLAY.TEXT.FORGOT_PASSWORD}</a>
                    </Text>

                    {!userSalt && <ActionButton name={DISPLAY.BUTTONS.NEXT} onClick={fetchUserSalt} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.spacing}}/>}
                    {userSalt && <ActionButton name={DISPLAY.BUTTONS.LOGIN} onClick={loginUser} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.spacing}}/>}
                </form>

                <Text color={theme.textSecondary} fontSize={theme.textSize} marginTop={theme.marginL} textAlign='center'>
                    {DISPLAY.TEXT.NEW_USER} <a href="/signup" style={{textDecoration: 'underline'}}>{DISPLAY.LABELS.SIGNUP}</a>
                </Text>
            </div>
        </div>
    );
}
