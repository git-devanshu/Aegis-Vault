import {useEffect, useMemo, useState} from "react";
import { Box, Divider, Flex, Heading, IconButton, Input, Text } from "@chakra-ui/react";
import {theme} from "../themes/theme";
import {useAppContext} from "../context/AppContext";
import useLanguage from "../hooks/useLanguage";
import useTheme from "../hooks/useTheme";
import {getCurrentHostname, decodeToken} from "../utility/helpers";
import {autofillPassword} from "../utility/autofill";
import { getAuthToken, removeAuthToken, removeAuthUser } from "../utility/token";
import {apiRequest} from "../utility/api";
import { ThreeDot } from "react-loading-indicators";

import {MdOutlineLightMode, MdOutlineDarkMode} from 'react-icons/md';
import {LuSquareArrowDownLeft} from 'react-icons/lu';

import InputBox from "../components/form/InputBox";
import TitleBar from "../components/TitleBar";
import ActionButton from "../components/form/ActionButton";
import CircleIconButton from "../components/form/CircleIconButton";


export default function Home(){
    const {DISPLAY} = useLanguage();
    const {passwordVault, setMasterKey, setPasswordVault, setUser, setIsUnlocked, setIsAuthenticated} = useAppContext();
    const {aegisTheme, toggleAegisTheme} = useTheme();

    const [currentHostname, setCurrentHostname] = useState("");
    const [websiteMatches, setWebsiteMatches] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState("");

    useEffect(()=>{
        async function detectWebsite(){
            const hostname = await getCurrentHostname();
            setCurrentHostname(hostname);
            if(!hostname){
                setWebsiteMatches([]);
                return;
            }
            const matches = passwordVault.filter(password=> hostname.endsWith(password.site));
            setWebsiteMatches(matches);
        }

        detectWebsite();
    }, [passwordVault]);

    const searchResults = useMemo(()=>{
        if(!search.trim()){
            return [];
        }
        const query = search.toLowerCase();
        return passwordVault.filter(password=>{
            return (
                password.platform?.toLowerCase().includes(query) || password.site?.toLowerCase().includes(query)
            );
        });
    }, [search, passwordVault]);
    

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


    const renderCard = (item)=>{
        return(
            <Flex justify="space-between" align='center' key={item.id}
                border={`1px solid ${theme.border}`} borderRadius={theme.radius}
                paddingX={theme.paddingL} marginBottom={theme.marginS}
                paddingY='3px'
                cursor="pointer" background={theme.cardBg}
            >
                <Box>
                    <Text color={theme.text} fontSize={theme.text} fontWeight={500}>
                        {item.platform}
                    </Text>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {item.username}
                    </Text>
                </Box>
                <IconButton size='lg' onClick={()=> autofillPassword(item.password)} icon={<LuSquareArrowDownLeft/>} backgroundColor='transparent' color={theme.textSecondary} _hover={{backgroundColor: 'transparent', color: theme.text}}/>
            </Flex>
        );
    };


    if(isLoading){
        return(
            <Flex direction='column' justify='center' align='center' gap={theme.marginL} paddingY={theme.spacing}>
                <ThreeDot variant="brick-stack" color={theme.primary} size="medium" />
                <Text color={theme.text} fontSize={theme.headingSize}>
                    {DISPLAY.TEXT.LOADING}
                </Text>
            </Flex>
        )
    }


    return(
        <div className="auth-page">
            <div className="auth-container">
                <TitleBar>
                    <CircleIconButton icon={aegisTheme === 'dark' ? <MdOutlineLightMode/> : <MdOutlineDarkMode/>} tooltip={DISPLAY.TEXT.THEME} onClick={toggleAegisTheme}/>
                    <ActionButton name={DISPLAY.BUTTONS.LOGOUT} onClick={logoutFromExtension} customStyle={{width: 'fit-content'}} />
                </TitleBar>
                <Divider borderWidth='1px' borderColor={theme.border} marginBottom={theme.marginL} />

                {websiteMatches.length > 0 && (
                    <>
                        <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginS}>
                            {DISPLAY.HEADINGS.SUGGESTED_ACCOUNTS}
                        </Text>
                        {websiteMatches.map(renderCard)}
                    </>
                )}

                {websiteMatches.length === 0 && currentHostname && (
                    <div style={{width: '100%', display: 'flex', marginTop: theme.marginS, marginBottom: theme.marginL, justifyContent: 'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>{DISPLAY.TEXT.NO_PASSWORD_FOUND}</Text>
                    </div>
                )}

                <Divider borderWidth='1px' borderColor={theme.border} marginY={theme.marginL} />

                <Input variant='flushed' size='sm' fontSize={theme.textSize} color={theme.text}
                    placeholder={`🔎︎ ${DISPLAY.LABELS.SEARCH}`} type='text' name='search' value={search} onChange={(e)=> setSearch(e.target.value)}
                    _focus={{
                        borderColor:theme.primary,
                        boxShadow: 'none'
                    }}
                    marginBottom={theme.marginL}
                />
                
                {searchResults.map(renderCard)}
            </div>
        </div>
    );
}
