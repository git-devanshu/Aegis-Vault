import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Box, ButtonGroup, Divider, Flex, Grid, Heading, Image, Spacer, Text, Input } from '@chakra-ui/react'
import useLanguage, { getLanguageIcon, getLanguageName, setLanguage } from "../hooks/useLanguage";
import SYSTEM_DATA from '../assets/system-data.json';
import { theme } from '../themes/theme';

import GuideSection from "../common-components/GuideSection";
import { ArrowBackIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import ActionButton from "../common-components/form/ActionButton";
import TitleBar from "../common-components/navbar/TitleBar";
import CircleIconButton from "../common-components/form/CircleIconButton";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import useTheme from "../hooks/useTheme";
import Popup from "../common-components/popup/Popup";


export default function Landing() {
    const {DISPLAY} = useLanguage();
    const {aegisTheme, toggleAegisTheme} = useTheme();
    const navigate = useNavigate();

    const [showLanguageSettingPopup, setShowLanguageSettingPopup] = useState(false);

    const HeroSectionGridRow = ({totalBoxes, hideBorderTop=false, hideBorderLeft=false}) =>{
        const boxHeightAndWidth = '50px';
        const firstBoxDelay = Math.floor(Math.random() * 27) + 1;

        return(
            <Flex>
                <Spacer/>
                <Box height={boxHeightAndWidth} width={boxHeightAndWidth} 
                    border={`1px solid ${theme.border}`} 
                    borderTop={hideBorderTop ? 'none' : `1px solid ${theme.border}`} 
                    borderLeft={hideBorderLeft ? 'none' : `1px solid ${theme.border}`} 
                    animation={`flashToPrimary 3s ${firstBoxDelay}s ease-in-out`}
                    _hover={{backgroundColor: theme.primary, transition: '0.2s'}} 
                />
                {[...Array(totalBoxes - 1)].map((box)=> {
                    const delay = Math.floor(Math.random() * 31) + 1;
                    return(
                        <Box height={boxHeightAndWidth} width={boxHeightAndWidth} 
                            border={`1px solid ${theme.border}`} 
                            animation={`flashToPrimary 4s ${delay}s ease-in-out`}
                            _hover={{backgroundColor: theme.primary, transition: '0.2s'}} 
                        />
                    )}
                )}
            </Flex>
        )
    }

    return (
        <div className="common-page">
            <GuideSection id='guide-section-0' justify="start">
                <TitleBar>
                    <CircleIconButton icon={aegisTheme === 'dark' ? <MdOutlineLightMode/> : <MdOutlineDarkMode/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.THEME} ttPlacement="right" onClick={toggleAegisTheme}/>
                    <ActionButton name={getLanguageName(localStorage.getItem('aegis-language') || 'en')} icon={getLanguageIcon(localStorage.getItem('aegis-language') || 'en')} onClick={()=> setShowLanguageSettingPopup(true)} customStyle={{width: 'fit-content', marginLeft: theme.marginL}} />
                </TitleBar>
                <Divider borderColor={theme.border} borderWidth='1px' />

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} height='calc(100% - 71px)' width='100%'>
                    {/* Title div Left side */}
                    <Flex direction='column' justify='start' align='start' height='100%' width='100%'>
                        <Flex direction='column' marginTop={{base: '50px', md: '80px', lg: '120px'}} align={{base: 'center', md: 'start'}}>
                            <Text fontSize='7xl' color={theme.primary} textAlign={{base: 'center', md: 'left'}} fontWeight={700} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                                ⛉Aegis
                            </Text>
                            <Text fontSize='4xl' color={theme.text} textAlign={{base: 'center', md: 'left'}} fontWeight={500} marginTop={theme.spacing} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                                {DISPLAY.TEXT.HERO_SECTION_TAGLINE}
                            </Text>
                            <ButtonGroup gap={theme.paddingS} marginTop='30px' marginLeft={{base: 'none', md: theme.spacing}}>
                                <ActionButton name={DISPLAY.BUTTONS.SIGNUP} onClick={()=> navigate('/signup')} actionType='primary' customStyle={{width: 'fit-content'}} />
                                <ActionButton name={DISPLAY.BUTTONS.LOGIN} onClick={()=> navigate('/login')} customStyle={{width: 'fit-content'}} />
                            </ButtonGroup>
                        </Flex>
                    </Flex>

                    {/* Right side */}
                    <Flex direction='column' align='center' width='100%'>
                        <Spacer/>
                        <Box width='100%'>
                            <HeroSectionGridRow totalBoxes={1} hideBorderTop={true} />
                            <HeroSectionGridRow totalBoxes={1} />
                            <HeroSectionGridRow totalBoxes={2} />
                            <HeroSectionGridRow totalBoxes={2} />
                            <HeroSectionGridRow totalBoxes={3} />
                            <HeroSectionGridRow totalBoxes={3} />
                            <HeroSectionGridRow totalBoxes={4} />
                            <HeroSectionGridRow totalBoxes={5} />
                            <HeroSectionGridRow totalBoxes={6} />
                            <HeroSectionGridRow totalBoxes={7} hideBorderLeft={true} />
                        </Box>
                    </Flex>
                </Grid>
            </GuideSection>

            {/* Language Selection Popup */}
            <Popup isOpen={showLanguageSettingPopup} onClose={()=> setShowLanguageSettingPopup(false)} title={DISPLAY.TEXT.SELECT_LANGUAGE}>
                <div style={{marginBottom: theme.marginS}}>
                    {
                        SYSTEM_DATA.SUPPORTED_LANGUAGES.map(language => (
                            <ActionButton key={language.code} name={language.name} icon={getLanguageIcon(language.code)} onClick={()=> {setLanguage(language.code); setShowLanguageSettingPopup(false)}} customStyle={{marginBottom: theme.marginS}}/>
                        ))
                    }
                    <Text color={theme.textSecondary} fontSize={theme.textSize} textAlign='center'>
                        {DISPLAY.TEXT.TRANSLATION_DESCLAIMER}
                    </Text>
                </div>
            </Popup>
        </div>
    );
}
