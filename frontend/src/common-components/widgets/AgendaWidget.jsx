import React, { useMemo, useState } from "react";
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { formatTime } from "../../utility/helpers";

import { Box, Flex, Text, Textarea, Grid } from '@chakra-ui/react';

import Popup from "../popup/Popup";
import ViewTaskPopup from "../popup/ViewTaskPopup";


export default function AgendaWidget({selectedDate, weeklySchedule, taskData, refreshTasks, setRefreshTasks}) {
    if(!taskData || !weeklySchedule) return null;

    const {DISPLAY} = useLanguage();
    const {use12HourClockInSchedule, hideWeeklyScheduleItems, hideHighPriorityTasks, hideCompletedTasks} = useAppContext();

    const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {weekday:'long'}).toLowerCase();
    const scheduleItems = weeklySchedule?.[selectedDayName] || [];

    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetailsPopup, setShowTaskDetailsPopup] = useState(false);

    const [selectedSchedule, setSelectedSchedule] = useState(false);
    const [showScheduleDetailsPopup, setShowScheduleDetailsPopup] = useState(false);


    const filteredScheduleItems = useMemo(() =>{
        if(hideWeeklyScheduleItems) return [];
        return scheduleItems;
    }, [scheduleItems, hideWeeklyScheduleItems]);
    
    const filteredTaskData = useMemo(() =>{
        return taskData.filter(task =>{
            if(hideCompletedTasks && task.checked) return false;
            if(hideHighPriorityTasks && task.priority === 'high') return false;
            return true;
        });
    }, [taskData, hideCompletedTasks, hideHighPriorityTasks]);
    

    const timeToMinutes = time =>{
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    const assignLanes = events =>{
        const laneEndTimes = [];

        return events.map(event =>{
            let lane = 0;
            while(laneEndTimes[lane] && timeToMinutes(laneEndTimes[lane]) > timeToMinutes(event.startTime)){ 
                lane++; 
            }
            laneEndTimes[lane] = event.endTime;
            return { ...event, lane };
        });
    }


    const timelinePoints = useMemo(() =>{
        return [
            ...new Set([
                ...filteredScheduleItems.flatMap(item => [item.startTime, item.endTime]),
                ...filteredTaskData.flatMap(item => [item.startTime, item.endTime])
            ])
        ].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    }, [filteredScheduleItems, filteredTaskData]);

    const processedEvents = useMemo(() =>{
        const scheduleEvents = filteredScheduleItems.map(item =>({
            ...item,
            type: 'schedule'
        }));
        const taskEvents = filteredTaskData.map(item =>({
            ...item,
            type: 'task'
        }));

        const allEvents = [...scheduleEvents, ...taskEvents]
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        const eventsWithLanes = assignLanes(allEvents);

        return eventsWithLanes.map(event =>({
            ...event,
            startRow: timelinePoints.indexOf(event.startTime) + 1,
            endRow: timelinePoints.indexOf(event.endTime) + 1
        }));
    }, [filteredScheduleItems, filteredTaskData, timelinePoints]);

    const laneCount = useMemo(() =>{
        return Math.max(1, ...processedEvents.map(event => event.lane + 1));
    }, [processedEvents]);

    const getPriorityColor = priority =>{
        switch(priority){
            case 'high': return theme.error;
            case 'medium': return theme.warning;
            default: return theme.success;
        }
    }

    const handleTaskClick = (task) =>{
        setSelectedTask(task);
        setShowTaskDetailsPopup(true);
    }

    const handleScheduleClick = (schedule) =>{
        setSelectedSchedule(schedule);
        setShowScheduleDetailsPopup(true);
    }

    return (
        <Box width='100%' overflowX='scroll'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                { new Date(selectedDate).toLocaleDateString(undefined, {weekday:'long', day:'numeric', month:'long'}) }
            </Text>

            {timelinePoints.length === 0 && 
                <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop: theme.spacing}}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                        {DISPLAY.TEXT.NOTHING_TODAY}
                    </Text>
                </div>
            }

            <Grid templateColumns={`70px repeat(${laneCount}, minmax(220px, 1fr))`} gridAutoRows='65px' paddingTop={theme.spacing}>
                {
                    timelinePoints.map((time, index) =>
                        <React.Fragment key={time}>
                            <Flex gridColumn='1' gridRow={index + 1} align='start' justify='center'>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} fontWeight={600} marginTop='-12px'>
                                    {formatTime(time, use12HourClockInSchedule)}
                                </Text>
                            </Flex>
                            {index < timelinePoints.length - 1 &&
                                <Box gridColumn={`2 / ${laneCount + 2}`} gridRow={index + 1} borderTop={`1px solid ${theme.border}`} />
                            }
                        </React.Fragment>
                    )
                }
                {
                    processedEvents.map((event, index) =>
                        <Box key={index}
                            gridColumn={event.lane + 2} gridRow={`${event.startRow} / ${event.endRow}`}
                            padding={theme.paddingL} paddingTop='3px' marginTop={theme.marginS} marginBottom={theme.marginS} marginLeft={theme.marginL}
                            borderRadius={theme.radius}
                            border={event.type === 'task' && event.checked ? `1px solid ${theme.border}` : 'none'}
                            borderLeft={`8px solid ${event.type === 'schedule' ? theme.info : getPriorityColor(event.priority)}`}
                            backgroundColor={event.type === 'task' && event.checked ? theme.bg : theme.cardBg}
                            cursor='pointer'
                            overflow='hidden'
                            onClick={() => event.type === 'task' ? handleTaskClick(event) : handleScheduleClick(event)}
                            _hover={{backgroundColor: theme.hoverBg}}
                        >
                            {event.type === 'schedule' 
                                ? <>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500} noOfLines={1}>
                                        {event.title}
                                    </Text>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                        {formatTime(event.startTime, use12HourClockInSchedule)} - {formatTime(event.endTime, use12HourClockInSchedule)}
                                    </Text>
                                </>
                                : <>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500} textDecoration={event.checked ? 'line-through' : 'none'} noOfLines={1}>
                                        {event.name}
                                    </Text>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                        {formatTime(event.startTime, use12HourClockInSchedule)} - {formatTime(event.endTime, use12HourClockInSchedule)}
                                    </Text>
                                </>
                            }
                        </Box>
                    )
                }
            </Grid>

            {/* Task Details Popup */}
            <ViewTaskPopup isOpen={showTaskDetailsPopup} onClose={setShowTaskDetailsPopup} task={selectedTask} setRefreshTasks={setRefreshTasks} refreshTasks={refreshTasks} />

            {/* Schedule Details Popup */}
            <Popup isOpen={showScheduleDetailsPopup} onClose={()=> setShowScheduleDetailsPopup(false)} title={DISPLAY.TEXT.SCHEDULE} bg={theme.bg} borderColor={theme.info}>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={500} textAlign='left'>
                    {DISPLAY.LABELS.TITLE} : {selectedSchedule.title}
                </Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS} marginBottom={theme.marginS}>
                    {formatTime(selectedSchedule.startTime, use12HourClockInSchedule)} - {formatTime(selectedSchedule.endTime, use12HourClockInSchedule)}
                </Text>
                <Textarea name='details' value={selectedSchedule.details} isReadOnly
                    resize='none' height='fit-content' maxHeight='50vh' overflowY='scroll'
                    backgroundColor={theme.cardBg} border='none' borderRadius={theme.radius} color={theme.text}
                    _hover={{boxShadow: 'none'}}
                    _focus={{boxShadow: 'none'}}
                />
            </Popup>
        </Box>
    );
}
