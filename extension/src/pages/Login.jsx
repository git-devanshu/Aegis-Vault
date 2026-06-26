import {useState} from "react";
import {Flex, Heading, Text} from "@chakra-ui/react";
import {theme} from "../themes/theme";
import {createHash} from "../utility/crypto";
import {getAuthUser, saveAuthToken} from "../utility/token";
import {apiRequest} from "../utility/api";
import {useAppContext} from "../context/AppContext";
import useLanguage from "../hooks/useLanguage";

import { ThreeDot } from "react-loading-indicators";

import InputBox from "../components/form/InputBox";
import ActionButton from "../components/form/ActionButton";
import { getDevice } from "../utility/helpers";


export default function Login(){
    const {DISPLAY, RESPONSES} = useLanguage();

    const {setUser, setIsAuthenticated} = useAppContext();

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    const [isLoading, setIsLoading] = useState(false);

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
        <div className="auth-page">
            <div className="auth-container">
                <Heading color={theme.primary} size="sm" textAlign="center" marginBottom={theme.marginL}>
                    ⛉ Aegis
                </Heading>

                <Text color={theme.text} fontSize={theme.headingSize} textAlign="center" marginBottom={theme.spacing}>
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
                        customStyle={{marginBottom: theme.marginS}}
                    />
                </form>
            </div>
        </div>
    );
}
