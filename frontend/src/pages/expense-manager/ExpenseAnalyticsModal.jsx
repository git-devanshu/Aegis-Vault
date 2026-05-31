import React, { useMemo } from "react";
import { Flex, Text, Divider, Spacer, Grid, Progress } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdAnalytics, MdDownload, MdOutlineInsights } from "react-icons/md";
import { FaChartPie, FaWallet, FaChartLine } from "react-icons/fa";
import { RiBubbleChartLine } from "react-icons/ri";

import ActionButton from "../../common-components/form/ActionButton";



export default function ExpenseAnalyticsModal({onBack, selectedAccount, selectedTracker, expenseData, categoryData, onDownloadReport, onDownloadStatement}) {
    if(!selectedAccount || !selectedTracker){
        return null;
    }

    const {DISPLAY} = useLanguage();
    const country = BANKS.country[selectedAccount.countryCode];

    const expenses = Array.isArray(expenseData) ? expenseData : [];
    const trackersLimits = Array.isArray(selectedTracker.limitsData) ? selectedTracker.limitsData : [];
    const hasExpenses = expenses.length > 0;
    const hasBudgetData = trackersLimits.length > 0;

    const analytics = useMemo(()=>{
        const totalExpenses = expenses.reduce((sum, expense)=> sum + expense.amount, 0);
        const remainingBalance = selectedTracker.amount - totalExpenses;
        const savingsRate = selectedTracker.amount > 0 ? ((remainingBalance / selectedTracker.amount) * 100).toFixed(1) : 0;

        const categoryTotals = {};
        expenses.forEach(expense =>{
            const category = categoryData?.[expense.categoryIndex];
            if(!category){
                return;
            }
            if(!categoryTotals[category.name]){
                categoryTotals[category.name] = {
                    ...category,
                    total: 0,
                    count: 0
                };
            }
            categoryTotals[category.name].total += expense.amount;
            categoryTotals[category.name].count += 1;
        });

        const sortedCategories = Object.values(categoryTotals).sort((a, b)=> b.total - a.total);

        const budgetAnalysis = trackersLimits.map(limit =>{
            const category = categoryData?.[limit.categoryIndex];
            if(!category){
                return null;
            }
            const spent = expenses.filter(expense => expense.categoryIndex === limit.categoryIndex).reduce((sum, expense)=> sum + expense.amount, 0);
            return {
                ...category,
                limit: limit.limit,
                spent,
                notified: limit.notified,
                percentage: limit.limit > 0 ? Math.min((spent / limit.limit) * 100, 100) : 0,
                exceeded: spent > limit.limit
            };
        }).filter(Boolean);

        return {
            totalExpenses,
            remainingBalance,
            savingsRate,
            sortedCategories,
            budgetAnalysis
        };
    }, [expenses, trackersLimits, selectedTracker, categoryData]);


    return (
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiBubbleChartLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                    {DISPLAY.LABELS.EXPENSE_ANALYTICS}
                </Text>

                <Spacer/>

                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width:'fit-content'}}/>
            </Flex>

            <Divider borderColor={theme.border} borderWidth='1px' />

            <div style={{paddingTop:theme.spacing}}>
                <Grid templateColumns={{base:'1fr', lg:'1fr 1fr'}} gap={theme.marginL}>
                    <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                        <Flex align='center' marginBottom={theme.marginL}>
                            <FaWallet color={theme.primary} style={{marginRight: theme.marginL}}/>

                            <Text color={theme.text} fontSize={theme.text} fontWeight={600}>
                                {DISPLAY.LABELS.BANK_ACCOUNT}
                            </Text>
                        </Flex>

                        <Text color={theme.text} fontSize={theme.headingSize} fontWeight={700}>
                            {selectedAccount.accountAlias}
                        </Text>

                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS}>
                            {BANKS.banks[selectedAccount.bankId]?.bankName}
                        </Text>

                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            •••• {selectedAccount.accountNo?.slice(-4)}
                        </Text>
                    </div>

                    <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                        <Flex align='center' marginBottom={theme.marginL}>
                            <FaChartLine color={theme.primary} style={{marginRight: theme.marginL}}/>

                            <Text color={theme.text} fontSize={theme.text} fontWeight={600}>
                                {DISPLAY.LABELS.INCOME_TRACKER}
                            </Text>
                        </Flex>

                        <Text color={theme.text} fontSize={theme.headingSize} fontWeight={700}>
                            {selectedTracker.name}
                        </Text>

                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS}>
                            {country.currency.symbol}{selectedTracker.amount}
                        </Text>

                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            {
                                new Date(selectedTracker.receivedDate)
                                    .toLocaleDateString(country.locale, {
                                        day:'numeric',
                                        month:'short',
                                        year:'numeric'
                                    })
                            }
                        </Text>
                    </div>
                </Grid>

                {
                    !hasExpenses &&
                    <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:theme.marginXL}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_EXPENSES_PRESENT}
                        </Text>
                    </div>
                }

                {
                    hasExpenses &&
                    <>
                        <Grid templateColumns={{base:'1fr 1fr', lg:'repeat(4, 1fr)'}} gap={theme.marginL} marginTop={theme.marginL}>
                            <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {DISPLAY.TEXT.TOTAL_UTILIZED}
                                </Text>

                                <Text color={theme.text} fontSize='28px' fontWeight={700} marginTop={theme.marginS}>
                                    {country.currency.symbol}{analytics.totalExpenses}
                                </Text>
                            </div>

                            <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {DISPLAY.TEXT.REMAINING_BALANCE}
                                </Text>

                                <Text color={theme.text} fontSize='28px' fontWeight={700} marginTop={theme.marginS}>
                                    {country.currency.symbol}{analytics.remainingBalance}
                                </Text>
                            </div>

                            <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {DISPLAY.TEXT.SAVINGS_RATE}
                                </Text>

                                <Text color={theme.text} fontSize='28px' fontWeight={700} marginTop={theme.marginS}>
                                    {analytics.savingsRate}%
                                </Text>
                            </div>

                            <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {DISPLAY.TEXT.TOTAL_TRANSACTIONS}
                                </Text>

                                <Text color={theme.text} fontSize='28px' fontWeight={700} marginTop={theme.marginS}>
                                    {expenses.length}
                                </Text>
                            </div>
                        </Grid>

                        <Grid templateColumns={{base:'1fr', xl:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                            <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                                <Flex align='center' marginBottom={theme.marginL}>
                                    <FaChartPie color={theme.primary} style={{marginRight: theme.marginL}}/>

                                    <Text color={theme.text} fontSize={theme.text} fontWeight={600}>
                                        {DISPLAY.TEXT.CATEGORY_BREAKDOWN}
                                    </Text>
                                </Flex>

                                <div style={{display:'flex', flexDirection:'column', gap:theme.marginL}}>
                                    {
                                        analytics.sortedCategories.map(category =>{
                                            const Icon = CATEGORY_ICONS[category.icon];

                                            return (
                                                <Flex key={category.name} align='center' justify='space-between'>
                                                    <Flex align='center'>
                                                        <Icon color={theme.primary} size='18px' style={{marginRight: theme.marginL}}/>

                                                        <div>
                                                            <Text color={theme.text} fontSize={theme.textSize}>
                                                                {category.name}
                                                            </Text>

                                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                                                {category.count} transactions
                                                            </Text>
                                                        </div>
                                                    </Flex>

                                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                                                        {country.currency.symbol}{category.total}
                                                    </Text>
                                                </Flex>
                                            );
                                        })
                                    }
                                </div>
                            </div>

                            {
                                hasBudgetData &&
                                <div style={{backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 3)`, padding:theme.paddingXL}}>
                                    <Flex align='center' marginBottom={theme.marginL}>
                                        <MdOutlineInsights color={theme.primary} style={{marginRight: theme.marginL}}/>

                                        <Text color={theme.text} fontSize={theme.text} fontWeight={600}>
                                            {DISPLAY.TEXT.BUDGET_DISCIPLINE}
                                        </Text>
                                    </Flex>

                                    <div style={{display:'flex', flexDirection:'column', gap:theme.marginL}}>
                                        {
                                            analytics.budgetAnalysis.map(category =>{
                                                const Icon = CATEGORY_ICONS[category.icon];

                                                return (
                                                    <div key={category.name}>
                                                        <Flex align='center' justify='space-between' marginBottom={theme.marginS}>
                                                            <Flex align='center'>
                                                                <Icon color={theme.primary} size='18px' style={{marginRight: theme.marginL}}/>

                                                                <Text color={theme.text} fontSize={theme.textSize}>
                                                                    {category.name}
                                                                </Text>
                                                            </Flex>

                                                            <Text color={category.exceeded ? theme.danger : theme.textSecondary} fontSize={theme.smallTextSize}>
                                                                {country.currency.symbol}{category.spent} / {country.currency.symbol}{category.limit}
                                                            </Text>
                                                        </Flex>

                                                        <Progress value={category.percentage} borderRadius={theme.radius}/>
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            }
                        </Grid>

                        <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                            <ActionButton icon={<MdDownload/>} name={DISPLAY.BUTTONS.DOWNLOAD_REPORT} onClick={onDownloadReport} actionType='primary' />
                            <ActionButton icon={<MdDownload/>} name={DISPLAY.BUTTONS.DOWNLOAD_STATEMENT} onClick={onDownloadStatement}/>
                        </Grid>
                    </>
                }

                <div style={{height:'120px'}}></div>
            </div>
        </div>
        </div>
    );
}
