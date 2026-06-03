import React, { useMemo } from "react";
import { Flex, Text, Stack } from '@chakra-ui/react';
import { theme } from '../../themes/theme';

export default function WidgetHTopSpendingDays({expenseData, country}) {

    const analytics = useMemo(()=>{
        const dailySpendMap = new Map();

        expenseData.forEach(expense =>{
            dailySpendMap.set(
                expense.spentDate,
                (dailySpendMap.get(expense.spentDate) || 0) + expense.amount
            );
        });

        const totalExpense = expenseData.reduce(
            (sum, expense)=> sum + expense.amount,
            0
        );

        const topDays = [...dailySpendMap.entries()]
            .map(([date, amount])=>({
                date,
                amount,
                percentage: totalExpense
                    ? (amount / totalExpense) * 100
                    : 0
            }))
            .sort((a, b)=> b.amount - a.amount)
            .slice(0, 3);

        return topDays;
    }, [expenseData]);

    return (
        <div>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginBottom={theme.marginL}>
                Top Spending Days
            </Text>

            <Stack spacing={theme.marginL}>
                {
                    analytics.map((day, index)=>(
                        <Flex key={index} justify='space-between' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding={theme.paddingL}>
                            <div>
                                <Text color={theme.text}>
                                    {new Date(day.date).toLocaleDateString()}
                                </Text>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {day.percentage.toFixed(1)}% of spending
                                </Text>
                            </div>

                            <Text color={theme.primary} fontWeight={600}>
                                {country.currency.symbol}{day.amount.toLocaleString()}
                            </Text>
                        </Flex>
                    ))
                }
            </Stack>
        </div>
    );
}