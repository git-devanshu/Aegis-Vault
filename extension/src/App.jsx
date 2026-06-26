import {useEffect} from "react";

import {useAppContext} from "./context/AppContext";
import {getAuthToken, getAuthUser} from "./utility/token";

import Login from "./pages/Login";
import Unlock from "./pages/Unlock";
import Home from "./pages/Home";


export default function App(){

    const {
        isAuthenticated,
        setIsAuthenticated,

        user,
        setUser,

        isUnlocked
    } = useAppContext();

    useEffect(()=>{
        checkAuthentication();
    }, []);

    const checkAuthentication = async() =>{

        const token = await getAuthToken();
    
        if(!token){
            setIsAuthenticated(false);
            return;
        }
    
        const authUser = await getAuthUser();
    
        if(!authUser){
            setIsAuthenticated(false);
            return;
        }
    
        setUser(authUser);
    
        setIsAuthenticated(true);
    
    };

    if(isAuthenticated === null){
        return null;
    }

    if(!isAuthenticated){
        return <Login />;
    }

    if(!isUnlocked){
        return <Unlock />;
    }

    return <Home />;

}