import axios from 'axios';
import toast from 'react-hot-toast';
import { getBaseURL, getAuthToken, removeAuthToken } from './helpers';
import { getLanguageConstants } from '../hooks/useLanguage';

const { TOASTS } = getLanguageConstants();

export async function apiRequest({method='GET', endpoint='', data={}, secure=true, headers={}, toastId, successCode=200, setIsLoading=null, onSuccess=null, defaultSuccessToast=true, onError=null}) {
    try{
        const res = await axios({
            method,
            url: getBaseURL() + endpoint,
            data,
            headers: secure ? {
                'x-aegis-language': localStorage.getItem('aegis-language') || 'en',
                Authorization:`Bearer ${getAuthToken()}`,
                ...headers
            } : {
                'x-aegis-language': localStorage.getItem('aegis-language') || 'en',
                ...headers
            }
        });
        if(res.status === successCode) {
            if(defaultSuccessToast){
                toast.success(res.data?.message || TOASTS.COMMON.SUCCESS, {id:toastId});
            }
            if(onSuccess){
                onSuccess(res);
            }
        }
        return res;
    }
    catch(error){
        console.log(error);
        toast.error(error?.response?.data?.message || TOASTS.COMMON.SOMETHING_WENT_WRONG, {id:toastId});
        if(error?.response?.data?.relogin){
            removeAuthToken();
            setTimeout(()=>{
                window.location.href = '/login';
            }, 1500); 
        }
        if(onError){
            onError(error);
        }
    }
    finally{
        if(setIsLoading){
            setIsLoading(false);
        }
    }
}


export function validateAndStartLoading({e, loadingMessage, setIsLoading}) {
    if(e){
        e.preventDefault();
        if(!e.target.form.reportValidity()){
            return;
        }
    }
    const toastId = toast.loading(loadingMessage);
    setIsLoading(true);
    return toastId;
}

