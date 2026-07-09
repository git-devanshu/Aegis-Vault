import React, { useEffect, useMemo, useState } from "react";
import { theme } from '../../themes/theme';
import toast from "react-hot-toast";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { Flex, Text, Box, Grid, Badge, ButtonGroup, Divider } from '@chakra-ui/react';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";
import { apiRequest, validateAndStartLoading } from "../../utility/api";
import { decryptData, encryptData } from "../../utility/crypto";
import { formatTime } from "../../utility/helpers";


export default function ViewTaskPopup({isOpen, onClose, task, setRefreshTasks, refreshTasks}) {
    if(!task) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, use12HourClockInSchedule} = useAppContext();

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showCompletePopup, setShowCompletePopup] = useState(false);

    const [decryptedDescription, setDecryptedDescription] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        const decryptDescription = async() =>{
            try{
                const description = await decryptData(task.description, task.descriptionNonce, masterKey);
                setDecryptedDescription(description);
            }
            catch(error){
                console.log(error);
                setDecryptedDescription('');
            }
        }
        if(task){
            decryptDescription();
        }
    }, [task, masterKey]);

    const getPriorityColor = priority =>{
        switch(priority){
            case 'high': return theme.error;
            case 'medium': return theme.warning;
            default: return theme.success;
        }
    }

    const deleteTask = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/pl/tasks/${task.id}`,
                toastId,
                setIsLoading,
                onSuccess: (res)=> {
                    setRefreshTasks(!refreshTasks);
                    onClose(false);
                    setShowDeletePopup(false);
                },
                onError: (err)=> {
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

    const markCompleted = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            const updatedTaskMetadata = {
                name: task.name,
                startTime: task.startTime,
                endTime: task.endTime,
                priority: task.priority,
                checked: true
            };
            const {encryptedData: taskMetadata, nonce: metadataNonce} = await encryptData(JSON.stringify(updatedTaskMetadata), masterKey);
    
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/tasks',
                data: {
                    id: task.id,
                    taskDate: task.taskDate,
                    taskMetadata,
                    metadataNonce,
                    taskDescription: task.description,
                    descriptionNonce: task.descriptionNonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshTasks(!refreshTasks);
                    onClose(false);
                    setShowCompletePopup(false);
                },
                onError: (err)=> {
                    setShowCompletePopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
            setShowCompletePopup(false);
        }
    }

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.TASK_DETAILS} bg={theme.bg} borderColor={getPriorityColor(task.priority)}>
                <Box borderRadius={theme.radius} marginBottom={theme.marginL}>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500} marginBottom={theme.marginS}>
                        {task.name}
                    </Text>
                    <Flex gap={theme.marginS} wrap='wrap'>
                        <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none' backgroundColor={getPriorityColor(task.priority)}>
                            {task.priority}
                        </Badge>
                        {task.checked &&
                            <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none' backgroundColor={theme.primary}>
                                {DISPLAY.TEXT.COMPLETED}
                            </Badge>
                        }
                    </Flex>
                </Box>

                <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.marginL} />

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom={theme.marginL}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.LABELS.DATE} : {task.taskDate}
                    </Text>

                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.TIME} : {formatTime(task.startTime, use12HourClockInSchedule)} - {formatTime(task.endTime, use12HourClockInSchedule)}
                    </Text>
                </Grid>

                <Box backgroundColor={theme.cardBg} borderRadius={theme.radius} padding={theme.paddingL} marginBottom={theme.marginL}>
                    <Text color={theme.text} whiteSpace='pre-wrap'>
                        {decryptedDescription || DISPLAY.TEXT.NO_DESCRIPTION}
                    </Text>
                </Box>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.marginL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={() => setShowDeletePopup(true)} />
                    <ActionButton name={DISPLAY.BUTTONS.MARK_COMPLETED} actionType='primary' onClick={() => setShowCompletePopup(true)} disabled={task.checked} />
                </Grid>
            </Popup>

            {/* Confirm Delete Popup */}
            <Popup isOpen={showDeletePopup} onClose={()=> setShowDeletePopup(false)} title={DISPLAY.TEXT.DELETE_TASK} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_TASK}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeletePopup(false)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteTask} actionType='primary' disabled={isLoading} isLoading={isLoading} />
                </ButtonGroup>
            </Popup>

            {/* Confirm Mark Complete Popup */}
            <Popup isOpen={showCompletePopup} onClose={()=> setShowCompletePopup(false)} title={DISPLAY.TEXT.MARK_COMPLETED} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.COMFIRM_MARK_COMPLETE}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowCompletePopup(false)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.MARK_COMPLETED} onClick={markCompleted} actionType='primary' disabled={isLoading} isLoading={isLoading} />
                </ButtonGroup>
            </Popup>
        </>
    );
}
