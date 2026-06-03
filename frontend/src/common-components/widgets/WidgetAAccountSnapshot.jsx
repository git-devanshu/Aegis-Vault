import React, { useMemo } from "react";
import { Grid, Flex, Text, Image, Box, Badge, Spacer, Divider } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import InputBox from "../form/InputBox";
import useLanguage from "../../hooks/useLanguage";

import { TbMoneybagHeart } from "react-icons/tb";
import { GiMoneyStack } from 'react-icons/gi';
import { RiPercentFill } from "react-icons/ri";
import { PiWalletFill } from "react-icons/pi";
import ActionButton from "../form/ActionButton";
import { ExternalLinkIcon } from "@chakra-ui/icons";


export default function WidgetAAccountSnapshot({selectedAccount, trackerData, onBack, setSelectedTab}) {
    const {DISPLAY} = useLanguage();

    const metrics = useMemo(()=>{
        const totalIncome = Number(selectedAccount?.totalIncome || 0);
        const totalExpense = Number(selectedAccount?.totalExpense || 0);
        const currentBalance = totalIncome - totalExpense;
        const percentageConsumed = totalIncome ? (totalExpense / totalIncome) * 100 : 0;
        return {
            totalIncome,
            totalExpense,
            currentBalance,
            percentageConsumed
        };
    }, [selectedAccount]);

    const topTrackers = useMemo(()=>
        [...trackerData]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3),
        [trackerData]
    );

    const country = BANKS.country[selectedAccount.countryCode];

    const showAllIncomes = async() =>{
        onBack();
        setSelectedTab(0);
    }

    const MetricCard = ({title, value, Icon}) =>(
        <Flex direction='column' justify='space-between' style={{ backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius: theme.radius, padding:theme.paddingL }}>
            <Flex align='center'>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px'}}>
                    <Icon size='22px' color={theme.text} />
                </div>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginL}>{title}</Text>
            </Flex>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL} marginLeft={theme.marginS}>
                {value}
            </Text>
        </Flex>
    )

    const PrimaryMetricCard = ({title, value, Icon}) =>(
        <Flex direction='column' justify='space-between' style={{ backgroundColor:theme.primary, border:`1px solid ${theme.primary}`, borderRadius: theme.radius, padding:theme.paddingL }}>
            <Flex align='center'>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px'}}>
                    <Icon size='22px' color={theme.text} />
                </div>
                <Text color='#0F172A' fontSize={theme.smallTextSize} marginLeft={theme.marginL} fontWeight={500}>{title}</Text>
            </Flex>
            <Text color='#0F172A' fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL} marginLeft={theme.marginS}>
                {value}
            </Text>
        </Flex>
    )

    return (
        <Box padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.ACCOUNT_SNAPSHOT}
            </Text>
            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.marginL}>
                <Grid templateColumns='1fr 1fr' gap={theme.marginL}>
                    <PrimaryMetricCard title={DISPLAY.TEXT.TOTAL_BALANCE} value={`${country.currency.symbol} ${metrics.currentBalance.toLocaleString(country.locale)}`} Icon={PiWalletFill} />
                    <MetricCard title={DISPLAY.TEXT.SPENDING} value={`${metrics.percentageConsumed.toFixed(1)}%`} Icon={RiPercentFill}/>
                    <MetricCard title={DISPLAY.TEXT.TOTAL_INCOME} value={`${country.currency.symbol} ${metrics.totalIncome.toLocaleString(country.locale)}`} Icon={TbMoneybagHeart}/>
                    <MetricCard title={DISPLAY.TEXT.TOTAL_EXPENSE} value={`${country.currency.symbol} ${metrics.totalExpense.toLocaleString(country.locale)}`} Icon={GiMoneyStack}/>
                </Grid>
                <Flex direction='column'>
                    <Flex direction='column' border={`1px solid ${theme.border}`} bgColor={theme.hoverBg} borderRadius={theme.radius} padding={theme.paddingL}>
                        <Text fontSize={theme.smallTextSize} color={theme.textSecondary}>{DISPLAY.TEXT.TOP_INCOME}</Text>
                        <Flex alignItems='center' marginTop={theme.marginL} gap={theme.paddingL}>
                            <Badge color='#0F172A' bgColor={theme.primary} paddingX='8px'>1</Badge>
                            <Text fontSize={theme.textSize} color={theme.text}>{(topTrackers[0].name).substring(0, 25)}</Text>
                            <Spacer/>
                            <Text fontSize={theme.textSize} color={theme.text}>{country.currency.symbol} {topTrackers[0].amount.toLocaleString(country.locale)}</Text>
                        </Flex>
                    </Flex>
                    {topTrackers[1] && <Flex alignItems='center' marginTop={theme.marginL} gap={theme.paddingL} paddingX={theme.paddingL}>
                        <Badge color='#0F172A' bgColor={theme.primary} paddingX='8px'>2</Badge>
                        <Text fontSize={theme.textSize} color={theme.text}>{(topTrackers[1].name).substring(0, 25)}</Text>
                        <Spacer/>
                        <Text fontSize={theme.textSize} color={theme.text}>{country.currency.symbol} {topTrackers[1].amount.toLocaleString(country.locale)}</Text>
                    </Flex>}
                    {topTrackers[2] && <>
                        <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} />
                        <Flex alignItems='center' marginTop={theme.marginL} gap={theme.paddingL} paddingX={theme.paddingL}>
                            <Badge color='#0F172A' bgColor={theme.primary} paddingX='8px'>3</Badge>
                            <Text fontSize={theme.textSize} color={theme.text}>{(topTrackers[2].name).substring(0, 25)}</Text>
                            <Spacer/>
                            <Text fontSize={theme.textSize} color={theme.text}>{country.currency.symbol} {topTrackers[2].amount.toLocaleString(country.locale)}</Text>
                        </Flex>
                    </>}

                    <ActionButton name={DISPLAY.BUTTONS.SHOW_ALL_INCOMES} onClick={showAllIncomes} icon={<ExternalLinkIcon/>} customStyle={{marginTop: theme.marginL}}/>
                </Flex>
            </Grid>
        </Box>
    );
}
