import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Spacer, Grid, Image, Box, Tooltip } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { CiCircleChevDown } from "react-icons/ci";
import { IoIosArrowDropright } from "react-icons/io";

import ActionButton from "../../common-components/form/ActionButton";
import GuideSection from "../../common-components/GuideSection";

import AddExpense from '../../assets/guide-images/add-expense.png';
import AddIncome from '../../assets/guide-images/add-income.png';
import AnalyticsDashboard from '../../assets/guide-images/analytics-dashboard.png';
import CategorizeExpenses from '../../assets/guide-images/categorize-expenses.png';
import DeleteIncome from '../../assets/guide-images/delete-income.png';
import ImportFromQuickSave from '../../assets/guide-images/import-from-quick-save.png';
import ManageAccounts from '../../assets/guide-images/manage-accounts.png';
import OpenQuickSave from '../../assets/guide-images/open-quick-save.png';
import SetBudget from '../../assets/guide-images/set-budget.png';
import SwitchAccount from '../../assets/guide-images/switch-account.png';
import SwitchActiveIncome from '../../assets/guide-images/switch-active-income.png';
import TransferExpenses from '../../assets/guide-images/transfer-expenses.png';
import ViewCategories from '../../assets/guide-images/view-categories.png';


export default function FeatureGuide({setShowModal}) {
    const {DISPLAY} = useLanguage();

    const [currentSection, setCurrentSection] = useState(0);

    const sections = [
        DISPLAY.HELP_TEXT.TITLE,
        DISPLAY.HELP_TEXT.ACCOUNT_SELECTION,
        DISPLAY.HELP_TEXT.MANAGING_INCOME,
        DISPLAY.HELP_TEXT.ACTIVE_INCOME,
        DISPLAY.HELP_TEXT.MANAGING_EXPENSES,
        DISPLAY.HELP_TEXT.MANAGING_CATEGORIES,
        DISPLAY.HELP_TEXT.SETTING_BUDGET,
        DISPLAY.HELP_TEXT.ANALYTICS,
        DISPLAY.HELP_TEXT.TRANSFER_EXPENSES,
        DISPLAY.HELP_TEXT.USING_QUICKSAVE
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
                    {DISPLAY.HELP_TEXT.EXPENSE_MANAGER}
                </Text>
                <Flex direction='column' justify='center' align='center' marginTop='70px'>
                    <Text fontSize='4xl' color={theme.text} fontWeight={600} textAlign='center' marginBottom={theme.spacing} lineHeight='1.2'>
                        {DISPLAY.HELP_TEXT.TRACK_EXPENSES_IN_SMARTER_WAY}
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
                    {DISPLAY.HELP_TEXT.ACCOUNT_SELECTION}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={SwitchAccount} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SWITCH_ACCOUNT_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={ManageAccounts} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.MANAGE_ACCOUNTS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-2'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.MANAGING_INCOME}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} justifyContent='center' alignItems='center'>
                    <Box width='100%'>
                        <Image src={AddIncome} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADD_INCOME_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={DeleteIncome} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DELETE_INCOME_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-3'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ACTIVE_INCOME}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={SwitchActiveIncome} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ACTIVE_INCOME_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ACTIVE_INCOME_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-4'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.MANAGING_EXPENSES}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} justifyContent='center' alignItems='center'>
                    <Box width='100%'>
                        <Image src={AddExpense} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADD_EXPENSES}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={CategorizeExpenses} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DELETE_AND_CATEGORIZE_EXPENSES}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-5'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.MANAGING_CATEGORIES}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} justifyContent='center' alignItems='center'>
                    <Box width='100%'>
                        <Image src={ViewCategories} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.VIEW_CATEGORIES}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Flex gap={theme.paddingS} align='start'>
                            <IoIosArrowDropright color={theme.primary} size='20px' style={{marginTop: '3px', flexShrink: 0}} />
                            <Text fontSize='xl' color={theme.text} marginRight={theme.marginL} lineHeight='1.2'>
                                {DISPLAY.HELP_TEXT.CATEGORIES_DETAILS_L1}
                            </Text>
                        </Flex>
                        <Flex gap={theme.paddingS} align='start'>
                            <IoIosArrowDropright color={theme.primary} size='20px' style={{marginTop: '3px', flexShrink: 0}} />
                            <Text fontSize='xl' color={theme.text} marginRight={theme.marginL} lineHeight='1.2'>
                                {DISPLAY.HELP_TEXT.CATEGORIES_DETAILS_L2}
                            </Text>
                        </Flex>
                        <Flex gap={theme.paddingS} align='start'>
                            <IoIosArrowDropright color={theme.primary} size='20px' style={{marginTop: '3px', flexShrink: 0}} />
                            <Text fontSize='xl' color={theme.text} marginRight={theme.marginL} lineHeight='1.2'>
                                {DISPLAY.HELP_TEXT.CATEGORIES_DETAILS_L3}
                            </Text>
                        </Flex>
                        <Flex gap={theme.paddingS} align='start'>
                            <IoIosArrowDropright color={theme.primary} size='20px' style={{marginTop: '3px', flexShrink: 0}} />
                            <Text fontSize='xl' color={theme.text} marginRight={theme.marginL} lineHeight='1.2'>
                                {DISPLAY.HELP_TEXT.CATEGORIES_DETAILS_L4}
                            </Text>
                        </Flex>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-6'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.SETTING_BUDGET}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center' marginTop='-20px'>
                    <Image src={SetBudget} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SET_BUDGET_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SET_BUDGET_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-7'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ANALYTICS}
                </Text>
                <Box width='100%'>
                    <Image src={AnalyticsDashboard} width='70%' margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                        {DISPLAY.HELP_TEXT.ANALYTICS_SUBTITLE}
                    </Text>
                </Box>
            </GuideSection>


            <GuideSection id='guide-section-8'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.TRANSFER_EXPENSES}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={TransferExpenses} width='90%' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='3xl' color={theme.text} fontWeight={500} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.TRANSFER_EXPENSES_TITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.TRANSFER_EXPENSES_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-9'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.USING_QUICKSAVE}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} justifyContent='center' alignItems='center'>
                    <Grid templateColumns='1fr 5fr' width='100%' gap={theme.paddingL}>
                        <Image src={OpenQuickSave} width='100%' margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.OPEN_QUICKSAVE} {DISPLAY.HELP_TEXT.IMPORT_FROM_QUICKSAVE}
                        </Text>
                    </Grid>

                    <Box width='100%'>
                        <Image src={ImportFromQuickSave} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    </Box>
                </Grid>
            </GuideSection>
        </div>
        </div>
    );
}
