import React, { useState, useMemo } from "react";
import { theme } from '../../themes/theme';
import { Text, Flex, Grid, Box, Badge, Spacer } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { EditIcon } from "@chakra-ui/icons";

import PriorityIcon from './PriorityIcon';
import Dropdown from "../../common-components/form/Dropdown";
import InputBox from "../../common-components/form/InputBox";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import ViewJournalPopup from "../../common-components/popup/ViewJournalPopup";
import EditJournalPopup from "../../common-components/popup/EditJournalPopup";
import ViewNotePopup from "../../common-components/popup/ViewNotePopup";
import EditNotePopup from "../../common-components/popup/EditNotePopup";
import SearchBox from "../../common-components/form/SearchBox";


export default function NotesTab({noteMetadata, journalMetadata, refreshJournalMetadata, setRefreshJournalMetadata, refreshNoteMetadata, setRefreshNoteMetadata}) {
    const {DISPLAY} = useLanguage();
    const {disableJournalModifications, hideHighPriorityNotes, disableNoteModifications} = useAppContext();

    const [selectedType, setSelectedType] = useState('notes');
    const [search, setSearch] = useState('');

    const [selectedJournal, setSelectedJournal] = useState(null);
    const [showViewJournalPopup, setShowViewJournalPopup] = useState(false);
    const [showEditJournalPopup, setShowEditJournalPopup] = useState(false);

    const [selectedNote, setSelectedNote] = useState(null);
    const [showViewNotesPopup, setShowViewNotesPopup] = useState(false);
    const [showEditNotesPopup, setShowEditNotesPopup] = useState(false);

    
    const filteredNotes = useMemo(() =>{
        const query = search.trim().toLowerCase();
        if(selectedType === 'notes'){
            return noteMetadata.filter(note => note.title?.toLowerCase().includes(query));
        }
    }, [selectedType, search, noteMetadata]);


    return (
        <>
            <Grid templateColumns={{base:'1fr', md:'1fr 1fr 2fr'}} gap={theme.marginL} marginTop={theme.spacing} marginBottom={theme.marginL}>
                <div style={{marginTop:'-10px', marginBottom: '-10px'}}>
                    <Dropdown
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                        options={[
                            {
                                label: DISPLAY.TEXT.NOTES,
                                value: 'notes'
                            }, {
                                label: DISPLAY.TEXT.JOURNALS,
                                value: 'journals'
                            }
                        ]}
                    />
                </div>
                <div style={{marginTop:'-10px', marginBottom: '-10px'}}>
                    <SearchBox placeholder={DISPLAY.LABELS.SEARCH_NOTES} name='search' value={search} onChange={e => setSearch(e.target.value)} maxLen={50} />
                </div>
            </Grid>

            {((selectedType == 'notes' && filteredNotes.length === 0) || (selectedType === 'journals' && journalMetadata.length === 0)) &&
                <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:theme.spacing}}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                        {DISPLAY.TEXT.NO_DATA}
                    </Text>
                </div>
            }

            {selectedType === 'notes' &&
                <Grid templateColumns={{
                        base:'repeat(2, 1fr)',
                        sm:'repeat(2, 1fr)',
                        md:'repeat(3, 1fr)',
                        lg:'repeat(5, 1fr)',
                        xl:'repeat(7, 1fr)'
                    }}
                    gap={theme.marginL}
                >
                    {filteredNotes.map(note => {
                        if(note.priority === 'high' && hideHighPriorityNotes) return null;
                        return(
                            <Flex direction='column' key={note.noteKey} backgroundColor={theme.cardBg}
                            borderRadius={theme.radius} border={`1px solid ${theme.border}`} borderLeft={`8px solid ${note.color}`}
                            padding={theme.paddingL} height='200px' cursor='pointer'
                            _hover={{ backgroundColor: theme.hoverBg }}
                            onClick={() =>{ setSelectedNote(note); setShowViewNotesPopup(true); }}
                            >
                                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} noOfLines={2}>
                                    {note.title}
                                </Text>

                                {note.tag &&
                                    <Badge marginTop={theme.marginS} width='fit-content' backgroundColor={theme.bg} color={theme.textSecondary} textTransform='none'>
                                        {note.tag}
                                    </Badge>
                                }

                                <Spacer/>
                                <Flex justify='space-between' align='center'>
                                    <PriorityIcon priority={note.priority}/>
                                    {!disableNoteModifications && 
                                        <CircleIconButton icon={<EditIcon/>} tooltip={DISPLAY.TOOLTIPS.EDIT} onClick={(e)=> { e.stopPropagation(); setSelectedNote(note); setShowEditNotesPopup(true); }} />
                                    }
                                </Flex>
                            </Flex>
                        )}
                    )}
                </Grid>
            }

            {selectedType === 'journals' &&
                <Grid
                    templateColumns={{
                        base:'repeat(2, 1fr)',
                        sm:'repeat(2, 1fr)',
                        md:'repeat(3, 1fr)',
                        lg:'repeat(5, 1fr)',
                        xl:'repeat(7, 1fr)'
                    }}
                    gap={theme.marginL}
                >
                    {journalMetadata.map(journal =>
                        <Flex direction='column' key={journal.journalKey} backgroundColor={theme.cardBg}
                            borderRadius={theme.radius} border={`1px solid ${theme.border}`} borderLeft={`8px solid ${theme.info}`}
                            padding={theme.paddingL} height='200px' cursor='pointer'
                            _hover={{ backgroundColor: theme.hoverBg }}
                            onClick={() =>{ setSelectedJournal(journal); setShowViewJournalPopup(true); }}
                        >
                            <Text color={theme.textSecondary} fontSize={theme.textSize} fontWeight={600}>
                                {DISPLAY.TEXT.JOURNAL}
                            </Text>

                            <Text color={theme.text} fontSize={theme.textSize} marginTop={theme.marginS}>
                                { new Date(journal.date).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'}) }
                            </Text>

                            <Spacer/>
                            <Flex justify='space-between' align='center'>
                                <Spacer/>
                                {!disableJournalModifications && 
                                    <CircleIconButton icon={<EditIcon/>} tooltip={DISPLAY.TOOLTIPS.EDIT} onClick={(e)=> { e.stopPropagation(); setSelectedJournal(journal); setShowEditJournalPopup(true);  }} />
                                }
                            </Flex>
                        </Flex>
                    )}
                </Grid>
            }

            {/* View Journal Popup */}
            <ViewJournalPopup isOpen={showViewJournalPopup} onClose={setShowViewJournalPopup} selectedJournal={selectedJournal} />

            {/* Edit Journal Popup */}
            <EditJournalPopup isOpen={showEditJournalPopup} onClose={setShowEditJournalPopup} selectedJournal={selectedJournal} journalMetadata={journalMetadata} refreshJournalMetadata={refreshJournalMetadata} setRefreshJournalMetadata={setRefreshJournalMetadata}/>

            {/* View Notes Popup */}
            <ViewNotePopup isOpen={showViewNotesPopup} onClose={setShowViewNotesPopup} selectedNote={selectedNote} />

            {/* Edit Notes Popup */}
            <EditNotePopup isOpen={showEditNotesPopup} onClose={setShowEditNotesPopup} selectedNote={selectedNote} noteMetadata={noteMetadata} refreshNoteMetadata={refreshNoteMetadata} setRefreshNoteMetadata={setRefreshNoteMetadata} />
        </>
    );
}
