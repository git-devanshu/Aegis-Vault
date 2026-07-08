import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { decryptData } from '../../utility/crypto';
import { apiRequest } from '../../utility/api';

import { Text, Textarea } from '@chakra-ui/react';

import Popup from '../popup/Popup';


export default function ViewJournalPopup({isOpen, onClose, selectedJournal}) {
    if(!selectedJournal) return null;
    
    const {DISPLAY} = useLanguage();
    const {masterKey} = useAppContext();

    const [journalContent, setJournalContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.JOURNAL} bg={theme.bg} borderColor={theme.info} takeFullHeight={true}>
            <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                { new Date(selectedJournal.date).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'}) }
            </Text>

            <Textarea
                value={isLoading ? DISPLAY.TEXT.LOADING : journalContent}
                isReadOnly
                resize='vertical'
                minHeight='calc(100% - 39px)'
                backgroundColor={theme.bg}
                border={`1px solid ${theme.border}`}
                borderRadius={`calc(2 * ${theme.radius})`}
                color={theme.text}
                _hover={{borderColor: theme.border, boxShadow: 'none'}}
                _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                overflowY='scroll'
            />
        </Popup>
    );
}
