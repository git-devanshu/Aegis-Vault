import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Textarea, ButtonGroup } from '@chakra-ui/react';
import { BiExport, BiImport, BiEraser } from 'react-icons/bi';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";


export default function EditNotepadPopup({isOpen, onClose, notepad, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [noteData, setNoteData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setNoteData(notepad?.data || '');
    }, [notepad, isOpen]);

    const exportToQuicksave = async(e) =>{
        localStorage.setItem('aegis-saved-notes', JSON.stringify(noteData));
        toast.success(TOASTS.QUICK_SAVE.NOTE_SAVED);
    }

    const importFromQuicksave = async(e) =>{
        if(!JSON.parse(localStorage.getItem('aegis-saved-notes'))?.length){
            toast.error(TOASTS.QUICK_SAVE.NO_DATA_AVAILABLE);
        }
        setNoteData(JSON.parse(localStorage.getItem('aegis-saved-notes')));
    }

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
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.NOTEPAD} bg={theme.bg} borderColor={theme.success} takeFullHeight={true}>
            <Textarea
                value={noteData}
                placeholder={DISPLAY.TEXT.WRITE_HERE}
                onChange={e => setNoteData(e.target.value)}
                resize='vertical'
                height='calc(100% - 50px)'
                maxLength={50000}
                backgroundColor={theme.bg}
                border={`1px solid ${theme.border}`}
                borderRadius={`calc(2 * ${theme.radius})`}
                color={theme.text}
                _hover={{borderColor: theme.border, boxShadow: 'none'}}
                _focus={{borderColor: theme.primary, boxShadow: 'none'}}
            />

            <ButtonGroup gap={theme.paddingS} width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <CircleIconButton tooltip={DISPLAY.TOOLTIPS.IMPORT_FROM_QUICKSAVE} onClick={importFromQuicksave} icon={<BiImport/>} iconSize="18px" />
                <CircleIconButton tooltip={DISPLAY.TOOLTIPS.SAVE_TO_QUICKSAVE} onClick={exportToQuicksave} icon={<BiExport/>} iconSize="18px" />
                <CircleIconButton tooltip={DISPLAY.TOOLTIPS.CLEAR_NOTEPAD} onClick={(e)=> setNoteData('')} icon={<BiEraser/>} iconSize="18px" />
                <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveNotepad} isLoading={isLoading} disabled={isLoading} actionType='primary' />
            </ButtonGroup>
        </Popup>
    );
}
