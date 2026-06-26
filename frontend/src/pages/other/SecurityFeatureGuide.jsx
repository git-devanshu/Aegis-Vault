import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Spacer, Grid, Image, Box, Tooltip } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { CiCircleChevDown } from "react-icons/ci";

import ActionButton from "../../common-components/form/ActionButton";
import GuideSection from "../../common-components/GuideSection";

import ActiveSessions from '../../assets/guide-images/active-sessions.png';
import TerminateSessions from '../../assets/guide-images/terminate-session.png';
import SessionInsights from '../../assets/guide-images/sessions-insights.png';
import SessionLocations from '../../assets/guide-images/session-locations.png';
import NewPasskey from '../../assets/guide-images/new-passkey.png';
// import  from '../../assets/guide-images/';
// import  from '../../assets/guide-images/';


export default function SecurityFeatureGuide({setShowModal}) {
    const {DISPLAY} = useLanguage();

    const [currentSection, setCurrentSection] = useState(0);

    const sections = [
        DISPLAY.HELP_TEXT.TITLE,
        DISPLAY.HELP_TEXT.MANAGE_SESSIONS,
        DISPLAY.HELP_TEXT.ACTIVE_SESSION_INSIGHTS,
        DISPLAY.HELP_TEXT.PASS_KEY
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
                    {DISPLAY.HELP_TEXT.ACCOUNT_SECURITY}
                </Text>
                <Flex direction='column' justify='center' align='center' marginTop='70px'>
                    <Text fontSize='4xl' color={theme.text} fontWeight={600} textAlign='center' marginBottom={theme.spacing} lineHeight='1.2'>
                        {DISPLAY.HELP_TEXT.SECURE_ACCOUNT}
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
                    {DISPLAY.HELP_TEXT.MANAGE_SESSIONS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={ActiveSessions} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.VIEW_ACTIVE_SESSIONS}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={TerminateSessions} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.TERMINATE_UNWANTED_SESSION}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-2'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ACTIVE_SESSION_INSIGHTS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={SessionInsights} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.GET_ACTIVE_SESSION_INSIGHTS}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={SessionLocations} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.LOCATION_PRECISE_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>

            
            <GuideSection id='guide-section-3'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.PASS_KEY}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={NewPasskey} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.PASS_KEY_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.PASS_KEY_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>

        </div>
        </div>
    );
}
