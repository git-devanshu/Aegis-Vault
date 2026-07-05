import { useEffect, useRef } from "react";
import { useAppContext } from "./context/AppContext";
import { getAuthToken, getAuthUser, removeAuthToken, removeAuthUser } from "./utility/token";
import { decodeToken } from "./utility/helpers";

import Login from "./pages/Login";
import Unlock from "./pages/Unlock";
import Home from "./pages/Home";


export default function App() {
    const { isAuthenticated, setIsAuthenticated, setUser, isUnlocked, clearVault } = useAppContext();

    const appContainerRef = useRef(null);

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = await getAuthToken();
            const decoded = decodeToken(token);
            const authUser = await getAuthUser();
    
            if (!authUser || !decoded || !decoded.id || !decoded.sessionId || !decoded.email || !decoded.name || !decoded.privilege) {
                setIsAuthenticated(false);
                await removeAuthToken();
                await removeAuthUser();
                return;
            }
    
            setUser(authUser);
            setIsAuthenticated(true);
        };
        checkAuthentication();
    }, []);

    useEffect(() => {
        const handleSecurityTriggers = (event) => {
            // Wipe memory if the wrapper tells us it was opened or closed
            if (event.data && (event.data.type === "AEGIS_PANEL_OPENED" || event.data.type === "AEGIS_CLOSE_REQUEST")) {
                if (typeof clearVault === "function") clearVault();
            }
        };

        // Wipe memory if the user changes tabs or minimizes Chrome entirely
        const handleTabVisibilityChange = () => {
            if (document.hidden && typeof clearVault === "function") clearVault();
        };

        window.addEventListener("message", handleSecurityTriggers);
        document.addEventListener("visibilitychange", handleTabVisibilityChange);
        
        return () => {
            window.removeEventListener("message", handleSecurityTriggers);
            document.removeEventListener("visibilitychange", handleTabVisibilityChange);
        };
    }, [clearVault]);


    // Dynamic Height Resizer Logic
    useEffect(() => {
        if (isAuthenticated === null || !appContainerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.target.scrollHeight;
                window.parent.postMessage({ type: "AEGIS_RESIZE", height }, "*");
            }
        });

        resizeObserver.observe(appContainerRef.current);
        return () => resizeObserver.disconnect();
    }, [isAuthenticated, isUnlocked]); 
    

    if (isAuthenticated === null) return null;

    return (
        <div ref={appContainerRef} style={{ width: "100%", height: "fit-content" }}>
            {!isAuthenticated && <Login />}
            {isAuthenticated && !isUnlocked && <Unlock />}
            {isAuthenticated && isUnlocked && <Home />}
        </div>
    );
}
