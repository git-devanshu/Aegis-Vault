import React, { useMemo } from "react";
import { Grid, Flex, Text, Box } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from "../../hooks/useLanguage";

import { TbMoneybagHeart } from "react-icons/tb";
import { GiMoneyStack } from 'react-icons/gi';
import { RiPercentFill } from "react-icons/ri";
import { PiWalletFill } from "react-icons/pi";


export default function WidgetAAccountSnapshot({selectedAccount, analytics}) {
    const {DISPLAY} = useLanguage();

    const country = BANKS.country[selectedAccount.countryCode];

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
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.ACCOUNT_SNAPSHOT}
            </Text>
            <Grid templateColumns={{base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr'}} gap={theme.marginL}>
                <PrimaryMetricCard title={DISPLAY.TEXT.TOTAL_BALANCE} value={`${country.currency.symbol} ${analytics.currentBalance.toLocaleString(country.locale)}`} Icon={PiWalletFill} />
                <MetricCard title={DISPLAY.TEXT.TOTAL_INCOME} value={`${country.currency.symbol} ${analytics.totalIncome.toLocaleString(country.locale)}`} Icon={TbMoneybagHeart}/>
                <MetricCard title={DISPLAY.TEXT.TOTAL_EXPENSE} value={`${country.currency.symbol} ${analytics.totalExpense.toLocaleString(country.locale)}`} Icon={GiMoneyStack}/>
                <MetricCard title={DISPLAY.TEXT.SPENDING} value={`${analytics.percentageConsumed.toFixed(1)}%`} Icon={RiPercentFill}/>
            </Grid>
        </Box>
    );
}
