import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Spacer, Grid, Image, Box, Tooltip } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { CiCircleChevDown } from "react-icons/ci";

import ActionButton from "../../common-components/form/ActionButton";
import GuideSection from "../../common-components/GuideSection";

import OpenAddPasswordPopup from '../../assets/guide-images/open-add-password-popup.png';
import DropdownSwitchPasswordLabel from '../../assets/guide-images/dropdown-switch-password-label.png';
import OpenCreatePasswordPopup from '../../assets/guide-images/open-create-password-popup.png';
import RemoveLabel from '../../assets/guide-images/remove-label.png';
import RecoverLabel from '../../assets/guide-images/recover-label.png';
import HideRemovedLabels from '../../assets/guide-images/hide-removed-labels.png';
import SaveSite from '../../assets/guide-images/save-site.png';
import ExtensionLogin from '../../assets/guide-images/extension-login.png';


export default function FeatureGuide({setShowModal}) {
    const {DISPLAY} = useLanguage();

    const [currentSection, setCurrentSection] = useState(0);

    const sections = [
        DISPLAY.HELP_TEXT.TITLE,
        DISPLAY.HELP_TEXT.PASSWORD_ADDITION,
        DISPLAY.HELP_TEXT.ACCESSING_PASSWORDS,
        DISPLAY.HELP_TEXT.CREATING_LABEL,
        DISPLAY.HELP_TEXT.REMOVE_LABEL,
        DISPLAY.HELP_TEXT.RECOVER_LABEL,
        DISPLAY.HELP_TEXT.HIDE_REMOVED_LABELS,
        DISPLAY.HELP_TEXT.BROWSER_EXTENSION
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
                    {DISPLAY.HELP_TEXT.PASSWORD_MANAGER}
                </Text>
                <Flex direction='column' justify='center' align='center' marginTop='70px'>
                    <Text fontSize='4xl' color={theme.text} fontWeight={600} textAlign='center' marginBottom={theme.spacing} lineHeight='1.2'>
                        {DISPLAY.HELP_TEXT.SECURELY_STORE_MANAGE_PASSWORDS}
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
                    {DISPLAY.HELP_TEXT.PASSWORD_ADDITION}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={OpenAddPasswordPopup} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CLICK_PLUS_OPEN_POPUP}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.PASSWORD_ADDITION_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-2'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ACCESSING_PASSWORDS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={DropdownSwitchPasswordLabel} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.USE_DROPDOWN_SWITCH_LABEL}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ACCESSING_PASSWORDS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-3'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.CREATING_LABEL}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={OpenCreatePasswordPopup} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CLICK_BUTTON_OPEN_POPUP}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CREATING_LABEL_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-4'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.REMOVE_LABEL}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={RemoveLabel} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.REMOVE_LABEL_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.REMOVE_LABEL_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-5'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.RECOVER_LABEL}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={RecoverLabel} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.RECOVER_LABEL_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.RECOVER_LABEL_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-6'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.HIDE_REMOVED_LABELS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={HideRemovedLabels} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.HIDE_REMOVED_LABELS_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.HIDE_REMOVED_LABELS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-7'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.BROWSER_EXTENSION}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={ExtensionLogin} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.EXTESION_USE_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={SaveSite} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.PASSWORD_ACCESS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>
            
        </div>
        </div>
    );
}
