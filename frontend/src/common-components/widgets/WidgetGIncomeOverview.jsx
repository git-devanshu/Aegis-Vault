import React, { useMemo } from "react";
import { Grid, Flex, Text, Box, Spacer } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import { TbMoneybagMove, TbMoneybag } from "react-icons/tb";
import WidgetCTopExpenses from "./WidgetCTopExpenses";



export default function WidgetGIncomeOverview({selectedAccount, selectedTracker, expenseData, country, setSelectedTab, onBack}) {
    const {DISPLAY} = useLanguage();

    const metrics = useMemo(()=>{
        const incomeAmount = Number(selectedTracker?.amount || 0);
        const totalExpense = expenseData.reduce((sum, expense)=> sum + Number(expense.amount), 0);
        const transactionCount = expenseData.length;
        const remainingAmount = incomeAmount - totalExpense;

        const averageTransaction = transactionCount ? totalExpense / transactionCount : 0;
        const savingsRate = incomeAmount ? ((remainingAmount / incomeAmount) * 100) : 0;

        const totalAccountIncome = Number(selectedAccount?.totalIncome || 0);

        return {
            incomeAmount,
            totalExpense,
            remainingAmount,
            transactionCount,
            averageTransaction,
            savingsRate,
            totalAccountIncome
        };
    }, [selectedTracker, expenseData, selectedAccount]);

    const MetricCard = ({title, value, Icon, numericValue, referenceValue, refText, refColor}) =>(
        <Flex direction='column' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px', width: 'fit-content'}}>
                <Icon size='22px' color={theme.text} />
            </div>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS} marginBottom={theme.marginL}>
                {title}
            </Text>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL}>
                {value}
            </Text>
            <Text color={refColor} fontSize={theme.textSize} marginTop={theme.marginL} fontWeight={500}>{((numericValue / referenceValue) * 100).toFixed(2)}% {refText}</Text>
        </Flex>
    );

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.SELECTED_INCOME_OVERVIEW}
            </Text>

            <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}>
                <Flex direction='column' gap={theme.marginL}>
                    <Grid templateColumns='1fr 1fr' gap={theme.marginL} height='100%'>
                        <MetricCard title={DISPLAY.TEXT.INCOME_AMOUNT} value={`${country.currency.symbol} ${metrics.incomeAmount.toLocaleString(country.locale)}`} numericValue={metrics.incomeAmount} Icon={TbMoneybag} referenceValue={metrics.totalAccountIncome} refText={DISPLAY.TEXT.PART_OF_TOTAL_INCOME} refColor={theme.success} />
                        <MetricCard title={DISPLAY.TEXT.TOTAL_SPENT} value={`${country.currency.symbol} ${metrics.totalExpense.toLocaleString(country.locale)}`} numericValue={metrics.totalExpense} Icon={TbMoneybagMove} referenceValue={metrics.incomeAmount} refText={DISPLAY.TEXT.PART_OF_INCOME_AMOUNT} refColor={theme.error}/>
                    </Grid>
                    <Grid height='100%' templateColumns='1fr 1fr' padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                        <Grid borderRight={`1px solid ${theme.border}`} placeItems='center'>
                            <Text color={theme.primary} fontSize={theme.textSize} fontWeight={500} textAlign='center'>{country.currency.symbol} {metrics.remainingAmount.toLocaleString(country.locale)}</Text>
                            <Text color={theme.primary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.INCOME_REMAINING}</Text>
                        </Grid>
                        <Grid placeItems='center'>
                            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>{metrics.savingsRate.toFixed(2)}%</Text>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.SAVINGS_RATE}</Text>
                        </Grid>
                    </Grid>
                    <Grid height='100%' templateColumns='1fr 1fr' padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                        <Grid borderRight={`1px solid ${theme.border}`} placeItems='center'>
                            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>{metrics.transactionCount}</Text>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.TRANSACTIONS}</Text>
                        </Grid>
                        <Grid placeItems='center'>
                            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>{country.currency.symbol} {metrics.averageTransaction.toFixed(2)}</Text>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.AVERAGE_TRANSACTION}</Text>
                        </Grid>
                    </Grid>
                </Flex>

                <WidgetCTopExpenses expenseData={expenseData} selectedAccount={selectedAccount} selectedTracker={selectedTracker} onBack={onBack} setSelectedTab={setSelectedTab}/>
                
                {/* <Flex direction='column' gap={theme.paddingL} height='100%'>
                    
                    
                </Flex> */}
            </Grid>
        </Box>
    );
}
