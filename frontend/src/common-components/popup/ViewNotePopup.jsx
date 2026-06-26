import React, { useState, useEffect } from 'react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { decryptData } from '../../utility/crypto';
import { apiRequest } from '../../utility/api';

import { Text, Textarea, Flex, Badge, Box } from '@chakra-ui/react';

import Popup from '../popup/Popup';
import PriorityIcon from '../../pages/planning-manager/PriorityIcon';


export default function ViewNotePopup({isOpen, onClose, selectedNote}) {
    if(!selectedNote) return null;

    const {DISPLAY} = useLanguage();
    const {masterKey} = useAppContext();

    const [noteData, setNoteData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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
                    setNoteData(decryptedNote);
                },
                defaultSuccessToast: false
            });
        }
        fetchNote();
    }, [isOpen, selectedNote, masterKey]);


    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.NOTE} bg={theme.bg} borderColor={selectedNote.color} takeFullHeight={true}>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600}>
                {selectedNote.title}
            </Text>

            <Flex align='center' gap={theme.paddingL} marginTop={theme.marginS} marginBottom={theme.marginL}>
                <PriorityIcon priority={selectedNote.priority}/>
                {selectedNote.tag &&
                    <Badge marginTop={theme.marginS} backgroundColor={theme.cardBg} color={theme.textSecondary} textTransform='none'>
                        {selectedNote.tag}
                    </Badge>
                }
            </Flex>

            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginBottom={theme.marginL}>
                {noteData?.updatedAt
                        ? `${DISPLAY.LABELS.LAST_UPDATED}: ${new Date(noteData.updatedAt).toLocaleString()}`
                        : ''
                }
            </Text>

            <Textarea
                value={isLoading ? DISPLAY.TEXT.LOADING : noteData?.data || ''}
                isReadOnly
                resize='vertical'
                height='calc(100% - 105px)'
                backgroundColor={theme.bg}
                border={`1px solid ${theme.border}`}
                borderRadius={`calc(2 * ${theme.radius})`}
                color={theme.text}
                _hover={{borderColor: theme.border, boxShadow: 'none'}}
                _focus={{borderColor: theme.primary, boxShadow: 'none'}}
            />
        </Popup>
    );
}