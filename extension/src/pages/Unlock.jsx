import {useState} from "react";
import {Box, CloseButton, Flex, Heading, IconButton, Spacer, Text} from "@chakra-ui/react";
import { ThreeDot } from "react-loading-indicators";

import {theme} from "../themes/theme";
import useLanguage from "../hooks/useLanguage";
import {useAppContext} from "../context/AppContext";
import {apiRequest} from "../utility/api";
import {createHash, decryptData, decryptMasterKey} from "../utility/crypto";
import { IoSettingsOutline } from "react-icons/io5";

import PinInputBox from "../components/form/PinInputBox";
import ActionButton from "../components/form/ActionButton";
import SettingsModal from "./SettingsModal";



export default function Unlock(){
    const {DISPLAY} = useLanguage();

    const {
        user,
        setMasterKey,
        setPasswordVault,
        setIsUnlocked
    } = useAppContext();

    const [securityPin, setSecurityPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleUnlock = async(e) =>{
        e.preventDefault();
        if(isLoading) return;
        try{
            setIsLoading(true);

            const saltResponse = await apiRequest({
                method: "GET",
                endpoint: `/api/ss/get-user-salt/${user.email}`,
                secure: false
            });

            const pinHash = await createHash(
                securityPin,
                saltResponse.data.userSalt
            );

            const verifyResponse = await apiRequest({
                method: "POST",
                endpoint: "/api/ss/verify-pin",
                data: {pinHash}
            });

            const masterKey = await decryptMasterKey(
                verifyResponse.data.pinEncryptedKey,
                securityPin,
                verifyResponse.data.pinSalt,
                verifyResponse.data.pinNonce
            );

            const passwordResponse = await apiRequest({
                method: "GET",
                endpoint: "/api/pm/passwords"
            });

            const passwordVault = [];
            for(const password of passwordResponse.data.dataArray){
                const decryptedPassword = JSON.parse(await decryptData(password.passwordData, password.nonce, masterKey));
                decryptedPassword.id = password._id;
                passwordVault.push(decryptedPassword);
            }

            setMasterKey(masterKey);
            setPasswordVault(passwordVault);
            setIsUnlocked(true);
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
            <Flex direction='column' justify='center' align='center' gap={theme.marginL} paddingY={theme.spacing} backgroundColor={theme.bg}>
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
                <Text color={theme.text} fontSize={theme.headingSize} textAlign="center" marginBottom={theme.marginS}>
                    {DISPLAY.LABELS.ENTER_PIN}
                </Text>

                <Text fontSize={theme.textSize} color={theme.textSecondary} textAlign="center" marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.PIN_REQUIRED}
                </Text>

                <form>
                    <PinInputBox
                        value={securityPin}
                        onChange={setSecurityPin}
                        required={true}
                        mask={true}
                        autoFocus={true}
                    />

                    <ActionButton
                        name={DISPLAY.BUTTONS.UNLOCK}
                        actionType="primary"
                        isLoading={isLoading}
                        disabled={isLoading}
                        onClick={handleUnlock}
                        customStyle={{marginBottom: theme.marginS}}
                    />
                </form>
            </Box>

            {showSettingsModal && <SettingsModal setShowModal={setShowSettingsModal} />}
        </div>
    );
}
