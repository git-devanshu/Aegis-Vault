import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, ButtonGroup, Divider, Flex, Grid, Heading, Menu, MenuButton, MenuList, Spacer, Text } from '@chakra-ui/react'
import useLanguage from "../hooks/useLanguage";
import { theme } from '../themes/theme';

import { DeleteIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { RiStickyNoteLine } from "react-icons/ri";

import CircleIconButton from "../common-components/form/CircleIconButton";
import ActionButton from "../common-components/form/ActionButton";
import InputBox from "../common-components/form/InputBox";
import DateInput from "../common-components/form/DateInput";


export default function QuickSave() {
    const {DISPLAY} = useLanguage();
    const navigate = useNavigate();

    const [currentLog, setCurrentLog] = useState({
        amount: 0,
        spentAt: '',
        spentDate: new Date().toLocaleDateString('en-CA'),
        categoryIndex: 0
    });

    const [savedLogs, setSavedLogs] = useState(JSON.parse(localStorage.getItem('aegis-saved-logs')) || []);

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
        localStorage.setItem('aegis-saved-logs', JSON.stringify(updatedLogs));
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
        localStorage.setItem('aegis-saved-logs', JSON.stringify(updatedLogs));
    }

    const clearAllData = () =>{
        setSavedLogs([]);
        localStorage.removeItem('aegis-saved-logs');
    }

    return (
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiStickyNoteLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.QUICK_SAVE}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.HOME} onClick={()=> navigate('/home')} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr', lg: '1fr 2fr'}} gap={theme.paddingL} marginTop={theme.marginL} alignItems='start'>
                {/* Entry card */}
                <div>
                    <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing}>
                        {DISPLAY.TEXT.ADD_EXPENSE}
                    </Text>
                    <div style={{backgroundColor: theme.bg, padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, width: '100%', border: `1px solid ${theme.border}`}}>
                        <form>
                            <InputBox type='text' label={DISPLAY.LABELS.SPENT_AT} name='spentAt' value={currentLog.spentAt} onChange={handleChange} required={true} maxLen={50} />
                            <Flex align='center' gap={theme.paddingL}>
                                <div style={{marginTop: '-20px'}}>
                                    <InputBox type='number' label={DISPLAY.LABELS.AMOUNT} name='amount' value={currentLog.amount} onChange={handleChange} required={true} min={0} />
                                </div>
                                <DateInput value={currentLog.spentDate} name='spentDate' onChange={handleChange} label={DISPLAY.LABELS.SPENT_DATE} />
                            </Flex>
                            <ActionButton name={DISPLAY.BUTTONS.SAVE} disabled={currentLog.amount <= 0} onClick={addCurrentLog} actionType='primary'/>
                        </form>
                    </div>
                </div>

                <div>
                    <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing}>
                        {DISPLAY.TEXT.SAVED_EXPENSES}
                    </Text>
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.paddingL}>
                        {savedLogs.length === 0 && <div style={{width: '100%', display: 'flex', marginTop: theme.spacing, justifyContent: 'center'}}>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}> {DISPLAY.TEXT.NO_DATA} </Text>
                        </div>}
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
        </div>
    );
}
