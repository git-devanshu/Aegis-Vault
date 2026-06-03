import React, { useMemo } from "react";
import { Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';

export default function WidgetDBudgetVsActual({categoryData, expenseData, selectedTracker, country}) {

    const budgetAnalytics = useMemo(()=>{
        const spendMap = new Map();

        expenseData.forEach(expense =>{
            spendMap.set(
                expense.categoryIndex,
                (spendMap.get(expense.categoryIndex) || 0) + expense.amount
            );
        });

        return (selectedTracker?.limitsData || [])
            .map(limit =>{
                const category = categoryData.find(
                    c => c.categoryIndex === limit.categoryIndex
                );

                return {
                    categoryName: category?.name || 'Unknown',
                    budget: limit.limit,
                    actual: spendMap.get(limit.categoryIndex) || 0
                };
            })
            .sort((a, b)=> b.actual - a.actual);

    }, [expenseData, categoryData, selectedTracker]);

    const chartData = {
        labels: budgetAnalytics.map(item => item.categoryName),
        datasets: [
            {
                label: 'Budget',
                data: budgetAnalytics.map(item => item.budget)
            },
            {
                label: 'Actual',
                data: budgetAnalytics.map(item => item.actual)
            }
        ]
    };

    const chartOptions = {
        indexAxis: 'y',
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
                Budget vs Actual
            </Text>

            <Flex backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} padding={theme.paddingL}>
                <div style={{width:'100%', height:'350px'}}>
                    <Chart type='bar' data={chartData} options={chartOptions} />
                </div>
            </Flex>
        </div>
    );
}