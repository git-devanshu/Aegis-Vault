import React, { useMemo } from "react";
import { Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';

export default function WidgetFSpendingTimeline({expenseData}) {

    const timelineData = useMemo(()=>{
        const dailySpendMap = new Map();

        expenseData.forEach(expense =>{
            dailySpendMap.set(
                expense.spentDate,
                (dailySpendMap.get(expense.spentDate) || 0) + expense.amount
            );
        });

        const sortedEntries = [...dailySpendMap.entries()]
            .sort((a, b)=> new Date(a[0]) - new Date(b[0]));

        return {
            labels: sortedEntries.map(entry => entry[0]),
            values: sortedEntries.map(entry => entry[1])
        };
    }, [expenseData]);

    const chartData = {
        labels: timelineData.labels,
        datasets: [
            {
                label: 'Daily Spend',
                data: timelineData.values,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: theme.text
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: theme.text
                }
            },
            y: {
                ticks: {
                    color: theme.text
                }
            }
        }
    };

    return (
        <div>
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginBottom={theme.marginL}>
                Spending Timeline
            </Text>

            <Flex backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding={theme.paddingL}>
                <div style={{width:'100%', height:'350px'}}>
                    <Chart type='line' data={chartData} options={chartOptions} />
                </div>
            </Flex>
        </div>
    );
}