import React, { useState } from "react";
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { Flex, Text, Box } from '@chakra-ui/react';

import { SlNotebook } from "react-icons/sl";
import { EditIcon } from "@chakra-ui/icons";

import ViewJournalPopup from "../popup/ViewJournalPopup";
import EditJournalPopup from "../popup/EditJournalPopup";
import CircleIconButton from "../form/CircleIconButton";


export default function JournalCard({selectedDate, journalMetadata, setShowAddEventPopup, refreshJournalMetadata, setRefreshJournalMetadata}) {
    const {DISPLAY} = useLanguage();
    const {disableJournalModifications} = useAppContext();

    const journal = journalMetadata.find(item => item.date === selectedDate);

    const [showViewJournalPopup, setShowViewJournalPopup] = useState(false);
    const [showEditJournalPopup, setShowEditJournalPopup] = useState(false);

    if(!journal){
        return (
            <Flex direction='column' justify='center' align='center' height='120px' border={`2px dashed ${theme.border}`} borderRadius={theme.radius} cursor='pointer' onClick={()=> setShowAddEventPopup(true)} _hover={{backgroundColor: theme.hoverBg}}>
                <SlNotebook size='34px' color={theme.textSecondary}/>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginTop={theme.marginL}>
                    {DISPLAY.TEXT.NO_JOURNAL}
                </Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                    {DISPLAY.TEXT.CLICK_TO_ADD_JOURNAL}
                </Text>
            </Flex>
        );
    }

    return (
        <>
            <Box backgroundColor={theme.cardBg} borderRadius={theme.radius} cursor='pointer' height='120px' _hover={{backgroundColor: theme.hoverBg}} onClick={()=> setShowViewJournalPopup(true)}>
                <Flex align='center' justify='space-between' gap={theme.marginL} padding={theme.paddingL} borderBottom={`1px solid ${theme.border}`}>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                        {DISPLAY.TEXT.JOURNAL}
                    </Text>
                    <SlNotebook size='28px' color={theme.text}/>
                </Flex>

                <Flex padding={theme.paddingL} align='end' justify='space-between'>
                    <Box>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            {DISPLAY.LABELS.DATE}
                        </Text>
                        <Text color={theme.text} fontSize={theme.textSize} marginTop={theme.marginS}>
                            { new Date(selectedDate).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'}) }
                        </Text>
                    </Box>

                    {!disableJournalModifications && 
                        <CircleIconButton icon={<EditIcon/>} onClick={(e)=> {e.stopPropagation(); setShowEditJournalPopup(true); }} tooltip={DISPLAY.TOOLTIPS.EDIT} />
                    }
                </Flex>
            </Box>

            {/* View Journal Popup */}
            <ViewJournalPopup isOpen={showViewJournalPopup} onClose={setShowViewJournalPopup} selectedJournal={journal} />

            {/* Edit Journal Popup */}
            <EditJournalPopup isOpen={showEditJournalPopup} onClose={setShowEditJournalPopup} selectedJournal={journal} journalMetadata={journalMetadata} refreshJournalMetadata={refreshJournalMetadata} setRefreshJournalMetadata={setRefreshJournalMetadata}/>
        </>    
    );
}
