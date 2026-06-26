import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Flex, Text } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { normalizeWebsite } from '../../utility/helpers';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';
import ToggleSwitch from '../form/ToggleSwitch';


export default function AddEditPasswordPopup({isOpen, onClose, editFlow=false, labels=[], passwordData=null, refresh, setRefresh}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [formData, setFormData] = useState({
        id: passwordData?.id || null,
        platform: passwordData?.platform || '',
        site: passwordData?.site || '',
        username: passwordData?.username || '',
        password: passwordData?.password || '',
        labelIndex: passwordData?.labelIndex || 0
    });

    const [accessThroughExtension, setAccessThroughExtension] = useState(passwordData?.accessThroughExtension);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        setFormData({
            id: passwordData?.id || null,
            platform: passwordData?.platform || '',
            site: passwordData?.site || '',
            username: passwordData?.username || '',
            password: passwordData?.password || '',
            labelIndex: passwordData?.labelIndex || 0
        });
        setAccessThroughExtension(passwordData?.accessThroughExtension);
    }, [passwordData, isOpen]);

    const handleChange = (e) =>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    }

    const addPassword = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const data = {
                platform: formData.platform,
                site: normalizeWebsite(formData.site),
                username: formData.username,
                password: formData.password
            }
            const {encryptedData: passwordData, nonce} = await encryptData(JSON.stringify(data), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/pm/passwords',
                data: {passwordData, nonce, labelIndex: formData.labelIndex, accessThroughExtension},
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    onClose(true);
                    setRefresh(!refresh);
                    setFormData({
                        id: null,
                        platform: '',
                        site: '',
                        username: '',
                        password: '',
                        labelIndex: 0
                    });
                }
            })
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    const editPassword = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const data = {
                platform: formData.platform,
                site: normalizeWebsite(formData.site),
                username: formData.username,
                password: formData.password
            }
            const {encryptedData: passwordData, nonce} = await encryptData(JSON.stringify(data), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pm/passwords',
                data: {id: formData.id, passwordData, nonce, labelIndex: formData.labelIndex, accessThroughExtension},
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    onClose(true);
                    setRefresh(!refresh);
                    setFormData({
                        id: null,
                        platform: '',
                        site: '',
                        username: '',
                        password: '',
                        labelIndex: 0
                    });
                }
            })
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={editFlow ? DISPLAY.TEXT.EDIT_PASSWORD : DISPLAY.TEXT.ADD_PASSWORD} bg={theme.bg} borderColor={theme.success}>
            <form>
                <InputBox type='text' label={DISPLAY.LABELS.PLATFORM} name='platform' value={formData.platform} onChange={handleChange} required maxLen={30}/>
                <InputBox type='text' label={DISPLAY.LABELS.SITE} placeholder='abcd.com' name='site' value={formData.site} onChange={handleChange} required maxLen={100}/>
                <InputBox type='text' label={DISPLAY.LABELS.USERNAME} name='username' value={formData.username} onChange={handleChange} required maxLen={50}/>
                <InputBox type='text' label={DISPLAY.LABELS.PASSWORD} name='password' value={formData.password} onChange={handleChange} required maxLen={50}/>

                <Dropdown value={formData.labelIndex}
                    onChange={(e)=> setFormData({...formData, labelIndex:Number(e.target.value)})}
                    options={
                        labels.map((label, index)=>{
                            if(label.startsWith('*~Rem*')){
                                return null;
                            }
                            return {
                                label: DISPLAY.PASSWORD_LABELS[label] || label,
                                value: index
                            };
                        }).filter(Boolean)
                    }
                />

                <Flex align='center' justify='space-between' marginTop='-5px'>
                    <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                        {DISPLAY.LABELS.ACCESS_THROUGH_EXTENSION}
                    </Text>
                    <ToggleSwitch value={accessThroughExtension} onChange={setAccessThroughExtension}/>
                </Flex>
                
                <ActionButton name={editFlow ? DISPLAY.BUTTONS.SAVE_CHANGES : DISPLAY.BUTTONS.ADD_PASSWORD}
                    actionType='primary'
                    isLoading={isLoading}
                    disabled={isLoading}
                    onClick={editFlow ? editPassword : addPassword}
                    customStyle={{marginBottom: theme.marginS, marginTop: theme.spacing}}
                />
            </form>
        </Popup>
    );
}
