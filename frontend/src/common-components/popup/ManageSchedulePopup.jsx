import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, Grid, Divider, Textarea } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Dropdown from "../form/Dropdown";
import Tickbox from "../form/Tickbox";

export default function ManageSchedulePopup({isOpen, onClose, weeklySchedule, refreshSchedule, setRefreshSchedule}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [selectedDay, setSelectedDay] = useState('monday');
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedDays, setSelectedDays] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    });

    const [newSchedule, setNewSchedule] = useState({
        title: '',
        startTime: '',
        endTime: '',
        details: ''
    });

    const dayLabels = {
        monday: DISPLAY.TEXT.MONDAY,
        tuesday: DISPLAY.TEXT.TUESDAY,
        wednesday: DISPLAY.TEXT.WEDNESDAY,
        thursday: DISPLAY.TEXT.THURSDAY,
        friday: DISPLAY.TEXT.FRIDAY,
        saturday: DISPLAY.TEXT.SATURDAY,
        sunday: DISPLAY.TEXT.SUNDAY
    };

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

    const handleCheckboxChange = (day) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const addSchedule = e =>{
        e.preventDefault();
        if(!newSchedule.title.trim() || !newSchedule.startTime || !newSchedule.endTime) return;
        if(newSchedule.endTime <= newSchedule.startTime){
            toast.error(TOASTS.PLANNING_MANAGER.INVALID_TIME_RANGE);
            return;
        }

        const daysToAddTo = Object.keys(selectedDays).filter(day => selectedDays[day]);

        if(daysToAddTo.length === 0){
            toast.error(TOASTS.PLANNING_MANAGER.SELECT_ATLEAST_ONE_DAY);
            return;
        }

        const updatedSchedulePayload = JSON.parse(JSON.stringify(weeklySchedule || {}));

        daysToAddTo.forEach(day => {
            const currentDayData = updatedSchedulePayload[day] || [];
            const updatedDayData = [
                ...currentDayData,
                {
                    title: newSchedule.title.trim(),
                    startTime: newSchedule.startTime,
                    endTime: newSchedule.endTime,
                    details: newSchedule.details
                }
            ].sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            updatedSchedulePayload[day] = updatedDayData;
        });

        setScheduleData(updatedSchedulePayload[selectedDay] || []);

        daysToAddTo.forEach(day => {
            if(weeklySchedule) weeklySchedule[day] = updatedSchedulePayload[day];
        });

        setNewSchedule({
            title: '',
            startTime: '',
            endTime: '',
            details: ''
        });
        setSelectedDays({
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
        });
    }

    const deleteSchedule = index =>{
        const updated = scheduleData.filter((_, i) => i !== index);
        setScheduleData(updated);
        if(weeklySchedule) weeklySchedule[selectedDay] = updated;
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
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {schedule.title}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {schedule.startTime} - {schedule.endTime}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS} noOfLines={2}>
                                    {schedule.details}
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
                    <InputBox label={DISPLAY.LABELS.START_TIME} type='time' name='startTime' value={newSchedule.startTime} onChange={handleNewScheduleChange} max={newSchedule.endTime || undefined}/>
                    <InputBox label={DISPLAY.LABELS.END_TIME} type='time' name='endTime' value={newSchedule.endTime} onChange={handleNewScheduleChange} min={newSchedule.startTime || undefined}/>
                </Grid>

                <Textarea name='details' value={newSchedule.details} placeholder={DISPLAY.LABELS.FILL_DETAILS}
                    onChange={handleNewScheduleChange} resize='vertical' height='80px' maxLength={500}
                    backgroundColor={theme.bg} border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} color={theme.text}
                    _hover={{borderColor: theme.border, boxShadow: 'none'}}
                    _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                />

                <Flex direction='row' justify='space-between' wrap='wrap' marginTop={theme.paddingL} paddingX={theme.paddingS} marginBottom='5px' gap='10px'>
                    
                </Flex>

                <Grid templateColumns='repeat(7, 1fr)' border={`1px solid ${theme.border}`} alignItems='stretch' borderRadius={`calc(2 * ${theme.radius})`} gap='1px' backgroundColor={theme.border}>
                    {Object.keys(selectedDays).map((day, index) => (
                        <Flex justify='center' align='center' direction='column' backgroundColor={theme.bg} paddingBottom={theme.paddingS} 
                            borderTopRightRadius={index === 6 ? `calc(2 * ${theme.radius})` : 0} borderBottomRightRadius={index === 6 ? `calc(2 * ${theme.radius})` : 0}
                            borderTopLeftRadius={index === 0 ? `calc(2 * ${theme.radius})` : 0} borderBottomLeftRadius={index === 0 ? `calc(2 * ${theme.radius})` : 0}
                        >
                            <Text color={theme.text} fontSize={theme.smallTextSize}>
                                {dayLabels[day]?.substring(0,3)}
                            </Text>
                            <Tickbox key={day} isChecked={selectedDays[day]} onChange={() => handleCheckboxChange(day)} />
                        </Flex>
                    ))}
                </Grid>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.marginL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveSchedule} isLoading={isLoading} disabled={isLoading}/>
                    <ActionButton name={DISPLAY.BUTTONS.ADD_SCHEDULE} onClick={addSchedule} actionType='primary' disabled={isLoading}/>
                </Grid>
            </form>
        </Popup>
    );
}
