import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { decryptData, encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Text, Textarea, Grid, ButtonGroup } from '@chakra-ui/react';

import Popup from '../popup/Popup';
import ActionButton from '../form/ActionButton';


export default function EditJournalPopup({isOpen, onClose, selectedJournal, journalMetadata, refreshJournalMetadata, setRefreshJournalMetadata}) {
    if(!selectedJournal) return null;
    
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [journalContent, setJournalContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    useEffect(() =>{
        if(!isOpen || !masterKey || !selectedJournal.journalKey) return;
        async function fetchJournal(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/pl/journal/${selectedJournal.journalKey}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedJournal = await decryptData(res.data.journal.journalData, res.data.journal.nonce, masterKey);
                    setJournalContent(decryptedJournal);
                },
                defaultSuccessToast: false
            });
        }
        fetchJournal();
    }, [isOpen, selectedJournal, masterKey]);

    const saveJournal = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            const {encryptedData: journalData, nonce} = await encryptData(journalContent, masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/journal',
                data: { 
                    journalKey: selectedJournal.journalKey, 
                    journalData, 
                    nonce 
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
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

    const deleteJournal = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            const updatedMetadata = journalMetadata.filter(journal => journal.journalKey !== selectedJournal.journalKey);
            const {encryptedData: metadataData, nonce} = await encryptData(JSON.stringify(updatedMetadata), masterKey);
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/pl/journal/${selectedJournal.journalKey}`,
                data: {
                    metadataData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshJournalMetadata(!refreshJournalMetadata);
                    setShowDeletePopup(false);
                    onClose(false);
                },
                onError: (err)=> {
                    setShowDeletePopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
            setShowDeletePopup(false);
        }
    }

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.EDIT_JOURNAL} bg={theme.bg} borderColor={theme.success} takeFullHeight={true}>
                <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                    { new Date(selectedJournal.date).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'}) }
                </Text>

                <Textarea
                    value={journalContent}
                    onChange={e => setJournalContent(e.target.value)}
                    resize='vertical'
                    height='calc(100% - 89px)'
                    backgroundColor={theme.bg}
                    border={`1px solid ${theme.border}`}
                    borderRadius={`calc(2 * ${theme.radius})`}
                    color={theme.text}
                    _hover={{borderColor: theme.border, boxShadow: 'none'}}
                    _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                />

                <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={() => setShowDeletePopup(true)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} actionType='primary' onClick={saveJournal} isLoading={isLoading} disabled={isLoading || !journalContent.trim()} />
                </ButtonGroup>
            </Popup>

            {/* Delete Journal Popup */}
            <Popup isOpen={showDeletePopup} onClose={()=> setShowDeletePopup(false)} title={DISPLAY.TEXT.DELETE_JOURNAL} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_JOURNAL}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeletePopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteJournal} actionType='primary' />
                </ButtonGroup>
            </Popup>
        </>
    );
}
