import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Stack, useMediaQuery, ButtonGroup, Spacer } from '@chakra-ui/react'
import { createHash, createPassKey } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { decodeToken, downloadPassKeyFile, getAuthToken } from '../../utility/helpers';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useClearOnUnmount from '../../hooks/useClearOnUnmount';

import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdRefresh, MdDevices } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { TbDeviceDesktopOff } from 'react-icons/tb';

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import TitleBar from "../../common-components/navbar/TitleBar";
import SessionCard from "../../common-components/vault/SessionCard";
import AppLayout from "../../common-components/AppLayout";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import SessionAgeGraph from "../../common-components/widgets/SessionAgeGraph";
import DeviceTypeStats from "../../common-components/widgets/DeviceTypeStats";
import Loading from "../../common-components/Loading";
import PinModal from "../../common-components/PinModal";
import SessionLocationMap from "../../common-components/widgets/SessionLocationMap";


export default function Security() {
    const currentSessionId = decodeToken(getAuthToken()).sessionId;
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, clearMasterKey, userSalt, newPassKeyGenerated, setNewPassKeyGenerated} = useAppContext();
    const navigate = useNavigate();
    const [isLargeScreen] = useMediaQuery('(min-width: 910px)');

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false); //use this to disable buttons not to show <Loading/>

    const [showNewPasskeyPopup, setShowNewPasskeyPopup] = useState(false);
    const [showPasskeyDownloadedPopup, setShowPasskeyDownloadedPopup] = useState(false);
    const [showTerminatePopup, setShowTerminatePopup] = useState(false);
    const [showTerminateAllPopup, setShowTerminateAllPopup] = useState(false);

    const [sessionIdToRemove, setSessionIdToRemove] = useState('');

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    useEffect(()=>{
        if(!masterKey) return;
        async function fetchSessions(){
            setIsLoading(true);
            await apiRequest({
                method:'GET',
                endpoint:'/api/ss/all-sessions',
                setIsLoading,
                onSuccess:(res)=>{
                    setData(res.data.allUserSessions);
                },
                onError:(err)=>{
                    setError(err?.response?.data?.message || TOASTS.COMMON.UNKNOWN_ERROR);
                }
            });
        }
        fetchSessions();
    }, [refresh, masterKey]);

    const terminateSession = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.AUTH.TERMINATING_SESSION,
            setIsLoading
        });
        await apiRequest({
            method: 'DELETE',
            endpoint: `/api/ss/user-session/${sessionIdToRemove}`,
            toastId,
            setIsLoading,
            onSuccess: ()=>{
                setRefresh(!refresh);
            }
        });
        setShowTerminatePopup(false);
    }

    const terminateAllOtherSessions = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.AUTH.TERMINATING_SESSION,
            setIsLoading
        });
        await apiRequest({
            method: 'DELETE',
            endpoint: '/api/ss/all-sessions',
            toastId,
            setIsLoading,
            onSuccess: ()=>{
                setRefresh(!refresh);
            }
        });
        setShowTerminateAllPopup(false);
    }

    const generateNewPasskey = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.AUTH.GENERATING_NEW_PASSKEY, 
            setIsLoading
        });
        try{
            const passKey = createPassKey();
            const passKeyHash = await createHash(passKey, userSalt);

            await apiRequest({
                method: 'POST',
                endpoint: '/api/ss/new-passkey',
                data: {passKeyHash},
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    downloadPassKeyFile(passKey);
                    setShowPasskeyDownloadedPopup(true);
                    setNewPassKeyGenerated(prev => prev + 1);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
        setShowNewPasskeyPopup(false);
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!data){
        return <Loading data={DISPLAY.TEXT.DETAILS} error={error}/>
    }

    const sidebar = (
        <Flex align='center' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<MdRefresh/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.REFRESH} ttPlacement="right" onClick={()=> setRefresh(!refresh)}/>
            <CircleIconButton icon={<TbDeviceDesktopOff/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.LOGOUT_ALL} ttPlacement="right" onClick={()=>setShowTerminateAllPopup(true)}/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.LEARN_MORE} ttPlacement="right" onClick={()=>{}}/>
        </Flex>
    );

    return (
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <MdDevices color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.SECURITY}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/home')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>
                <Flex direction={{base: 'column', md: 'row'}} width='100%' gap={theme.spacing}>
                    {/* Main Div */}
                    <div style={{width: '100%'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing} align={{base: 'center', sm: 'left'}}>
                            {DISPLAY.LABELS.PASSKEY}
                        </Text>
                        <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                            {DISPLAY.TEXT.PASSKEY_INFO} {DISPLAY.TEXT.GENERATE_NEW_PASSKEY}
                        </Text>
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: theme.marginL}}>
                            <InputBox type='password' name='passkey' value='abcdefghijklmnopqrstuvwxyz' label={DISPLAY.LABELS.PASSKEY} readOnly={true}/>
                            <ActionButton name={DISPLAY.BUTTONS.REGENERATE} onClick={()=> setShowNewPasskeyPopup(true)} actionType='primary' disabled={isLoading} customStyle={{marginBottom: theme.marginL, width: 'fit-content', paddingLeft: theme.spacing, paddingRight: theme.spacing}}/>
                        </div>

                        <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                            {DISPLAY.TEXT.PASSKEY_REGENERATIONS}: 
                            <span style={{backgroundColor: theme.primary, padding: '0 3px 1px 3px', color: '#0F172A', marginLeft: theme.marginL, borderRadius: '5px'}}>{newPassKeyGenerated}</span>
                        </Text>

                        <Divider borderColor={theme.border} borderWidth='1px' />

                        <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing} marginTop={theme.marginL} align={{base: 'center', sm: 'left'}}>
                            {DISPLAY.LABELS.ACTIVE_SESSIONS}
                        </Text>
                        <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                            {DISPLAY.TEXT.VIEW_AND_LOGOUT_SESSIONS}
                        </Text>

                        <Stack direction='column' spacing={theme.spacing}>
                            {
                                data.map(session=>(
                                    <SessionCard key={session._id} session={session} currentSessionId={currentSessionId} onTerminate={()=>{setSessionIdToRemove(session._id); setShowTerminatePopup(true)}}/>
                                ))
                            }
                        </Stack>
                    </div>

                    {/* Analytics Div */}
                    <div style={{width: '100%'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing} align={{base: 'center', sm: 'left'}}>
                            {DISPLAY.LABELS.SESSION_ANALYTICS}
                        </Text>
                        <Flex gap={theme.marginL} width='100%' direction={isLargeScreen ? 'row' : 'column'} marginBottom={theme.marginL}>
                            <SessionAgeGraph sessions={data} />
                            <DeviceTypeStats sessions={data} />
                        </Flex>
                        <SessionLocationMap sessions={data} />
                        <div style={{height: '80px', width: '100%'}}></div> {/* For extra space in mobile devices */}
                    </div>
                </Flex>
            </AppLayout>

            {/* Terminate Selected Session Popup */}
            <Popup isOpen={showTerminatePopup} onClose={()=> setShowTerminatePopup(false)} title={DISPLAY.TEXT.TERMINATE_SESSION} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_LOGOUT}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowTerminatePopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.TERMINATE} onClick={terminateSession} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Terminate All Sessions Popup */}
            <Popup isOpen={showTerminateAllPopup} onClose={()=> setShowTerminateAllPopup(false)} title={DISPLAY.TEXT.TERMINATE_ALL_SESSIONS} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_LOGOUT_ALL}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowTerminateAllPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.TERMINATE} onClick={terminateAllOtherSessions} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Generate New PassKey Popup */}
            <Popup isOpen={showNewPasskeyPopup} onClose={()=> setShowNewPasskeyPopup(false)} title={DISPLAY.TEXT.NEW_PASSKEY}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_REGENERATE}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowNewPasskeyPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.PROCEED} onClick={generateNewPasskey} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Passkey Downloaded Popup */}
            <Popup isOpen={showPasskeyDownloadedPopup} onClose={()=> setShowPasskeyDownloadedPopup(false)} title={DISPLAY.TEXT.IMPORTANT} borderColor={theme.warning}>
                <Text align='center' color={theme.text}>{DISPLAY.TEXT.PASSKEY_DOWNLOADED}</Text>
                <Text align='center' color={theme.warning} my={theme.marginL}>{DISPLAY.TEXT.DO_NOT_LOSE_PASSKEY}</Text>
                <ActionButton name={DISPLAY.BUTTONS.UNDERSTAND} onClick={()=> setShowPasskeyDownloadedPopup(false)} customStyle={{marginTop: theme.spacing, marginBottom: theme.marginL}}/>
            </Popup>
        </div>
    );
}
