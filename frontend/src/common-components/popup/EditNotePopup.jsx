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
        color: '#0000ff',
        data: ''
    });

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
                        color: selectedNote?.color || '#0000ff',
                        data: decryptedNote.data || ''
                    });
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
                    color: note.color,
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

    const basicColors = [
        '#ff0000',
        '#ffff00',
        '#ffa500',
        '#0000ff',
        '#00ffff',
        '#008000',
        '#00ff00',
        '#808080',
        '#a52a2a',
        '#000000',
        '#ffffff'
    ];

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.EDIT_NOTE} bg={theme.bg} borderColor={theme.success}>
                <form style={{marginTop: theme.spacing}}>
                    <InputBox type='text' label={DISPLAY.LABELS.TITLE} name='title' value={note.title} onChange={handleChange} maxLen={60} />

                    <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginY='-10px'>
                        <Box>
                            <InputBox type='text' label={DISPLAY.LABELS.TAG} name='tag' value={note.tag} onChange={handleChange} maxLen={20} />

                            <Dropdown value={note.priority} onChange={e => setNote({...note, priority: e.target.value})}
                                options={[
                                    {label: DISPLAY.TEXT.LOW, value: 'low'},
                                    {label: DISPLAY.TEXT.MEDIUM, value: 'medium'},
                                    {label: DISPLAY.TEXT.HIGH, value: 'high'}
                                ]}
                            />
                        </Box>

                        <Box marginTop={theme.marginL} marginBottom={theme.spacing} padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} position='relative'>
                            <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{position:'absolute', top:'-12px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1}}>
                                {DISPLAY.LABELS.CATEGORY_COLOR}
                            </Text>

                            <div style={{display:'flex', gap:theme.paddingS, flexWrap:'wrap', marginTop:theme.marginL}}>
                                {
                                    basicColors.map(color =>
                                        <div
                                            key={color}
                                            onClick={()=> setNote({...note, color})}
                                            style={{
                                                width:'30px',
                                                height:'30px',
                                                borderRadius:'10px',
                                                backgroundColor:color,
                                                cursor:'pointer',
                                                border: note.color === color
                                                    ? `3px solid ${theme.primary}`
                                                    : `1px solid ${theme.border}`
                                            }}
                                        />
                                    )
                                }
                            </div>
                        </Box>
                    </Grid>

                    <Textarea
                        name='data'
                        value={note.data}
                        placeholder={DISPLAY.TEXT.WRITE_HERE}
                        onChange={handleChange}
                        resize='vertical'
                        height='280px'
                        maxLength={25000}
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