import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Box, Divider, Flex, Grid, GridItem, Spacer, Text, Textarea } from '@chakra-ui/react'
import useLanguage from "../hooks/useLanguage";
import { theme } from '../themes/theme';

import { DeleteIcon, ArrowBackIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { RiFileEditLine } from "react-icons/ri";

import CircleIconButton from "../common-components/form/CircleIconButton";
import ActionButton from "../common-components/form/ActionButton";
import InputBox from "../common-components/form/InputBox";
import DateInput from "../common-components/form/DateInput";
import TabGroup from "../common-components/navbar/TabGroup";
import InfoTooltip from "../common-components/popup/InfoTooltip";


export default function QuickSave() {
    const {DISPLAY, TOASTS} = useLanguage();
    const navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [DISPLAY.LABELS.EXPENSES, DISPLAY.TEXT.NOTEPAD];

    const [currentLog, setCurrentLog] = useState({
        amount: 0,
        spentAt: '',
        spentDate: new Date().toLocaleDateString('en-CA'),
        categoryIndex: 0
    });

    const [savedLogs, setSavedLogs] = useState(JSON.parse(localStorage.getItem('aegis-saved-expenses')) || []); // logs are the saved expenses
    const [note, setNote] = useState(JSON.parse(localStorage.getItem('aegis-saved-notes')));

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setCurrentLog({
            ...currentLog,
            [name]: name === 'amount' ? Number(value) : value
        });
    }

    const addCurrentLog = () =>{
        if(currentLog.amount === 0 || currentLog.spentAt.trim().length === 0){
            return;
        }
        const updatedLogs = [...savedLogs, currentLog];
        setSavedLogs(updatedLogs);
        localStorage.setItem('aegis-saved-expenses', JSON.stringify(updatedLogs));
        setCurrentLog({
            amount: 0,
            spentAt: '',
            spentDate: new Date().toLocaleDateString('en-CA'),
            categoryIndex: 0
        })
    }

    const deleteLog = (index) =>{
        const updatedLogs = savedLogs.filter((_, i) => i !== index);
        setSavedLogs(updatedLogs);
        localStorage.setItem('aegis-saved-expenses', JSON.stringify(updatedLogs));
    }

    const clearAllData = () =>{
        setSavedLogs([]);
        localStorage.removeItem('aegis-saved-expenses');
    }

    const saveNotepad = async(e) =>{
        localStorage.setItem('aegis-saved-notes', JSON.stringify(note));
        toast.success(TOASTS.QUICK_SAVE.NOTE_SAVED);
    }

    const clearNotePad = async(e) =>{
        setNote('');
        localStorage.setItem('aegis-saved-notes', JSON.stringify(""));
    }

    return (
        <div className="common-page" style={{display: 'flex', flexDirection: 'column', overflowY: 'scroll'}}>
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiFileEditLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.QUICK_SAVE}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.HOME} onClick={()=> navigate('/home')} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.marginL} />

            <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>

            {/* Expense tab */}
            {selectedTab === 0 && 
                <Grid templateColumns={{base: '1fr', md: '1fr 1fr', lg: '1fr 2fr'}} gap={theme.spacing} marginTop={theme.marginL} alignItems='start'>
                    
                    {/* Add Expense card */}
                    <div style={{marginTop: theme.marginL, backgroundColor: theme.bg, padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, width: '100%', border: `1px solid ${theme.border}`}}>
                        <Flex align='start' justify='space-between' marginBottom={theme.spacing}>
                            <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginS}>
                                {DISPLAY.TEXT.ADD_EXPENSE}
                            </Text>
                            <InfoTooltip label={DISPLAY.TOOLTIPS.QUICK_SAVE_EXPENSE}>
                                <InfoOutlineIcon color={theme.text}/>
                            </InfoTooltip>
                        </Flex>

                        <form>
                            <div style={{marginBottom: '-10px'}}>
                                <InputBox type='text' label={DISPLAY.LABELS.SPENT_AT} name='spentAt' value={currentLog.spentAt} onChange={handleChange} required={true} maxLen={50} />
                            </div>
                            <Grid templateColumns='1fr 1fr' align='center' gap={theme.paddingL} marginBottom='-20px'>
                                <InputBox type='number' label={DISPLAY.LABELS.AMOUNT} name='amount' value={currentLog.amount} onChange={handleChange} required={true} min={0} />
                                <DateInput value={currentLog.spentDate} name='spentDate' onChange={handleChange} label={DISPLAY.LABELS.SPENT_DATE} />
                            </Grid>
                            <ActionButton name={DISPLAY.BUTTONS.SAVE} disabled={currentLog.amount <= 0} onClick={addCurrentLog} actionType='primary' customStyle={{marginBottom: theme.marginS}}/>
                        </form>
                    </div>

                    {/* Saved Expenses div */}
                    <div>
                        <Text color={theme.text} fontSize={theme.headingSize} marginTop={theme.marginL} marginBottom={theme.spacing}>
                            {DISPLAY.TEXT.SAVED_EXPENSES}
                        </Text>
                        {savedLogs.length === 0 && <div style={{width: '100%', display: 'flex', marginTop: theme.spacing, justifyContent: 'center'}}>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} marginY={theme.spacing} padding={`${theme.paddingS} ${theme.paddingL}`}> {DISPLAY.TEXT.NO_DATA} </Text>
                        </div>}

                        <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.paddingL}>
                            {
                                [...savedLogs].reverse().map((log, index)=>(
                                    <div key={index} style={{ backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius: `calc(${theme.radius} * 2)`, padding:theme.paddingL }}>
                                        <Flex justify='space-between' align='center'>
                                            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={700}> {log.amount} </Text>
                                            <CircleIconButton icon={<DeleteIcon />} tooltip={DISPLAY.TOOLTIPS.DELETE} onClick={()=> deleteLog(savedLogs.length - 1 - index)} />
                                        </Flex>
                                        <Flex align='center' justify='space-between' marginTop={theme.marginS}>
                                            <Text color={theme.text} fontSize={theme.textSize}> {log.spentAt} </Text>
                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} backgroundColor={theme.hoverBg} padding='0 4px' borderRadius='4px'> {log.spentDate} </Text>
                                        </Flex>
                                    </div>
                                ))
                            }
                        </Grid>

                        <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} />
                        <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.paddingL} marginTop={theme.marginL}>
                            <ActionButton name={DISPLAY.BUTTONS.CLEAR_ALL} onClick={clearAllData} disabled={savedLogs.length === 0} />
                        </Grid>
                    </div>
                </Grid>
            }

            {/* Notepad tab */}
            {selectedTab === 1 && 
                <Flex flex={1} flexDirection='column' marginTop={theme.spacing}>
                    <Textarea
                        value={note}
                        flex={1}
                        placeholder={DISPLAY.TEXT.WRITE_HERE}
                        onChange={e => setNote(e.target.value)}
                        resize='vertical'
                        maxLength={50000}
                        backgroundColor={theme.bg}
                        border={`1px solid ${theme.border}`}
                        borderRadius={`calc(2 * ${theme.radius})`}
                        color={theme.text}
                        _hover={{borderColor: theme.border, boxShadow: 'none'}}
                        _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                    />

                    <Grid templateColumns={{base: '1fr 1fr', lg: '1fr 1fr 1fr 1fr'}} gap={theme.paddingL} width='100%' marginTop={theme.marginL} marginBottom={theme.marginS}>
                        <GridItem colStart={{lg:3}}>
                            <ActionButton name={DISPLAY.BUTTONS.CLEAR_ALL} onClick={clearNotePad} />
                        </GridItem>
                        <GridItem>
                            <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveNotepad} actionType='primary' />
                        </GridItem>
                    </Grid>
                </Flex>
            }
        </div>
    );
}
