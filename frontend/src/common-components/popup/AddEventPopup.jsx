import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { v4 as uuid } from 'uuid';

import { Textarea, Text, Grid, Box } from '@chakra-ui/react';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';
import TabGroup from '../navbar/TabGroup';


export default function AddEventPopup({isOpen, onClose, selectedDate, refreshTasks, setRefreshTasks, refreshJournalMetadata, setRefreshJournalMetadata, journalMetadata}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    const tabs = [DISPLAY.TEXT.TASK, DISPLAY.TEXT.JOURNAL];
    const [selectedTab, setSelectedTab] = useState(0);

    const [task, setTask] = useState({
        name: '',
        priority: 'medium',
        taskDate: selectedDate,
        startTime: '',
        endTime: '',
        description: ''
    });
    
    const [journal, setJournal] = useState({
        journalDate: selectedDate,
        journalContent: ''
    });

    useEffect(() =>{
        if(isOpen){
            setTask({
                ...task,
                taskDate: selectedDate
            });
    
            setJournal({
                ...journal,
                journalDate: selectedDate,
            });
        }
    }, [selectedDate, isOpen]);

    const handleJournalChange = (e) =>{
        setJournal({
            ...journal,
            [e.target.name]: e.target.value
        });
    }

    const handleTaskChange = (e) =>{
        setTask({
            ...task,
            [e.target.name]: e.target.value
        });
    }

    const addTask = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const taskMetadataPayload = {
                name: task.name.trim(),
                startTime: task.startTime,
                endTime: task.endTime,
                priority: task.priority,
                checked: false
            };
            const {encryptedData: taskMetadata, nonce: metadataNonce} = await encryptData(JSON.stringify(taskMetadataPayload), masterKey);
            const {encryptedData: taskDescription, nonce: descriptionNonce} = await encryptData(task.description, masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/pl/tasks',
                data: {
                    taskDate: task.taskDate,
                    taskMetadata,
                    metadataNonce,
                    taskDescription,
                    descriptionNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshTasks(!refreshTasks);
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

    const addJournal = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        const existingJournal = journalMetadata.find(item => item.date === journal.journalDate);
        if(existingJournal){
            toast.error(TOASTS.PLANNING_MANAGER.JOURNAL_ALREADY_EXISTS, {id: toastId});
            setIsLoading(false);
            return;
        }
        try{
            const journalKey = uuid();
            const updatedMetadata = [
                ...journalMetadata,
                {
                    date: journal.journalDate,
                    journalKey
                }
            ];
            const {encryptedData: metadataData, nonce: metadataNonce} = await encryptData(JSON.stringify(updatedMetadata), masterKey);
            const {encryptedData: journalData, nonce} = await encryptData(journal.journalContent, masterKey);
    
            await apiRequest({
                method: 'POST',
                endpoint: '/api/pl/journal',
                data: {
                    journalKey,
                    journalData,
                    nonce,
                    metadataData,
                    metadataNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshJournalMetadata(!refreshJournalMetadata);
                    setJournal({...journal, journalContent: ''});
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
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.ADD_EVENT} bg={theme.bg} borderColor={theme.success} takeFullHeight={true}>
            <Box height='100%'>
                <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>

                {/* Task */}
                {selectedTab === 0 && 
                    <form style={{marginTop: theme.spacing, height: 'calc(100% - 67px)'}}>
                        <InputBox type='text' label={DISPLAY.LABELS.TASK_NAME} name='name' value={task.name} onChange={handleTaskChange} maxLen={60} />
                        
                        <Dropdown value={task.priority} onChange={e => setTask({...task, priority: e.target.value})}
                            options={[
                                {label: DISPLAY.TEXT.LOW, value: 'low'},
                                {label: DISPLAY.TEXT.MEDIUM, value: 'medium'},
                                {label: DISPLAY.TEXT.HIGH, value: 'high'}
                            ]}
                        />

                        <DateInput value={task.taskDate} name='taskDate' onChange={handleTaskChange} label={DISPLAY.LABELS.DATE} />

                        <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop='-25px'>
                            <InputBox type='time' label={DISPLAY.LABELS.START_TIME} name='startTime' value={task.startTime} onChange={handleTaskChange} />
                            <InputBox type='time' label={DISPLAY.LABELS.END_TIME} name='endTime' value={task.endTime} onChange={handleTaskChange} />
                        </Grid>

                        <Textarea
                            name='description'
                            value={task.description}
                            placeholder={DISPLAY.LABELS.DESCRIPTION}
                            onChange={handleTaskChange}
                            resize='vertical'
                            height='calc(100% - 317px)'
                            maxLength={1000}
                            backgroundColor={theme.bg}
                            border={`1px solid ${theme.border}`}
                            borderRadius={`calc(2 * ${theme.radius})`}
                            color={theme.text}
                            _hover={{borderColor: theme.border, boxShadow: 'none'}}
                            _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                        />

                        <ActionButton name={DISPLAY.BUTTONS.ADD_TASK} actionType='primary' isLoading={isLoading} disabled={isLoading || !task.name.trim() || !task.taskDate || !task.startTime || !task.endTime} onClick={addTask} customStyle={{marginBottom: theme.marginS, marginTop: theme.marginL}} />
                    </form>
                }

                {/* Journal */}
                {selectedTab === 1 && 
                    <form style={{marginTop: theme.spacing, height: 'calc(100% - 67px)'}}>
                        <DateInput value={journal.journalDate} name='journalDate' onChange={handleJournalChange} label={DISPLAY.LABELS.DATE} />

                        <Textarea
                            name='journalContent'
                            value={journal.journalContent}
                            placeholder={DISPLAY.TEXT.WRITE_HERE}
                            onChange={handleJournalChange}
                            resize='vertical'
                            height='calc(100% - 114px)'
                            marginTop='-20px'
                            maxLength={10000}
                            backgroundColor={theme.bg}
                            border={`1px solid ${theme.border}`}
                            borderRadius={`calc(2 * ${theme.radius})`}
                            color={theme.text}
                            _hover={{borderColor: theme.border, boxShadow: 'none'}}
                            _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                        />

                        <ActionButton name={DISPLAY.BUTTONS.ADD_JOURNAL} actionType='primary' isLoading={isLoading}
                            disabled={isLoading || !journal.journalDate || !journal.journalContent.trim()}
                            onClick={addJournal}
                            customStyle={{ marginBottom: theme.marginS, marginTop: theme.marginL }}
                        />
                    </form>
                }
            </Box>
        </Popup>
    );
}
