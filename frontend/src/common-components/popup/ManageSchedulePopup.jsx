import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, Grid, Divider } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import DateInput from "../form/DateInput";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Dropdown from "../form/Dropdown";


export default function ManageSchedulePopup({isOpen, onClose, weeklySchedule, refreshSchedule, setRefreshSchedule}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [selectedDay, setSelectedDay] = useState('monday');
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [newSchedule, setNewSchedule] = useState({
        title: '',
        startTime: '',
        endTime: ''
    });

    useEffect(() =>{
        if(!weeklySchedule) return;
        setScheduleData(JSON.parse(JSON.stringify(weeklySchedule[selectedDay] || [])));
    }, [selectedDay, weeklySchedule]);

    const handleNewScheduleChange = e =>{
        setNewSchedule({
            ...newSchedule,
            [e.target.name]: e.target.value
        });
    }

    const addSchedule = e =>{
        e.preventDefault();
        if(!newSchedule.title.trim() || !newSchedule.startTime || !newSchedule.endTime) return;
        if(newSchedule.endTime <= newSchedule.startTime){
            toast.error(TOASTS.PLANNING_MANAGER.INVALID_TIME_RANGE);
            return;
        }
        setScheduleData([
            ...scheduleData,
            {
                title: newSchedule.title.trim(),
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime
            }
        ].sort((a, b) => a.startTime.localeCompare(b.startTime)));
        setNewSchedule({
            title: '',
            startTime: '',
            endTime: ''
        });
    }

    const deleteSchedule = index =>{
        setScheduleData(
            scheduleData.filter((_, i) => i !== index)
        );
    }

    const saveSchedule = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const updatedWeeklySchedule = {
                ...weeklySchedule,
                [selectedDay]: scheduleData
            };
            const schedulePayload = {
                monday: updatedWeeklySchedule.monday || [],
                tuesday: updatedWeeklySchedule.tuesday || [],
                wednesday: updatedWeeklySchedule.wednesday || [],
                thursday: updatedWeeklySchedule.thursday || [],
                friday: updatedWeeklySchedule.friday || [],
                saturday: updatedWeeklySchedule.saturday || [],
                sunday: updatedWeeklySchedule.sunday || []
            };
            const encryptedSchedule = {};
            for(const [day, data] of Object.entries(schedulePayload)){
                const {encryptedData, nonce} = await encryptData(JSON.stringify(data), masterKey);
                encryptedSchedule[`${day}ScheduleData`] = encryptedData;
                encryptedSchedule[`${day}Nonce`] = nonce;
            }
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/weekly-schedule',
                data: encryptedSchedule,
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshSchedule(!refreshSchedule);
                    onClose(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.MANAGE_SCHEDULE} bg={theme.bg} borderColor={theme.success}>
            <Dropdown
                label={DISPLAY.LABELS.DAY}
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value)}
                options={[
                    {label: DISPLAY.TEXT.MONDAY, value: 'monday'},
                    {label: DISPLAY.TEXT.TUESDAY, value: 'tuesday'},
                    {label: DISPLAY.TEXT.WEDNESDAY, value: 'wednesday'},
                    {label: DISPLAY.TEXT.THURSDAY, value: 'thursday'},
                    {label: DISPLAY.TEXT.FRIDAY, value: 'friday'},
                    {label: DISPLAY.TEXT.SATURDAY, value: 'saturday'},
                    {label: DISPLAY.TEXT.SUNDAY, value: 'sunday'}
                ]}
            />

            <Box maxHeight='250px' overflowY='auto'>
                {scheduleData.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    scheduleData.map((schedule, index) =>
                        <Flex key={index} align='center' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {schedule.title}
                                </Text>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {schedule.startTime} - {schedule.endTime}
                                </Text>
                            </Flex>

                            <CircleIconButton icon={<DeleteIcon/>} onClick={() => deleteSchedule(index)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                        </Flex>
                    )
                }
            </Box>

            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.spacing} />

            <form>
                <InputBox label={DISPLAY.LABELS.TITLE} type='text' name='title' value={newSchedule.title} onChange={handleNewScheduleChange} maxLen={60} />

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop='-10px' marginBottom='-10px'>
                    <InputBox label={DISPLAY.LABELS.START_TIME} type='time' name='startTime' value={newSchedule.startTime} onChange={handleNewScheduleChange}/>
                    <InputBox label={DISPLAY.LABELS.END_TIME} type='time' name='endTime' value={newSchedule.endTime} onChange={handleNewScheduleChange}/>
                </Grid>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveSchedule} isLoading={isLoading} disabled={isLoading}/>
                    <ActionButton name={DISPLAY.BUTTONS.ADD_SCHEDULE} onClick={addSchedule} actionType='primary' disabled={isLoading}/>
                </Grid>
            </form>
        </Popup>
    );
}
