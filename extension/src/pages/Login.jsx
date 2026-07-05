import {useState} from "react";
import {Box, CloseButton, Flex, Heading, IconButton, Spacer, Text} from "@chakra-ui/react";
import {theme} from "../themes/theme";
import {createHash} from "../utility/crypto";
import {getAuthUser, saveAuthToken} from "../utility/token";
import {apiRequest} from "../utility/api";
import {useAppContext} from "../context/AppContext";
import useLanguage from "../hooks/useLanguage";
import { getDevice } from "../utility/helpers";
import { IoSettingsOutline } from "react-icons/io5";

import { ThreeDot } from "react-loading-indicators";

import InputBox from "../components/form/InputBox";
import ActionButton from "../components/form/ActionButton";
import SettingsModal from "./SettingsModal";


export default function Login(){
    const {DISPLAY} = useLanguage();

    const {setUser, setIsAuthenticated} = useAppContext();

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    };

    const handleLogin = async(e) =>{
        e.preventDefault();
        if(isLoading) return;
        try{
            setIsLoading(true);
            const saltResponse = await apiRequest({
                method: "GET",
                endpoint: `/api/ss/get-user-salt/${credentials.email}`,
                secure: false
            });

            const passwordHash = await createHash(
                credentials.password,
                saltResponse.data.userSalt
            );

            const loginResponse = await apiRequest({
                method: "POST",
                endpoint: "/api/ss/login",
                secure: false,
                data:{
                    email: credentials.email,
                    passwordHash,
                    deviceType: "extension",
                    device: getDevice()
                }
            });

            await saveAuthToken(loginResponse.data.token);
            setUser(await getAuthUser());
            setIsAuthenticated(true);
        }
        catch(error){
            console.log(error);
        }
        finally{
            setIsLoading(false);
        }
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
                <Text color={theme.text} fontSize={theme.headingSize} textAlign="center" marginBottom={theme.marginL}>
                    {DISPLAY.LABELS.WELCOME}
                </Text>

                <form>
                    <InputBox
                        label={DISPLAY.LABELS.EMAIL}
                        type="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        required={true}
                        maxLen={30}
                    />

                    <InputBox
                        label={DISPLAY.LABELS.PASSWORD}
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required={true}
                        maxLen={30}
                    />

                    <ActionButton
                        name={DISPLAY.BUTTONS.LOGIN}
                        onClick={handleLogin}
                        isLoading={isLoading}
                        disabled={isLoading}
                        actionType="primary"
                    />

                    <Text color={theme.textSecondary} fontSize={theme.textSize} marginTop={theme.marginL} marginBottom={theme.marginL} textAlign='center'>
                        {DISPLAY.TEXT.NEW_USER} <span onClick={()=>{ chrome.tabs.create({ url: import.meta.env.VITE_AEGIS_CLIENT_URL }) }} style={{textDecoration: 'underline', cursor: 'pointer'}}>{DISPLAY.LABELS.SIGNUP}</span>
                    </Text>
                </form>
            </Box>

            {showSettingsModal && <SettingsModal setShowModal={setShowSettingsModal} />}
        </div>
    );
}
