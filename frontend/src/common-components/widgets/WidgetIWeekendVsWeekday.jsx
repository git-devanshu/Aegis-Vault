import React, { useMemo } from "react";
import { Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';

export default function WidgetIWeekendVsWeekday({expenseData, country}) {

    const analytics = useMemo(()=>{
        let weekdaySpend = 0;
        let weekendSpend = 0;

        expenseData.forEach(expense =>{
            const day = new Date(expense.spentDate).getDay();

            if(day === 0 || day === 6){
                weekendSpend += expense.amount;
            }
            else{
                weekdaySpend += expense.amount;
            }
        });

        return {
            weekdaySpend,
            weekendSpend
        };
    }, [expenseData]);

    const chartData = {
        labels: ['Weekday', 'Weekend'],
        datasets: [
            {
                data: [
                    analytics.weekdaySpend,
                    analytics.weekendSpend
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

    return (
        <div>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginBottom={theme.marginL}>
                Weekend vs Weekday
            </Text>

            <Flex direction='column' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding={theme.paddingL}>
                <Chart type='doughnut' data={chartData} options={chartOptions} />

                <Text color={theme.textSecondary} textAlign='center' marginTop={theme.marginL}>
                    Weekend: {country.currency.symbol}{analytics.weekendSpend.toLocaleString()}
                </Text>

                <Text color={theme.textSecondary} textAlign='center'>
                    Weekday: {country.currency.symbol}{analytics.weekdaySpend.toLocaleString()}
                </Text>
            </Flex>
        </div>
    );
}