import React, { useState, useMemo } from "react";
import { theme } from '../../themes/theme';
import { Text, Flex, Grid, Box, Badge } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import CalendarWidget from "../../common-components/widgets/CalendarWidget";
import AgendaWidget from "../../common-components/widgets/AgendaWidget";
import JournalCard from "../../common-components/widgets/JournalCard";


export default function CalendarTab({journalMetadata, weeklySchedule, taskData, refreshJournalMetadata, setRefreshJournalMetadata, refreshTasks, setRefreshTasks, selectedDate, setSelectedDate, setShowAddEventPopup}) {
    if(!journalMetadata || !weeklySchedule) return null;

    const {
        disableJournalModifications, hideWeeklyScheduleItems, hideHighPriorityTasks, hideCompletedTasks,
    } = useAppContext();

    return (
        <>
            <Grid templateColumns={{base:'1fr', md:'1fr 3fr'}} gap={theme.paddingL} marginTop={theme.spacing} alignItems='start'>
                {/* Calendar */}
                <CalendarWidget selectedDate={selectedDate} setSelectedDate={setSelectedDate} journalMetadata={journalMetadata} taskData={taskData} weeklySchedule={weeklySchedule} />

                <Grid templateColumns={{base:'1fr', lg:'2fr 1fr'}} gap={theme.paddingL} alignItems='start'>
                    {/* Daily Schedule Widget */}
                    <AgendaWidget selectedDate={selectedDate} weeklySchedule={weeklySchedule} taskData={taskData} setRefreshTasks={setRefreshTasks} refreshTasks={refreshTasks} />

                    {/* Journal Card */}
                    <div style={{height: '260px'}}>
                        <JournalCard selectedDate={selectedDate} journalMetadata={journalMetadata} setShowAddEventPopup={setShowAddEventPopup} refreshJournalMetadata={refreshJournalMetadata} setRefreshJournalMetadata={setRefreshJournalMetadata} />
                    </div>
                </Grid>
            </Grid>
        </>
    );
}
