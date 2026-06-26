import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { decryptData, encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Box, Grid, Text, Textarea, ButtonGroup } from '@chakra-ui/react';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';
import PriorityIcon from '../../pages/planning-manager/PriorityIcon';
import ColorPicker from '../form/ColorPicker';


export default function EditNotePopup({isOpen, onClose, selectedNote, noteMetadata, refreshNoteMetadata, setRefreshNoteMetadata}) {
    if(!selectedNote) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);

    const [note, setNote] = useState({
        title: '',
        priority: 'medium',
        tag: '',
        data: ''
    });

    const [categoryColor, setCategoryColor] = useState('#0000ff');

    useEffect(() =>{
        if(!isOpen || !masterKey || !selectedNote.noteKey) return;
        async function fetchNote(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/pl/note/${selectedNote.noteKey}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedNote = JSON.parse(await decryptData(res.data.note.noteData, res.data.note.nonce, masterKey));
                    setNote({
                        title: selectedNote?.title || '',
                        priority: selectedNote?.priority || 'medium',
                        tag: selectedNote?.tag || '',
                        data: decryptedNote.data || ''
                    });
                    setCategoryColor(selectedNote?.color || '#0000ff');
                },
                defaultSuccessToast: false
            });
        }
        fetchNote();
    }, [isOpen, selectedNote, masterKey]);


    const saveNote = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const updatedMetadata = noteMetadata.map(item =>{
                if(item.noteKey !== selectedNote.noteKey) return item;
                return {
                    title: note.title.trim(),
                    priority: note.priority,
                    tag: note.tag.trim(),
                    color: categoryColor,
                    noteKey: selectedNote.noteKey
                };
            });
            const notePayload = {
                data: note.data,
                updatedAt: new Date().toISOString()
            };
            const {encryptedData: metadataData, nonce: metadataNonce} = await encryptData(JSON.stringify(updatedMetadata), masterKey);
            const {encryptedData: noteData, nonce} = await encryptData(JSON.stringify(notePayload), masterKey);

            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/note',
                data: {
                    noteKey: selectedNote.noteKey,
                    noteData,
                    nonce,
                    metadataData,
                    metadataNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshNoteMetadata(!refreshNoteMetadata);
                    onClose(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
            onClose(false);
        }
    }


    const deleteNote = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            const updatedMetadata = noteMetadata.filter(item => item.noteKey !== selectedNote.noteKey);
            const {encryptedData: metadataData, nonce} = await encryptData(JSON.stringify(updatedMetadata), masterKey);
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/pl/note/${selectedNote.noteKey}`,
                data: {
                    metadataData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshNoteMetadata(!refreshNoteMetadata);
                    setShowDeletePopup(false);
                    onClose(false);
                },
                onError: () =>{
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

    const handleChange = (e) =>{
        setNote({
            ...note,
            [e.target.name]: e.target.value
        });
    }

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.EDIT_NOTE} bg={theme.bg} borderColor={theme.success} takeFullHeight={true}>
                <form style={{height: '100%'}}>
                    <InputBox type='text' label={DISPLAY.LABELS.TITLE} name='title' value={note.title} onChange={handleChange} maxLen={60} />

                    <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginY='-10px'>
                        <InputBox type='text' label={DISPLAY.LABELS.TAG} name='tag' value={note.tag} onChange={handleChange} maxLen={20} />
                        <ColorPicker label={DISPLAY.LABELS.CATEGORY_COLOR} value={categoryColor} onChange={setCategoryColor} />
                    </Grid>

                    <Grid templateColumns='1fr 1fr' gap={theme.paddingL} alignItems='center' marginY='-10px'>
                        <Dropdown value={note.priority} onChange={e => setNote({...note, priority: e.target.value})}
                            options={[
                                {label: DISPLAY.TEXT.LOW, value: 'low'},
                                {label: DISPLAY.TEXT.MEDIUM, value: 'medium'},
                                {label: DISPLAY.TEXT.HIGH, value: 'high'}
                            ]}
                        />
                        <PriorityIcon priority={note.priority}/>
                    </Grid>

                    <Textarea
                        name='data'
                        value={note.data}
                        placeholder={DISPLAY.TEXT.WRITE_HERE}
                        onChange={handleChange}
                        resize='vertical'
                        height='280px'
                        maxLength={50000}
                        backgroundColor={theme.bg}
                        border={`1px solid ${theme.border}`}
                        borderRadius={`calc(2 * ${theme.radius})`}
                        color={theme.text}
                        _hover={{borderColor: theme.border, boxShadow: 'none'}}
                        _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                    />

                    <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                        <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={() => setShowDeletePopup(true)} disabled={isLoading} />
                        <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} actionType='primary' onClick={saveNote} isLoading={isLoading} disabled={isLoading || !note.title.trim() || !note.data.trim()} />
                    </ButtonGroup>
                </form>
            </Popup>

            {/* Delete Note Popup */}
            <Popup isOpen={showDeletePopup} onClose={()=> setShowDeletePopup(false)} title={DISPLAY.TEXT.DELETE_NOTE} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_NOTE}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeletePopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteNote} actionType='primary' />
                </ButtonGroup>
            </Popup>
        </>
    );
}