import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Box, ButtonGroup, Divider, Flex, Grid, Spacer, Text } from '@chakra-ui/react'
import useLanguage, { getLanguageIcon, getLanguageName, setLanguage } from "../hooks/useLanguage";
import SYSTEM_DATA from '../assets/system-data.json';
import { theme } from '../themes/theme';
import useTheme from "../hooks/useTheme";

import { LockIcon } from "@chakra-ui/icons";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { RiShoppingBag4Line, RiStickyNoteLine } from "react-icons/ri";
import { BsCalendar, BsFileSpreadsheet } from "react-icons/bs";
import { GiGoldBar, GiMoneyStack } from "react-icons/gi";
import { TbCopyCheck } from "react-icons/tb";
import { GrTasks } from "react-icons/gr";

import ActionButton from "../common-components/form/ActionButton";
import TitleBar from "../common-components/navbar/TitleBar";
import CircleIconButton from "../common-components/form/CircleIconButton";
import Popup from "../common-components/popup/Popup";
import ProblemConnections from "../common-components/landing/ProblemConnections";
import AnimatedVault from "../common-components/landing/AnimatedVault";
import FeaturedVaults from "../common-components/landing/FeaturedVaults";
import ZeroKnowledgeFlow from "../common-components/landing/ZeroKnowledgeFlow";
import DayTimeline from "../common-components/landing/DayTimeline";
import BrowserExtensionPreview from "../common-components/landing/BrowserExtensionPreview";
import HowItWorksSteps from "../common-components/landing/HowItWorksSteps";
import FAQAccordion from "../common-components/landing/FAQAccordion";
import Footer from "../common-components/landing/Footer";
import PasswordGuide from '../pages/password-manager/FeatureGuide';
import ExpenseGuide from '../pages/expense-manager/FeatureGuide';
import InvestmentGuide from '../pages/investment-manager/FeatureGuide';
import PlanningGuide from '../pages/planning-manager/FeatureGuide';


export default function Landing() {
    const {DISPLAY} = useLanguage();
    const {aegisTheme, toggleAegisTheme} = useTheme();
    const navigate = useNavigate();

    const [showLanguageSettingPopup, setShowLanguageSettingPopup] = useState(false);
    const [showPasswordGuide, setShowPasswordGuide] = useState(false);
    const [showExpenseGuide, setShowExpenseGuide] = useState(false);
    const [showInvestmentGuide, setShowInvestmentGuide] = useState(false);
    const [showPlanningGuide, setShowPlanningGuide] = useState(false);

    const passwordRef = useRef();
    const calendarRef = useRef();
    const excelRef = useRef();
    const notesRef = useRef();
    const expensesRef = useRef();
    const investmentsRef = useRef();
    const todoRef = useRef();
    const shoppingRef = useRef();
    const tasksRef = useRef();
    const containerRef = useRef();


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
                    borderRight='none' borderBottom='none'
                    animation={`flashToPrimary 3s ${firstBoxDelay}s ease-in-out`}
                    _hover={{backgroundColor: theme.primary, transition: '0.2s'}} 
                />
                {[...Array(totalBoxes - 1)].map((box)=> {
                    const delay = Math.floor(Math.random() * 31) + 1;
                    return(
                        <Box height={boxHeightAndWidth} width={boxHeightAndWidth} 
                            border={`1px solid ${theme.border}`} 
                            borderRight='none' borderBottom='none'
                            animation={`flashToPrimary 4s ${delay}s ease-in-out`}
                            _hover={{backgroundColor: theme.primary, transition: '0.2s'}} 
                        />
                    )}
                )}
            </Flex>
        )
    };

    const ProblemSectionCard = React.forwardRef(({title, Icon, color, style}, ref) =>{
        return(
            <Box ref={ref} padding='3px' width='fit-content' border={`1px solid ${color}`} borderRadius={theme.paddingL} style={style} backgroundColor={theme.bg}>
                <Flex align='center' gap={theme.paddingL} width='fit-content' padding={theme.paddingL} border={`1px solid ${color}`} borderRadius={theme.radius}>
                    <Icon color={color} size='18px' />
                    <Text color={theme.text} fontSize={theme.textSize}>
                        {title}
                    </Text>
                </Flex>
            </Box>
        );
    });


    const SectionGap = () => (
        <Box height='40px' width={{base: '90%', md: '94%'}} margin='0 auto' borderLeft={`1px solid ${theme.border}`} borderRight={`1px solid ${theme.border}`} />
    );


    const SectionHeader = ({title, subtitle}) => (
        <Box borderBottom={`1px solid ${theme.border}`} padding={theme.spacing}>
            <Text fontSize='5xl' color={theme.primary} marginTop={theme.marginL} textAlign={{base: 'center', md: 'left'}} fontWeight={700} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                {title}
            </Text>
            <Text fontSize='xl' color={theme.text} marginBottom={theme.spacing} textAlign={{base: 'center', md: 'left'}} fontWeight={500} marginTop={theme.spacing} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                {subtitle}
            </Text>
        </Box>
    );


    const SectionShell = ({children}) => (
        <Flex direction='column' justify='center' align='start' width='100%'>
            <Flex direction='column' minHeight='100%' width={{base: '90%', md: '94%'}} backgroundColor={theme.bg} marginX={{base: '5%', md: '3%'}} border={`1px solid ${theme.border}`}>
                {children}
            </Flex>
        </Flex>
    );


    return (
        <div className="common-page dot-grid-bg" style={{padding: 0}}>
            <Flex direction='column' justify='center' align='start' height='100vh'>
                <Box height='100%' width={{base: '90%', md: '94%'}} backgroundColor={theme.bg} marginX={{base: '5%', md: '3%'}} borderLeft={`1px solid ${theme.border}`} borderRight={`1px solid ${theme.border}`} borderBottom={`1px solid ${theme.border}`}>
                    <TitleBar titleSize="lg" style={{paddingTop: theme.spacing, paddingBottom: theme.spacing}}>
                        <ButtonGroup>
                            <CircleIconButton icon={aegisTheme === 'dark' ? <MdOutlineLightMode/> : <MdOutlineDarkMode/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.THEME} ttPlacement="bottom" onClick={toggleAegisTheme}/>
                            <CircleIconButton icon={getLanguageIcon(localStorage.getItem('aegis-language') || 'en')} iconSize="18px" tooltip={getLanguageName(localStorage.getItem('aegis-language') || 'en')} ttPlacement="bottom" onClick={()=> setShowLanguageSettingPopup(true)} />
                            <ActionButton name={DISPLAY.BUTTONS.LOGIN} onClick={()=> navigate('/login')} actionType='primary' customStyle={{width: 'fit-content'}} />
                        </ButtonGroup>
                    </TitleBar>
                    <Divider borderColor={theme.border} borderWidth='1px' />

                    <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} height='calc(100% - 82px)' >
                        {/* Title div Left side */}
                        <Flex direction='column' justify='start' align='start' height='100%' width='100%' padding={theme.paddingL}>
                            <Flex direction='column' marginTop={{base: '40px', md: '70px', lg: '110px'}} align={{base: 'center', md: 'start'}}>
                                <Text fontSize='6xl' color={theme.primary} textAlign={{base: 'center', md: 'left'}} fontWeight={700} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                                    {DISPLAY.TEXT.MEET} Aegis
                                </Text>
                                <Text fontSize='2xl' color={theme.text} textAlign={{base: 'center', md: 'left'}} fontWeight={500} marginTop={theme.spacing} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                                    {DISPLAY.TEXT.HERO_SECTION_SUBTITLE}
                                </Text>
                                <Flex align='center' justify='center' width='fit-content' border={`1px solid ${theme.border}`} padding={theme.paddingL} marginTop={{base: theme.spacing, md: '40px'}} marginLeft={{base: 'none', md: theme.spacing}}>
                                    <Box height='1px' bgColor={theme.border} width={{base: '13px', md: '31px'}} position='relative' left={{base: '-21px', md: '-41px'}} />
                                    <Text fontSize={theme.textSize} color={theme.textSecondary} position='relative' left={{base: '-10px', md: '-30px'}}>
                                        {DISPLAY.TEXT.CREATE_NEW_ACCOUNT_TODAY}
                                    </Text>
                                    <ActionButton name={DISPLAY.BUTTONS.GET_STARTED} onClick={()=> navigate('/signup')} actionType='primary' customStyle={{width: 'fit-content'}} />
                                </Flex>
                            </Flex>
                            <Spacer/>
                            <Flex gap={theme.paddingL} align='center' padding={{base: 0, md: theme.paddingL}}>
                                <LockIcon boxSize='14px' color={theme.primary}/>
                                <Text fontSize={theme.smallTextSize} color={theme.textSecondary}>
                                    Protected by AES-GCM encryption
                                </Text>
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
                                <HeroSectionGridRow totalBoxes={4} />
                                <HeroSectionGridRow totalBoxes={5} />
                                <HeroSectionGridRow totalBoxes={6} hideBorderLeft={true} />
                            </Box>
                        </Flex>
                    </Grid>
                </Box>
            </Flex>

            <SectionGap />

            <Flex direction='column' justify='center' align='start'>
                <Flex direction='column' width={{base: '90%', md: '94%'}} backgroundColor={theme.bg} marginX={{base: '5%', md: '3%'}} border={`1px solid ${theme.border}`}>
                    <Box borderBottom={`1px solid ${theme.border}`} padding={theme.spacing}>
                        <Text fontSize='5xl' color={theme.primary} textAlign={{base: 'center', md: 'left'}} fontWeight={700} marginTop={theme.marginL} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                            {DISPLAY.TEXT.EVERYTHING_UNDER_THE_HOOD}
                        </Text>
                        <Text fontSize='xl' color={theme.text} textAlign={{base: 'center', md: 'left'}} fontWeight={500} marginBottom={theme.spacing} marginTop={theme.spacing} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                            {DISPLAY.TEXT.STOP_MANAGING_ACROSS_MULTIPLE_APPS}
                        </Text>
                    </Box>

                    <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}}>
                        <Flex ref={containerRef} position='relative' zIndex={1} borderRight={{base: 'none', md: `1px solid ${theme.border}`}} borderBottom={{base: `1px solid ${theme.border}`, md: 'none'}} align='center' justify='center' padding={theme.spacing}>
                            <ProblemConnections containerRef={containerRef}
                                connections={[
                                    [passwordRef, excelRef],
                                    [calendarRef, excelRef],
                                    [excelRef, todoRef],
                                    [calendarRef, expensesRef],
                                    [todoRef, notesRef],
                                    [expensesRef, notesRef],
                                    [shoppingRef, investmentsRef],
                                    [investmentsRef, tasksRef]
                                ]}
                            />
                            <Grid templateColumns={{base: '1fr 1fr', lg: '1fr 1fr 1fr'}} gap={theme.spacing} width='100%' >
                                <Flex direction='column' gap={theme.spacing}>
                                    <ProblemSectionCard ref={passwordRef} title={DISPLAY.TEXT.PASSWORDS} Icon={LockIcon} color={theme.accent} style={{marginLeft: '20px'}} />
                                    <ProblemSectionCard ref={excelRef} title={DISPLAY.TEXT.EXCEL} Icon={BsFileSpreadsheet} color={theme.accent} style={{marginTop: '25px'}} />
                                    <ProblemSectionCard ref={todoRef} title={DISPLAY.TEXT.TODO_LIST} Icon={TbCopyCheck} color={theme.accent} style={{marginLeft: '35px', marginTop: '10px'}} />
                                </Flex>

                                <Flex direction='column' gap={theme.spacing} marginTop={{base: '40px', lg: '80px'}}>
                                    <ProblemSectionCard ref={calendarRef} title={DISPLAY.TEXT.CALENDAR} Icon={BsCalendar} color={theme.accent} />
                                    <ProblemSectionCard ref={expensesRef} title={DISPLAY.TEXT.EXPENSES} Icon={GiMoneyStack} color={theme.accent} style={{marginLeft: '20px', marginTop: '20px'}} />
                                    <ProblemSectionCard ref={notesRef} title={DISPLAY.TEXT.NOTES} Icon={RiStickyNoteLine} color={theme.accent}  style={{marginTop: '20px'}} />
                                </Flex>

                                <Flex direction='column' gap={theme.spacing} display={{base: 'none', lg: 'flex'}} marginTop='50px'>
                                    <ProblemSectionCard ref={shoppingRef} title={DISPLAY.TEXT.SHOPPING_LIST} Icon={RiShoppingBag4Line} color={theme.accent} />
                                    <ProblemSectionCard ref={investmentsRef} title={DISPLAY.TEXT.INVESTMENTS} Icon={GiGoldBar} color={theme.accent} style={{marginLeft: '30px', marginTop: '30px'}} />
                                    <ProblemSectionCard ref={tasksRef} title={DISPLAY.TEXT.TASKS} Icon={GrTasks} color={theme.accent} style={{marginTop: '20px'}} />
                                </Flex>
                            </Grid>
                        </Flex>

                        <Flex width='100%' justify='center' align='center' minHeight='max-content' paddingY={theme.spacing}>
                            <AnimatedVault />
                        </Flex>
                    </Grid>
                </Flex>
            </Flex>

            <SectionGap />

            {/* Featured Vaults */}
            <SectionShell>
                <SectionHeader
                    title={DISPLAY.TEXT.FEATURED_VAULTS_TITLE}
                    subtitle={DISPLAY.TEXT.FEATURED_VAULTS_SUBTITLE}
                />
                <FeaturedVaults />
            </SectionShell>

            <SectionGap />

            {/* Zero Knowledge Security */}
            <SectionShell>
                <SectionHeader
                    title={DISPLAY.TEXT.ZERO_KNOWLEDGE_TITLE}
                    subtitle={DISPLAY.TEXT.ZERO_KNOWLEDGE_SUBTITLE}
                />
                <ZeroKnowledgeFlow />
            </SectionShell>

            {/* A Day with Aegis */}
            <SectionShell>
                <SectionHeader
                    title={DISPLAY.TEXT.DAY_WITH_AEGIS_TITLE}
                    subtitle={DISPLAY.TEXT.DAY_WITH_AEGIS_SUBTITLE}
                />
                <Box maxWidth='640px' margin='0 auto' width='100%'>
                    <DayTimeline />
                </Box>
            </SectionShell>

            <SectionGap />

            {/* Browser Extension */}
            <SectionShell>
                <SectionHeader 
                    title={DISPLAY.TEXT.BROWSER_EXTENSION_TITLE}
                    subtitle={DISPLAY.TEXT.BROWSER_EXTENSION_SUBTITLE}
                />
                <BrowserExtensionPreview />
            </SectionShell>

            <SectionGap />

            {/* How It Works */}
            <SectionShell>
                <SectionHeader 
                    title={DISPLAY.TEXT.HOW_IT_WORKS_TITLE}
                    subtitle={DISPLAY.TEXT.HOW_IT_WORKS_SUBTITLE}
                />
                <HowItWorksSteps />
            </SectionShell>

            {/* FAQ */}
            <SectionShell>
                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap='1px' backgroundColor={theme.border}>
                    <Box width='100%' backgroundColor={theme.bg} padding={theme.spacing}>
                        <Text fontSize='5xl' color={theme.primary} textAlign={{base: 'center', md: 'left'}} fontWeight={700} marginTop={theme.marginL} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                            {DISPLAY.TEXT.FAQ_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} textAlign={{base: 'center', md: 'left'}} fontWeight={500} marginBottom={theme.spacing} marginTop={theme.spacing} marginLeft={{base: 'none', md: theme.spacing}} lineHeight='1.2'>
                            {DISPLAY.TEXT.FAQ_SUBTITLE}
                        </Text>
                    </Box>
                    <Box width='100%' backgroundColor={theme.bg}>
                        <FAQAccordion />
                    </Box>
                </Grid>
            </SectionShell>

            <Footer setShowPasswordGuide={setShowPasswordGuide} setShowExpenseGuide={setShowExpenseGuide} setShowInvestmentGuide={setShowInvestmentGuide} setShowPlanningGuide={setShowPlanningGuide} />


            {/* Vault Guide Modals */}
            {showPasswordGuide && <PasswordGuide setShowModal={setShowPasswordGuide} />}
            {showExpenseGuide && <ExpenseGuide setShowModal={setShowExpenseGuide} />}
            {showInvestmentGuide && <InvestmentGuide setShowModal={setShowInvestmentGuide} />}
            {showPlanningGuide && <PlanningGuide setShowModal={setShowPlanningGuide} />}


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
