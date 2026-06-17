import React, { useMemo } from "react";
import { Grid, Flex, Text, Box, Spacer } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import { TbMoneybagMove, TbMoneybag } from "react-icons/tb";
import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../popup/InfoTooltip";

export default function WidgetGIncomeOverview({country, analytics}) {
    const {DISPLAY} = useLanguage();

    const MetricCard = ({title, value, Icon, numericValue, referenceValue, refText, refColor}) =>(
        <Flex direction='column' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px', width: 'fit-content'}}>
                <Icon size='22px' color={theme.text} />
            </div>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS}>
                {title}
            </Text>
            <Spacer/>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginS}>
                {value}
            </Text>
            <Text color={refColor} fontSize={theme.smallTextSize} marginTop={theme.marginL} fontWeight={500}>{((numericValue / referenceValue) * 100).toFixed(2)}% ({refText})</Text>
        </Flex>
    );

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.SELECTED_INCOME_OVERVIEW}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.INCOME_OVERVIEW_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}>
                <Flex direction='column' gap={theme.marginL}>
                    <Grid templateColumns='1fr 1fr' gap={theme.marginL} height='100%'>
                        <MetricCard title={DISPLAY.TEXT.INCOME_AMOUNT} value={`${country.currency.symbol} ${analytics.incomeAmount.toLocaleString(country.locale)}`} numericValue={analytics.incomeAmount} Icon={TbMoneybag} referenceValue={analytics.totalAccountIncome} refText={DISPLAY.TEXT.TOTAL_INCOME} refColor={theme.success} />
                        <MetricCard title={DISPLAY.TEXT.TOTAL_SPENT} value={`${country.currency.symbol} ${analytics.totalExpense.toLocaleString(country.locale)}`} numericValue={analytics.totalExpense} Icon={TbMoneybagMove} referenceValue={analytics.incomeAmount} refText={DISPLAY.TEXT.INCOME_AMOUNT} refColor={theme.error}/>
                    </Grid>
                </Flex>
                
                <Flex direction='column' gap={theme.paddingL} height='100%'>
                    <Grid height='100%' templateColumns='1fr 1fr' padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                        <Grid borderRight={`1px solid ${theme.border}`} placeItems='center'>
                            <Text color={theme.primary} fontSize={theme.textSize} fontWeight={500} textAlign='center'>{country.currency.symbol} {analytics.remainingAmount.toLocaleString(country.locale)}</Text>
                            <Text color={theme.primary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.INCOME_REMAINING}</Text>
                        </Grid>
                        <Grid placeItems='center'>
                            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>{analytics.savingsRate.toFixed(2)}%</Text>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.SAVINGS_RATE}</Text>
                        </Grid>
                    </Grid>
                    <Grid height='100%' templateColumns='1fr 1fr' padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                        <Grid borderRight={`1px solid ${theme.border}`} placeItems='center'>
                            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>{analytics.transactionCount}</Text>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.TRANSACTIONS}</Text>
                        </Grid>
                        <Grid placeItems='center'>
                            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>{country.currency.symbol} {analytics.averageTransaction.toFixed(2)}</Text>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.AVERAGE_TRANSACTION}</Text>
                        </Grid>
                    </Grid>
                </Flex>
            </Grid>
        </Box>
    );
}
