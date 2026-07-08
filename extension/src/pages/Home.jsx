import {useEffect, useMemo, useState} from "react";
import { Box, CloseButton, Divider, Flex, Heading, IconButton, Input, InputGroup, InputLeftElement, Spacer, Text } from "@chakra-ui/react";
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
import {IoSettingsOutline} from "react-icons/io5";
import { IoIosArrowDropright } from "react-icons/io";

import InputBox from "../components/form/InputBox";
import TitleBar from "../components/TitleBar";
import ActionButton from "../components/form/ActionButton";
import CircleIconButton from "../components/form/CircleIconButton";
import SettingsModal from "./SettingsModal";
import { SearchIcon } from "@chakra-ui/icons";


export default function Home(){
    const {DISPLAY} = useLanguage();
    const {passwordVault, setMasterKey, setPasswordVault, setUser, setIsUnlocked, setIsAuthenticated} = useAppContext();    

    const [currentHostname, setCurrentHostname] = useState("");
    const [websiteMatches, setWebsiteMatches] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [search, setSearch] = useState("");

    const [showSettingsModal, setShowSettingsModal] = useState(false);

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

    const renderCard = (item)=>{
        return(
            <Flex justify="space-between" align='center' key={item.id}
                border={`1px solid ${theme.border}`} borderRadius={theme.radius}
                paddingLeft={theme.paddingL} paddingTop='-5px' paddingBottom='-3px'
                marginBottom={theme.marginS}
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
                <IconButton size='lg' isRound={true} fontSize='24px' onClick={()=> autofillPassword(item.password)} icon={<IoIosArrowDropright/>} backgroundColor='transparent' color={theme.textSecondary} _hover={{backgroundColor: 'transparent', color: theme.text}}/>
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
        <div className="common-page" style={{position: 'relative'}}>
            <Flex align='center' paddingX={theme.paddingL} paddingY={theme.paddingS} borderBottom={`1px solid ${theme.border}`} width='100%'>
                <Heading color={theme.primary} size="sm" textAlign="center">
                    ⛉ Aegis
                </Heading>
                <Spacer/>
                <IconButton aria-label="Settings" icon={<IoSettingsOutline />} onClick={()=> setShowSettingsModal(true)} size='sm' variant='ghost' color={theme.text} _hover={{backgroundColor: 'transparent'}} />
            </Flex>

            <Box padding={theme.paddingL} width='100%'>
                {websiteMatches.length === 0 && currentHostname && 
                    <div style={{width: '100%', display: 'flex', marginTop: theme.marginL, marginBottom: theme.marginL, justifyContent: 'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>{DISPLAY.TEXT.NO_PASSWORD_FOUND}</Text>
                    </div>
                }
                {websiteMatches.length > 0 && 
                    <>
                        <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginS}>
                            {DISPLAY.HEADINGS.SUGGESTED_ACCOUNTS}
                        </Text>
                        {websiteMatches.map(renderCard)}
                    </>
                }
            </Box>

            <Divider borderWidth='1px' borderColor={theme.border} />

            <Box padding={theme.paddingL} width='100%'>
                <InputGroup marginBottom={theme.marginL} size='sm'>
                    <InputLeftElement>
                        <SearchIcon color={theme.textSecondary} size='14px' />
                    </InputLeftElement>
                    <Input variant='flushed' size='sm' fontSize={theme.textSize} color={theme.text}
                        placeholder={DISPLAY.LABELS.SEARCH} type='text' name='search' value={search} onChange={(e)=> setSearch(e.target.value)}
                        _focus={{ borderColor:theme.primary, boxShadow: 'none' }}
                    />
                </InputGroup>
                
                {searchResults.map(renderCard)}
            </Box>

            {showSettingsModal && <SettingsModal setShowModal={setShowSettingsModal} />}
        </div>
    );
}
