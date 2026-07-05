import {useEffect, useMemo, useState} from "react";
import SYSTEM_DATA from '../utility/system-data.json';
import { Box, CloseButton, Divider, Flex, Heading, IconButton, Input, Spacer, Text } from "@chakra-ui/react";
import {theme} from "../themes/theme";
import {useAppContext} from "../context/AppContext";
import useLanguage, { getLanguageIcon, getLanguageName, setLanguage } from "../hooks/useLanguage";
import useTheme from "../hooks/useTheme";
import {getCurrentHostname, decodeToken} from "../utility/helpers";
import { getAuthToken, removeAuthToken, removeAuthUser } from "../utility/token";
import {apiRequest} from "../utility/api";
import {ArrowBackIcon} from '@chakra-ui/icons';

import { ThreeDot } from "react-loading-indicators";

import ActionButton from "../components/form/ActionButton";
import ToggleSwitch from "../components/form/ToggleSwitch";
import CircleIconButton from "../components/form/CircleIconButton";


export default function SettingsModal({setShowModal}) {
    const {DISPLAY} = useLanguage();

    const {aegisTheme, setAegisTheme} = useTheme();
    const {passwordVault, setMasterKey, setPasswordVault, setUser, setIsUnlocked, isAuthenticated, setIsAuthenticated} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    const switchToDarkTheme = async(yes) =>{
        if(yes){
            setAegisTheme('dark');
        } 
        else {
            setAegisTheme('light');
        }
    }

    const logoutFromExtension = async(e) =>{
        setIsLoading(true);
        try{
            const token = await getAuthToken();
            if(token){
                const decoded = decodeToken(token);
                await apiRequest({
                    method: "DELETE",
                    endpoint: `/api/ss/user-session/${decoded.sessionId}`
                });
            }
        }
        catch(error){
            console.log(error);
        }
        finally{
            await removeAuthToken();
            await removeAuthUser();
            setMasterKey("");
            setPasswordVault([]);
            setUser(null);
            setIsUnlocked(false);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="common-page fullscreen-overlay">
            <Flex align='center' paddingRight={theme.paddingL} paddingLeft={0} paddingY={theme.paddingS} borderBottom={`1px solid ${theme.border}`} width='100%'>
                <IconButton aria-label="Back" icon={<ArrowBackIcon />} onClick={()=> setShowModal(false)} size='sm' variant='ghost' color={theme.text} _hover={{backgroundColor: 'transparent'}} />
                <Spacer/>
                <Heading color={theme.primary} size="sm" textAlign="center">
                    {DISPLAY.LABELS.SETTINGS}
                </Heading>
            </Flex>

            <Box padding={theme.paddingL} width='100%'>
                <Flex align='center' justify='space-between' marginBottom={theme.marginL}>
                    <Text color={theme.text} fontSize={theme.textSize}>
                        {DISPLAY.TEXT.DARK_THEME}
                    </Text>
                    <ToggleSwitch value={aegisTheme === 'dark' ? true : false} onChange={switchToDarkTheme} />
                </Flex>

                <Text color={theme.text} fontSize={theme.textSize}>
                    {DISPLAY.TEXT.CHANGE_LANGUAGE}
                </Text>
                <Flex gap={theme.paddingS} marginTop={theme.marginL} wrap='wrap'>
                    {
                        SYSTEM_DATA.SUPPORTED_LANGUAGES.map(language => (
                            <CircleIconButton key={language.code} icon={getLanguageIcon(language.code)} onClick={async()=>{ await setLanguage(language.code); setShowModal(false) }} tooltip={getLanguageName(language.code)} />
                        ))
                    }
                </Flex>

                {isAuthenticated && 
                    <ActionButton name={DISPLAY.BUTTONS.LOGOUT} onClick={logoutFromExtension} isLoading={isLoading} disabled={isLoading} customStyle={{marginTop: theme.marginL}} />
                }
            </Box>
        </div>
    );
}
