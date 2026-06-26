import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Spacer, Grid, Image, Box, Tooltip } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { CiCircleChevDown } from "react-icons/ci";

import ActionButton from "../../common-components/form/ActionButton";
import GuideSection from "../../common-components/GuideSection";

import ViewCollection from '../../assets/guide-images/view-collection.png';
import EditCollection from '../../assets/guide-images/editing-collection.png';
import CollectionSettings from '../../assets/guide-images/collection-settings.png';
import AddSchedule from '../../assets/guide-images/add-weekly-schedule.png';
import ViewSchedule from '../../assets/guide-images/view-schedule.png';
import AddTask from '../../assets/guide-images/adding-task.png';
import CompleteTask from '../../assets/guide-images/complete-task.png';
import CalendarSettings from '../../assets/guide-images/calendar-settings.png';
import AddingJournal from '../../assets/guide-images/adding-journal.png';
import AccessingJournal from '../../assets/guide-images/accessing-journal.png';
import EditJournal from '../../assets/guide-images/edit-journal.png';
import JournalSettings from '../../assets/guide-images/journal-settings.png';
import AddNote from '../../assets/guide-images/add-note.png';
import AccessingNote from '../../assets/guide-images/accessing-notes.png';
import EditNote from '../../assets/guide-images/edit-note.png';
import NoteSettings from '../../assets/guide-images/note-settings.png';
// import  from '../../assets/guide-images/';
// import  from '../../assets/guide-images/';



export default function FeatureGuide({setShowModal}) {
    const {DISPLAY} = useLanguage();

    const [currentSection, setCurrentSection] = useState(0);

    const sections = [
        DISPLAY.HELP_TEXT.TITLE,
        DISPLAY.HELP_TEXT.USING_COLLECTIONS,
        DISPLAY.HELP_TEXT.COLLECTION_SETTINGS,
        DISPLAY.HELP_TEXT.MANAGING_SCHEDULE,
        DISPLAY.HELP_TEXT.MANAGING_TASKS,
        DISPLAY.HELP_TEXT.CALENDAR_SETTINGS,
        DISPLAY.HELP_TEXT.ADDING_JOURNAL,
        DISPLAY.HELP_TEXT.JOURNAL_MODIFICATIONS,
        DISPLAY.HELP_TEXT.ADDING_NOTES,
        DISPLAY.HELP_TEXT.NOTES_MODIFICATIONS
    ];

    useEffect(() =>{
        const observer = new IntersectionObserver(
            entries =>{
                entries.forEach(entry =>{
                    if(entry.isIntersecting){
                        const index = Number(
                            entry.target.id.replace('guide-section-', '')
                        );
                        setCurrentSection(index);
                    }
                });
            },
            { threshold: 0.5 }
        );
    
        sections.forEach((_, index) =>{
            const section = document.getElementById(`guide-section-${index}`);
            if(section){
                observer.observe(section);
            }
        });
    
        return () => observer.disconnect();
    }, []);

    return (
        <div className="fullscreen-overlay">
        <div className="common-page">
            {/* Scrollbar */}
            <Flex position='fixed' right='25px' top='50%' transform='translateY(-50%)' direction='column' gap='12px' zIndex={100}>
                {
                    sections.map((section, index) =>
                        <Tooltip key={index} label={section} backgroundColor={theme.hoverBg} color={theme.textSecondary} placement='left' hasArrow autoFocus={false}>
                            <Box key={index} width='18px' height='18px' borderRadius='50%' backgroundColor={currentSection === index ? theme.primary : theme.border} cursor='pointer'
                                onClick={ ()=> document.getElementById(`guide-section-${index}`)?.scrollIntoView({ behavior:'smooth' }) }
                            />
                        </Tooltip>
                    )
                }
            </Flex>

            <GuideSection id='guide-section-0' justify="start">
                <Flex align='center' justify='space-between' paddingBottom={theme.paddingL} width='100%' top={0}>
                    <QuestionOutlineIcon color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                    <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                        {DISPLAY.HELP_TEXT.GUIDE}
                    </Text>
                    <Spacer/>
                    <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> setShowModal(false)} customStyle={{width:'fit-content'}}/>
                </Flex>
                <Divider borderColor={theme.border} borderWidth='1px' />

                <Text fontSize='6xl' color={theme.primary} fontWeight={700} textAlign='center' marginTop='100px' lineHeight='1.3'>
                    ⛉Aegis
                </Text>
                <Text fontSize='6xl' color={theme.primary} fontWeight={700} textAlign='center' marginTop='10px' lineHeight='1.3'>
                    {DISPLAY.HELP_TEXT.PLANNER}
                </Text>
                <Flex direction='column' justify='center' align='center' marginTop='70px'>
                    <Text fontSize='4xl' color={theme.text} fontWeight={600} textAlign='center' marginBottom={theme.spacing} lineHeight='1.2'>
                        {DISPLAY.HELP_TEXT.PLANNER_TAGLINE}
                    </Text>
                    <motion.div
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <CiCircleChevDown color={theme.textSecondary} size='60px' cursor='pointer' />
                    </motion.div>
                </Flex>
            </GuideSection>

            
            <GuideSection id='guide-section-1'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.USING_COLLECTIONS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={ViewCollection} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.COLLECTION_DETAILS_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={EditCollection} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.EDITING_COLLECTION_ENTRIES}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-2'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.COLLECTION_SETTINGS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={CollectionSettings} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.COLLECTION_SETTINGS_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.COLLECTION_SETTINGS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-3'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.MANAGING_SCHEDULE}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AddSchedule} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADD_WEEKLY_SCHEDULE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={ViewSchedule} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.VIEW_SCHEDULE_IN_CALENDAR}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-4'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.MANAGING_TASKS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AddTask} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADDING_TASK_IN_CALENDAR}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={CompleteTask} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.COMPLETING_TASKS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-5'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.CALENDAR_SETTINGS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={CalendarSettings} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CALENDAR_SETTINGS_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CALENDAR_SETTINGS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-6'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ADDING_JOURNAL}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AddingJournal} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADD_JOURNAL_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={AccessingJournal} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ACCESSING_JOURNALS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-7'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.JOURNAL_MODIFICATIONS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={EditJournal} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.EDITING_JOURNAL_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={JournalSettings} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DISABLE_JOURNAL_MODIFICATIONS_SETTINGS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-8'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ADDING_NOTES}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AddNote} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADD_NOTES_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={AccessingNote} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ACCESSING_NOTES}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-9'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.NOTES_MODIFICATIONS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={EditNote} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.EDITING_NOTES_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={NoteSettings} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DISABLE_NOTES_MODIFICATIONS_SETTINGS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>

        </div>
        </div>
    );
}
