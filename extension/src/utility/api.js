import axios from "axios";

import {getAuthToken, removeAuthToken, removeAuthUser} from "./token";
import { getStorage } from "./helpers";


const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL
});


export async function apiRequest({ method = "GET", endpoint, data, secure = true }){
    const config = {
        method,
        url: endpoint,
        data,
        headers: {
            "x-aegis-language": await getStorage("aegis-language") || "en"
        }
    };

    if(secure){
        const token = await getAuthToken();
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    try{
        return await api(config);
    }
    catch(error){
        if(error?.response?.data?.relogin){
            await removeAuthToken();
            await removeAuthUser();
            window.location.reload();
            return;
        }

        throw error;
    }
}
