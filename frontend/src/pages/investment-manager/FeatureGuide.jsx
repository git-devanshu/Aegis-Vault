import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Spacer, Grid, Image, Box, Tooltip } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { CiCircleChevDown } from "react-icons/ci";
import { MdCreditCard, MdSsidChart } from "react-icons/md";
import { FaCoins } from "react-icons/fa";

import ActionButton from "../../common-components/form/ActionButton";
import GuideSection from "../../common-components/GuideSection";

import ManageAccounts from '../../assets/guide-images/manage-accounts.png';
import SameBankAccount from '../../assets/guide-images/same-bank-account.png';
import AccessingInvestments from '../../assets/guide-images/accessing-investments.png';
import AddingInvestments from '../../assets/guide-images/adding-investments.png';
import CreatedFD from '../../assets/guide-images/created-fd.png';
import DeletingFD from '../../assets/guide-images/deleting-fd.png';
import RollingFD from '../../assets/guide-images/rolling-fd.png';
import RolledFDHistory from '../../assets/guide-images/rolled-fd-history.png';
import ClosingFD from '../../assets/guide-images/closing-fd.png';
import ROIAnalytics from '../../assets/guide-images/roi-analytics.png';
import DeletingRD from '../../assets/guide-images/deleting-rd.png';
import ClosingRD from '../../assets/guide-images/closing-rd.png';
import AddingGold from '../../assets/guide-images/adding-gold.png';
import DeletingGold from '../../assets/guide-images/deleting-gold.png';
import SellingGold from '../../assets/guide-images/selling-gold.png';
import AddingStocks from '../../assets/guide-images/adding-stocks.png';
import DeletingStocks from '../../assets/guide-images/deleting-stocks.png';
import SellingStocks from '../../assets/guide-images/selling-stocks.png';
// import  from '../../assets/guide-images/';
// import  from '../../assets/guide-images/';



export default function FeatureGuide({setShowModal}) {
    const {DISPLAY} = useLanguage();

    const [currentSection, setCurrentSection] = useState(0);

    const sections = [
        DISPLAY.HELP_TEXT.TITLE,
        DISPLAY.HELP_TEXT.INTRODUCTION,
        DISPLAY.HELP_TEXT.ACCOUNT_SELECTION,
        DISPLAY.HELP_TEXT.ACCESSING_INVESTMENTS,
        DISPLAY.HELP_TEXT.ADDING_FD,
        DISPLAY.HELP_TEXT.ROLLING_FD,
        DISPLAY.HELP_TEXT.CLOSING_FD,
        DISPLAY.HELP_TEXT.ADDING_RD,
        DISPLAY.HELP_TEXT.CLOSING_RD,
        DISPLAY.HELP_TEXT.ADDING_GOLD,
        DISPLAY.HELP_TEXT.SELLING_GOLD,
        DISPLAY.HELP_TEXT.ADDING_STOCKS,
        DISPLAY.HELP_TEXT.SELLING_STOCKS
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
                    {DISPLAY.HELP_TEXT.INVESTMENT_MANAGER}
                </Text>
                <Flex direction='column' justify='center' align='center' marginTop='70px'>
                    <Text fontSize='4xl' color={theme.text} fontWeight={600} textAlign='center' marginBottom={theme.spacing} lineHeight='1.2'>
                        {DISPLAY.HELP_TEXT.TRACK_INVESTMENT_JOURNEY}
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
                    {DISPLAY.HELP_TEXT.TRACK_4_INVESTMENTS}
                </Text>

                <Grid templateColumns={{base: '1fr 1fr', md: '1fr 1fr 1fr 1fr'}} marginTop={theme.spacing} padding={theme.paddingL} gap={theme.paddingL} placeItems='center'>
                    <Flex direction='column' align='center' justify='center' height='100px' width='130px' border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} margin={theme.marginS} _hover={{backgroundColor: theme.hoverBg}}>
                        <MdCreditCard color={theme.primary} size='26px'/>
                        <Text color={theme.text} fontSize={theme.textSize} marginTop='10px'>
                            {DISPLAY.LABELS.FD}
                        </Text>
                    </Flex>
                    <Flex direction='column' align='center' justify='center' height='100px' width='130px' border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} margin={theme.marginS} _hover={{backgroundColor: theme.hoverBg}}>
                        <MdCreditCard color={theme.primary} size='26px'/>
                        <Text color={theme.text} fontSize={theme.textSize} marginTop='10px'>
                            {DISPLAY.LABELS.RD}
                        </Text>
                    </Flex>
                    <Flex direction='column' align='center' justify='center' height='100px' width='130px' border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} margin={theme.marginS} _hover={{backgroundColor: theme.hoverBg}}>
                        <FaCoins color={theme.primary} size='26px'/>
                        <Text color={theme.text} fontSize={theme.textSize} marginTop='10px'>
                            {DISPLAY.LABELS.GOLD_ASSETS}
                        </Text>
                    </Flex>
                    <Flex direction='column' align='center' justify='center' height='100px' width='130px' border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} margin={theme.marginS} _hover={{backgroundColor: theme.hoverBg}}>
                        <MdSsidChart color={theme.primary} size='26px'/>
                        <Text color={theme.text} fontSize={theme.textSize} marginTop='10px'>
                            {DISPLAY.LABELS.STOCKS}
                        </Text>
                    </Flex>
                </Grid>

                <Text fontSize='2xl' color={theme.text} textAlign='center' marginTop={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.TRACK_INVESTMENT_HISTORY}
                </Text>
            </GuideSection>

            
            <GuideSection id='guide-section-2'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ACCOUNT_SELECTION}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={SameBankAccount} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SAME_BANK_ACCOUNT}
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
            

            <GuideSection id='guide-section-3'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ACCESSING_INVESTMENTS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AccessingInvestments} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SWITCHING_INVESTMENTS_TYPES}
                        </Text>
                    </Box>

                    <Grid templateColumns={{base: '1fr', md: '1fr 2fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center' marginTop='-20px'>
                        <Image src={AddingInvestments} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Box width='100%'>
                            <Text fontSize='xl' color={theme.text} marginTop={theme.spacing} lineHeight='1.2'>
                                {DISPLAY.HELP_TEXT.ADDING_INVESTMENT_BUTTONS}
                            </Text>
                        </Box>
                    </Grid>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-4'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ADDING_FD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={CreatedFD} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CREATING_FD_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={DeletingFD} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DELETING_FD_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-5'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ROLLING_FD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={RollingFD} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ROLLING_MATURED_FD_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={RolledFDHistory} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ROLLED_FD_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-6'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.CLOSING_FD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={ClosingFD} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CLOSING_FD_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={ROIAnalytics} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CLOSED_FD_SHOWN_IN_ANALYTICS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-7'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ADDING_RD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Image src={DeletingRD} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                    <Box width='100%'>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CREATING_RD_SUBTITLE}
                        </Text>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.marginL} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DELETING_RD_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-8'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.CLOSING_RD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={ClosingRD} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CLOSING_RD_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={ROIAnalytics} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.CLOSED_RD_SHOWN_IN_ANALYTICS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-9'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ADDING_GOLD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AddingGold} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADDING_GOLD_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={DeletingGold} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DELETING_GOLD_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>

            
            <GuideSection id='guide-section-10'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.SELLING_GOLD}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={SellingGold} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SELLING_GOLD_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={ROIAnalytics} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SOLD_GOLD_SHOWN_IN_ANALYTICS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-11'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.ADDING_STOCKS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={AddingStocks} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.ADDING_STOCKS_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={DeletingStocks} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.DELETING_STOCKS_SUBTITLE}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>


            <GuideSection id='guide-section-12'>
                <Text fontSize='4xl' color={theme.primary} textAlign='center' fontWeight={500} marginBottom={theme.spacing} lineHeight='1.2'>
                    {DISPLAY.HELP_TEXT.SELLING_STOCKS}
                </Text>

                <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} padding={theme.spacing} gap={theme.spacing} placeItems='center'>
                    <Box width='100%'>
                        <Image src={SellingStocks} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SELLING_STOCKS_SUBTITLE}
                        </Text>
                    </Box>

                    <Box width='100%'>
                        <Image src={ROIAnalytics} width={{base: '90%', md: '70%'}} margin='0 auto' border={`1px solid ${theme.border}`} borderRadius={theme.radius}/>
                        <Text fontSize='xl' color={theme.text} textAlign='center' marginX={theme.marginL} marginTop={theme.spacing} lineHeight='1.2'>
                            {DISPLAY.HELP_TEXT.SOLD_STOCKS_SHOWN_IN_ANALYTICS}
                        </Text>
                    </Box>
                </Grid>
            </GuideSection>

            {/* Special Settings related details */}

        </div>
        </div>
    );
}
