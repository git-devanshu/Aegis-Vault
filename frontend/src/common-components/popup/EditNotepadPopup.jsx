import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Textarea, Grid } from '@chakra-ui/react';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";


export default function EditNotepadPopup({isOpen, onClose, notepad, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [noteData, setNoteData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setNoteData(notepad?.data || '');
    }, [notepad]);

    const saveNotepad = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            const updatedNotepad = {
                data: noteData,
                updatedAt: Date.now()
            };
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedNotepad), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'NOTEPAD',
                    collectionData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshCollections(!refreshCollections);
                    onClose(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.NOTEPAD} bg={theme.bg} borderColor={theme.success}>
            <Textarea
                value={noteData}
                placeholder={DISPLAY.TEXT.WRITE_HERE}
                onChange={e => setNoteData(e.target.value)}
                resize='vertical'
                minHeight='350px'
                maxLength={50000}
                backgroundColor={theme.bg}
                border={`1px solid ${theme.border}`}
                borderRadius={`calc(2 * ${theme.radius})`}
                color={theme.text}
                _hover={{borderColor: theme.border, boxShadow: 'none'}}
                _focus={{borderColor: theme.primary, boxShadow: 'none'}}
            />

            <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.CLEAR_ALL} onClick={ (e)=> setNoteData('') } disabled={isLoading} />
                <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveNotepad} isLoading={isLoading} disabled={isLoading} actionType='primary' />
            </Grid>
        </Popup>
    );
}