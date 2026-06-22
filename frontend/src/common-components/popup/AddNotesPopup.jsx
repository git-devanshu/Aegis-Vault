import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { v4 as uuid } from 'uuid';

import { Box, Grid, Text, Textarea } from '@chakra-ui/react';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';


export default function AddNotesPopup({isOpen, onClose, noteMetadata, refreshNoteMetadata, setRefreshNoteMetadata}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    const defaultNoteObject = {
        title: '',
        priority: 'medium',
        tag: '',
        color: '#0000ff',
        data: ''
    };
    const [note, setNote] = useState(defaultNoteObject);

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

    const handleChange = (e) =>{
        setNote({
            ...note,
            [e.target.name]: e.target.value
        });
    }

    const addNote = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const noteKey = uuid();
            const metadataPayload = [
                ...noteMetadata,
                {
                    title: note.title.trim(),
                    priority: note.priority,
                    tag: note.tag.trim(),
                    color: note.color,
                    noteKey
                }
            ];
            const notePayload = {
                data: note.data,
                updatedAt: new Date().toISOString()
            };
            const {encryptedData: metadataData, nonce: metadataNonce} = await encryptData(JSON.stringify(metadataPayload), masterKey);
            const {encryptedData: noteData, nonce} = await encryptData(JSON.stringify(notePayload), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/pl/note',
                data: {
                    noteKey,
                    noteData,
                    nonce,
                    metadataData,
                    metadataNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshNoteMetadata(!refreshNoteMetadata);
                    setNote(defaultNoteObject);
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

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.ADD_NOTE} bg={theme.bg} borderColor={theme.success}>
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

                    <Box marginTop={theme.marginL} marginBottom={theme.spacing} padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} position='relative' >
                        <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{position:'absolute', top:'-12px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1}}>
                            {DISPLAY.LABELS.CATEGORY_COLOR}
                        </Text>
                        <div style={{ display:'flex', gap: theme.paddingS, flexWrap: 'wrap', marginTop: theme.marginL }}>
                            {
                                basicColors.map(color =>
                                    <div
                                        key={color}
                                        onClick={()=> setNote({...note, color})}
                                        style={{ width:'30px', height:'30px', borderRadius:'10px', backgroundColor: color, cursor:'pointer', border: note.color === color ? `3px solid ${theme.primary}` : `1px solid ${theme.border}` }}
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

                <ActionButton
                    name={DISPLAY.BUTTONS.ADD_NOTE}
                    actionType='primary'
                    isLoading={isLoading}
                    disabled={isLoading || !note.title.trim() || !note.data.trim()}
                    onClick={addNote}
                    customStyle={{
                        marginBottom: theme.marginS,
                        marginTop: theme.marginL
                    }}
                />
            </form>
        </Popup>
    );
}