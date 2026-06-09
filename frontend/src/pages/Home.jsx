import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Avatar, ButtonGroup, Divider, Flex, Heading, Menu, MenuButton, MenuList, Spacer, Text } from '@chakra-ui/react'
import useLanguage, { getLanguageIcon, setLanguage } from "../hooks/useLanguage";
import useTheme from '../hooks/useTheme';
import SYSTEM_DATA from '../assets/system-data.json';
import { theme } from '../themes/theme';
import { decodeToken, getAuthToken, getAuthUser, getDeviceDetails, removeAuthToken } from "../utility/helpers";
import { apiRequest, validateAndStartLoading } from "../utility/api";

import { LockIcon, BellIcon } from '@chakra-ui/icons';
import { GiMoneyStack, GiGoldBar } from "react-icons/gi";
import { IoSettingsOutline, IoDesktopOutline } from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode, MdDevices } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { HiMiniDevicePhoneMobile } from "react-icons/hi2";
import { RiLogoutCircleRLine, RiStickyNoteLine } from "react-icons/ri";

import CircleIconButton from "../common-components/form/CircleIconButton";
import ActionButton from "../common-components/form/ActionButton";
import AppLayout from "../common-components/AppLayout";
import VaultCard from "../common-components/vault/VaultCard";
import Popup from "../common-components/popup/Popup";
import TitleBar from "../common-components/navbar/TitleBar";
import PrimaryVaultCard from "../common-components/vault/PrimaryVaultCard";


export default function Home() {
    const { name, email } = getAuthUser();
    const { deviceType, device } = getDeviceDetails();
    const {DISPLAY, TOASTS} = useLanguage();
    const { aegisTheme, toggleAegisTheme } = useTheme();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showProfilePopup, setShwoProfilePopup] = useState(false);

    const navigateToVault = (path) =>{
        navigate(path);
    }

    const terminateSession = async(e) =>{
        const sessionId = decodeToken(getAuthToken()).sessionId;
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.AUTH.TERMINATING_SESSION,
            setIsLoading
        });
        await apiRequest({
            method: 'DELETE',
            endpoint: `/api/ss/user-session/${sessionId}`,
            toastId,
            setIsLoading,
            onSuccess: ()=>{
                removeAuthToken();
                navigate('/', {replace: true});
            }
        });
        setShowLogoutPopup(false);
    }
    
    const sidebar = (
        <Flex align='center' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<IoSettingsOutline/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.SETTINGS} ttPlacement="right" onClick={()=> navigate('/settings')}/>
            <CircleIconButton icon={aegisTheme === 'dark' ? <MdOutlineLightMode/> : <MdOutlineDarkMode/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.THEME} ttPlacement="right" onClick={toggleAegisTheme}/>
            <CircleIconButton icon={<RiStickyNoteLine/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.QUICK_SAVE} ttPlacement="right" onClick={()=> navigate('/quick-save')}/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.ABOUT_US} ttPlacement="right" onClick={()=>{}}/>
            <CircleIconButton icon={<RiLogoutCircleRLine color={theme.error}/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.LOGOUT} ttPlacement="right" onClick={()=> setShowLogoutPopup(true)}/>
        </Flex>
    );

    return (
        <div className="common-page">
            {/* Header */}
            <TitleBar>
                <ActionButton icon={<Avatar size='xs' name={name} />} name={name.substring(0, 20)} onClick={()=>setShwoProfilePopup(true)} customStyle={{width: 'fit-content'}}/>
            </TitleBar>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>
                {/* Main section of Home */}
                <div>
                    <Text color={theme.text} fontSize={theme.headingSize} marginBottom={`calc(${theme.spacing} * 2)`} align={{base: 'center', sm: 'left'}}>
                        {DISPLAY.LABELS.YOUR_VAULTS}
                    </Text>

                    <Flex width='100%'>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, 140px)', gap: theme.spacing, justifyContent: window.innerWidth < 480 ? 'center' : 'start', width:'100%'}}>
                            <PrimaryVaultCard title={DISPLAY.LABELS.PASSWORDS} onClick={()=>navigateToVault('/password-manager')} icon={<LockIcon style={{height:'60px', width:'60px'}}/>} />
                            <PrimaryVaultCard title={DISPLAY.LABELS.EXPENSES} onClick={()=>navigateToVault('/expense-manager')} icon={<GiMoneyStack style={{height:'70px', width:'70px'}}/>} />
                            <PrimaryVaultCard title={DISPLAY.LABELS.INVESTMENTS} onClick={()=>navigateToVault('/investment-manager')} icon={<GiGoldBar style={{height:'70px', width:'70px'}}/>} />
                            <VaultCard title={DISPLAY.LABELS.SECURITY} onClick={()=>navigateToVault('/active-sessions')} icon={<MdDevices style={{height:'70px', width:'70px'}}/>} />
                            {/* <VaultCard title={DISPLAY.LABELS.NOTIFICATIONS} onClick={()=>navigateToVault('/notifications')} icon={<BellIcon style={{height:'60px', width:'60px'}}/>} /> */}
                        </div>
                    </Flex>
                </div>
            </AppLayout>
            
            {/* Logout Popup */}
            <Popup isOpen={showLogoutPopup} onClose={()=> setShowLogoutPopup(false)} title={DISPLAY.TEXT.LOGOUT} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_LOGOUT}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowLogoutPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.LOGOUT} onClick={terminateSession} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Profile Details Popup */}
            <Popup isOpen={showProfilePopup} onClose={()=> setShwoProfilePopup(false)} title={DISPLAY.TEXT.PROFILE} borderColor={theme.info}>
                <div style={{display: 'flex', gap: theme.spacing, alignItems: 'center', marginBottom: theme.marginL}}>
                    <Avatar name={name} size='lg'/>
                    <div>
                        <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>{name}</Text>
                        <Text color={theme.text} fontSize={theme.textSize}>{email}</Text>
                    </div>
                </div>
                <Divider borderColor={theme.border} borderWidth='1px' />
                <div style={{marginBottom: theme.marginL}}>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500} my={theme.marginL}>{DISPLAY.TEXT.SESSION_DETAILS}</Text>
                    <div style={{border: `2px solid ${theme.border}`, borderRadius: theme.radius, padding: theme.paddingL}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: theme.paddingL}}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.hoverBg, borderRadius: theme.radius, padding: theme.paddingL}}>
                                {deviceType === 'desktop' ? <IoDesktopOutline style={{height: '25px', width: '25px', color: theme.text}}/> : <HiMiniDevicePhoneMobile style={{height: '25px', width: '25px', color: theme.text}}/>}
                            </div>
                            
                            <div>
                                <Text color={theme.text} fontSize={theme.textSize}>{device}</Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>{DISPLAY.TEXT.EXPIRY}: {new Date(decodeToken(getAuthToken()).exp * 1000).toLocaleString('en-GB')}</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </Popup>
        </div>
    );
}
