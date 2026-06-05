import React, { useMemo } from "react";
import { Flex, Text, Stack, Box } from '@chakra-ui/react';
import { GoCheckCircle } from "react-icons/go";
import { PiWarning } from "react-icons/pi";
import { GrStatusInfo } from "react-icons/gr";
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import BANKS from '../../assets/banks.json';


const ALERT_TYPES = {
    BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
    BUDGET_UTILIZED: 'BUDGET_UTILIZED',
    HEALTHY_BUDGETS: 'HEALTHY_BUDGETS',
    LARGEST_EXPENSE: 'LARGEST_EXPENSE',
    TOP_SPENDING_DAY: 'TOP_SPENDING_DAY',
    TOP_CATEGORY_NO_BUDGET: 'TOP_CATEGORY_NO_BUDGET',
    SAVINGS_RATE: 'SAVINGS_RATE'
};


export default function WidgetJInsights({expenseData, selectedTracker, country, categoryData}) {
    const {DISPLAY} = useLanguage();

    const getAlertMessage = alert =>{
        switch(alert.alertType){
            case ALERT_TYPES.BUDGET_EXCEEDED:
                return DISPLAY.ALERTS.BUDGET_EXCEEDED
                    .replace('{category}', alert.categoryName)
                    .replace('{amount}', `${country.currency.symbol}${alert.amount.toLocaleString(country.locale)}`);

            case ALERT_TYPES.BUDGET_UTILIZED:
                return DISPLAY.ALERTS.BUDGET_UTILIZED
                    .replace('{category}', alert.categoryName)
                    .replace('{percentage}', alert.percentage.toFixed(0));

            case ALERT_TYPES.HEALTHY_BUDGETS:
                return DISPLAY.ALERTS.HEALTHY_BUDGETS
                    .replace('{healthy}', alert.healthyCount)
                    .replace('{total}', alert.totalCount);

            case ALERT_TYPES.LARGEST_EXPENSE:
                return DISPLAY.ALERTS.LARGEST_EXPENSE
                    .replace('{expense}', alert.expenseName)
                    .replace('{percentage}', alert.percentage.toFixed(1));

            case ALERT_TYPES.TOP_SPENDING_DAY:
                return DISPLAY.ALERTS.TOP_SPENDING_DAY
                    .replace('{date}', new Date(alert.date).toLocaleDateString(country.locale))
                    .replace('{percentage}', alert.percentage.toFixed(1));

            case ALERT_TYPES.TOP_CATEGORY_NO_BUDGET:
                return DISPLAY.ALERTS.TOP_CATEGORY_NO_BUDGET
                    .replace('{category}', alert.categoryName);

            case ALERT_TYPES.SAVINGS_RATE:
                return DISPLAY.ALERTS.SAVINGS_RATE
                    .replace('{percentage}', alert.percentage.toFixed(1));

            default:
                return '';
        }
    };

    const insights = useMemo(()=>{
        const generatedInsights = [];
        const incomeAmount = Number(selectedTracker?.amount || 0);
        const totalExpense = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);
        const remainingAmount = incomeAmount - totalExpense;
        const savingsRate = incomeAmount ? (remainingAmount / incomeAmount) * 100 : 0;

        const spendMap = new Map();
        expenseData.forEach(expense =>{
            spendMap.set(expense.categoryIndex, (spendMap.get(expense.categoryIndex) || 0) + expense.amount);
        });

        const limitsData = selectedTracker?.limitsData || [];
        let healthyCategories = 0;

        limitsData.forEach(limit =>{
            const spent = spendMap.get(limit.categoryIndex) || 0;
            const usagePercentage = limit.limit ? (spent / limit.limit) * 100 : 0;
            const category = categoryData.find(c => c.categoryIndex === limit.categoryIndex);

            if(usagePercentage > 100){
                generatedInsights.push({
                    type: 'warning',
                    alertType: ALERT_TYPES.BUDGET_EXCEEDED,
                    categoryName: category?.name,
                    amount: spent - limit.limit
                });
            }
            else{
                healthyCategories++;
            }

            if(usagePercentage >= 85 && usagePercentage <= 100){
                generatedInsights.push({
                    type: 'info',
                    alertType: ALERT_TYPES.BUDGET_UTILIZED,
                    categoryName: category?.name,
                    percentage: usagePercentage
                });
            }
        });

        if(limitsData.length){
            generatedInsights.push({
                type: 'success',
                alertType: ALERT_TYPES.HEALTHY_BUDGETS,
                healthyCount: healthyCategories,
                totalCount: limitsData.length
            });
        }

        const largestExpense = [...expenseData].sort((a, b)=> b.amount - a.amount)[0];

        if(largestExpense){
            generatedInsights.push({
                type: 'info',
                alertType: ALERT_TYPES.LARGEST_EXPENSE,
                expenseName: largestExpense.spentAt,
                percentage: incomeAmount ? (largestExpense.amount / incomeAmount) * 100 : 0
            });
        }

        const dailySpendMap = new Map();
        expenseData.forEach(expense =>{
            dailySpendMap.set(expense.spentDate, (dailySpendMap.get(expense.spentDate) || 0) + expense.amount);
        });

        const topDay = [...dailySpendMap.entries()]
            .map(([date, amount])=> ({date, amount}))
            .sort((a, b)=> b.amount - a.amount)[0];

        if(topDay && totalExpense){
            generatedInsights.push({
                type: 'info',
                alertType: ALERT_TYPES.TOP_SPENDING_DAY,
                date: topDay.date,
                percentage: (topDay.amount / totalExpense) * 100
            });
        }

        const categoryTotals = categoryData
            .map(category => ({
                category,
                amount: spendMap.get(category.categoryIndex) || 0
            }))
            .sort((a, b)=> b.amount - a.amount);

        const highestCategory = categoryTotals[0];
        if(highestCategory){
            const hasBudget = limitsData.some(limit => limit.categoryIndex === highestCategory.category.categoryIndex);
            if(!hasBudget && highestCategory.amount > 0){
                generatedInsights.push({
                    type: 'warning',
                    alertType: ALERT_TYPES.TOP_CATEGORY_NO_BUDGET,
                    categoryName: highestCategory.category.name
                });
            }
        }

        generatedInsights.push({
            type: savingsRate >= 25 ? 'success' : 'warning',
            alertType: ALERT_TYPES.SAVINGS_RATE,
            percentage: savingsRate
        });

        return generatedInsights;
    }, [expenseData, selectedTracker, categoryData]);

    const getAlertIcon = (type) =>{
        if(type === 'success') return GoCheckCircle;
        else if(type === 'warning') return PiWarning;
        else return GrStatusInfo;
    }

    const getAlertColor = (type) =>{
        if(type === 'success') return theme.success;
        else if(type === 'warning') return theme.warning;
        else return theme.info;
    }

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} overflowY='auto' height='486px'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.ALERTS.INSIGHTS_AND_ALERTS}
            </Text>

            <Stack spacing={theme.marginL}>
                {
                    insights.map((insight, index)=>{
                        const Icon = getAlertIcon(insight.type);
                        return(
                            <Flex key={index} backgroundColor={theme.cardBg} border={`1px solid ${getAlertColor(insight.type)}`} borderRadius={theme.radius} padding={theme.paddingL} alignItems='center'>
                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: theme.marginL}}>
                                    <Icon size='22px' color={getAlertColor(insight.type)} />
                                </div>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {getAlertMessage(insight)}
                                </Text>
                            </Flex>
                            )
                    })
                }
            </Stack>
        </Box>
    );
}