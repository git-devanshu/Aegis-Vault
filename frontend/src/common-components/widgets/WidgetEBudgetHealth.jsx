import React, { useMemo } from "react";
import { Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';

export default function WidgetEBudgetHealth({expenseData, selectedTracker}) {

    const analytics = useMemo(()=>{
        let healthy = 0;
        let warning = 0;
        let exceeded = 0;

        const spendMap = new Map();

        expenseData.forEach(expense =>{
            spendMap.set(
                expense.categoryIndex,
                (spendMap.get(expense.categoryIndex) || 0) + expense.amount
            );
        });

        (selectedTracker?.limitsData || []).forEach(limit =>{
            const spent = spendMap.get(limit.categoryIndex) || 0;

            const usage = limit.limit
                ? (spent / limit.limit) * 100
                : 0;

            if(usage < 70){
                healthy++;
            }
            else if(usage <= 100){
                warning++;
            }
            else{
                exceeded++;
            }
        });

        return {
            healthy,
            warning,
            exceeded
        };
    }, [expenseData, selectedTracker]);

    const chartData = {
        labels: ['Healthy', 'Warning', 'Exceeded'],
        datasets: [
            {
                data: [
                    analytics.healthy,
                    analytics.warning,
                    analytics.exceeded
                ]
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: theme.text
                }
            }
        }
    };

    const totalBudgetCategories =
        analytics.healthy +
        analytics.warning +
        analytics.exceeded;

    return (
        <div>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginBottom={theme.marginL}>
                Budget Health
            </Text>

            <Flex direction='column' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding={theme.paddingL}>
                <Chart type='doughnut' data={chartData} options={chartOptions} />

                <Text color={theme.textSecondary} textAlign='center' marginTop={theme.marginL}>
                    {totalBudgetCategories} Budget Categories Tracked
                </Text>
            </Flex>
        </div>
    );
}