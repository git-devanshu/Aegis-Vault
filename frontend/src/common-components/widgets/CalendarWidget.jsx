import React, { useState, useMemo, useEffect } from "react";
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useTheme from "../../hooks/useTheme";
import useAppContext from "../../hooks/useAppContext";

import { Box, Divider, Flex, Grid, Input, Spacer, Text } from '@chakra-ui/react';

import Dropdown from "../form/Dropdown";


export default function CalendarWidget({selectedDate, setSelectedDate, journalMetadata, taskData, weeklySchedule}) {
    const {DISPLAY} = useLanguage();
    const {aegisTheme} = useTheme();
    const {hideWeeklyScheduleItems, hideHighPriorityTasks, hideCompletedTasks} = useAppContext();

    const today = new Date();
    const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', {weekday: 'long'}).toLowerCase();

    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    
    const scheduleCount = hideWeeklyScheduleItems ? 0 : weeklySchedule?.[selectedDayName]?.length || 0;

    const filteredTaskData = useMemo(() =>{
        return taskData.filter(task =>{
            if(hideCompletedTasks && task.checked) return false;
            if(hideHighPriorityTasks && task.priority === 'high') return false;
            return true;
        });
    }, [taskData, hideCompletedTasks, hideHighPriorityTasks]);

    const taskCount = filteredTaskData?.length || 0;

    useEffect(() =>{
        const date = new Date(selectedDate);
        setSelectedMonth(date.getMonth());
        setSelectedYear(date.getFullYear());
    }, []);

    const handleMonthChange = e =>{
        const [year, month] = e.target.value.split('-');
        setSelectedYear(Number(year));
        setSelectedMonth(Number(month) - 1);
        const firstDate = new Date(Number(year), Number(month) - 1, 1);
        setSelectedDate(firstDate.toLocaleDateString('en-CA'));
    }

    const calendarDays = useMemo(() =>{
        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
        const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const days = [];
        for(let i = 0; i < firstDay; i++){
            days.push(null);
        }
        for(let day = 1; day <= totalDays; day++){
            days.push(day);
        }
        return days;
    }, [selectedMonth, selectedYear]);


    const hasJournal = date =>{
        return journalMetadata.some(journal => journal.date === date);
    }

    return (
        <>
            <Box backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
                <Flex justify='space-between' align='start' marginBottom={theme.marginL}>
                    <Spacer/>
                    <Input variant='unstyled' type='month'
                        value={`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`}
                        onChange={handleMonthChange}
                        width='170px' backgroundColor={theme.bg} color={theme.text}
                        padding={theme.paddingS} paddingLeft={theme.paddingL}
                        border={`1px solid ${theme.border}`} borderRadius='12px'
                        _focus={{ borderColor: theme.primary, boxShadow: 'none' }}
                        sx={{
                            '::-webkit-calendar-picker-indicator':{
                                filter: aegisTheme === 'dark' ? 'invert(1)' : '',
                                cursor:'pointer'
                            }
                        }}
                    />
                </Flex>

                <Grid templateColumns='repeat(7, 1fr)'  marginBottom={theme.marginL}>
                    {
                        DISPLAY.WEEKDAYS_SHORT.map(day =>
                            <Text key={day} textAlign='center' fontWeight={700} color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                {day}
                            </Text>
                        )
                    }
                </Grid>

                <Grid templateColumns='repeat(7, 1fr)' gap='2px'>
                    {
                        calendarDays.map((day, index) =>{
                            if(day === null){
                                return <Box key={index} height='38px'/>;
                            }

                            const dateString = new Date(selectedYear, selectedMonth, day).toLocaleDateString('en-CA');
                            const isSelected = dateString === selectedDate;
                            const isToday = day === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();

                            return (
                                <Flex key={index} direction='column' align='center' justify='center' cursor='pointer' height='38px' borderRadius={theme.radius}
                                    backgroundColor={isSelected ? theme.primary
                                            : isToday ? theme.accent : 'transparent'
                                    }
                                    color={isSelected || isToday ? '#0F172A' : theme.text}
                                    fontWeight={isSelected || isToday ? 500 : 400}
                                    _hover={{
                                        backgroundColor: isSelected ? theme.primary : theme.hoverBg
                                    }}
                                    onClick={() => setSelectedDate(dateString)}
                                >
                                    <Text fontSize={theme.smallTextSize}>
                                        {day}
                                    </Text>

                                    {hasJournal(dateString) && <Box width='5px' height='5px' borderRadius='50%' backgroundColor={theme.error} marginBottom='-5px' /> }
                                </Flex>
                            );
                        })
                    }
                </Grid>

                <Divider borderColor={theme.border} borderWidth='1px' marginY={theme.marginL} />

                <Flex justify='space-between' align='center'>
                    <Text color={theme.textSecondary} fontSize={theme.textSize}>
                        {DISPLAY.TEXT.TASKS}
                    </Text>
                    <Text color={theme.text} fontSize={theme.textSize}>
                        {taskCount}
                    </Text>
                </Flex>

                <Flex justify='space-between' align='center'>
                    <Text color={theme.textSecondary} fontSize={theme.textSize}>
                        {DISPLAY.TEXT.SCHEDULE_ITEMS}
                    </Text>
                    <Text color={theme.text} fontSize={theme.textSize}>
                        {scheduleCount}
                    </Text>
                </Flex>
            </Box>
        </>
    );
}
