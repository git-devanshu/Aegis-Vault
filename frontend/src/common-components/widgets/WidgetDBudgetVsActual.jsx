import React, { useMemo } from "react";
import { Box, Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import useLanguage from "../../hooks/useLanguage";
import { getCssVariable } from "../../utility/helpers";


export default function WidgetDBudgetVsActual({categoryData, analytics}) {
    const {DISPLAY} = useLanguage();

    const categoryMap = useMemo(
        ()=> new Map(
            categoryData.map(category => [
                category.categoryIndex,
                category
            ])
        ),
        [categoryData]
    );

    const getCategoryIcon = (category) =>{
        return CATEGORY_ICONS[category.icon];
    }

    const budgetAnalytics = analytics.budgetAnalytics;


    const chartData = {
        labels: budgetAnalytics.map(item => item.categoryName),
        datasets: [
            {
                data: budgetAnalytics.map(item => item.budget),
                backgroundColor: getCssVariable('--primary'),
                borderRadius: 4
            },
            {
                data: budgetAnalytics.map(item => item.actual),
                backgroundColor: getCssVariable('--accent'),
                borderRadius: 4
            }
        ]
    };

    const chartOptions = {
        indexAxis: 'x',
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false, drawBorder: false }
            },
            y: {
                display: false,
                grid: { display: false, drawBorder: false }
            }
        }
    };

    const chartWidth = Math.max(budgetAnalytics.length * 35, 200);

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='100%'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.BUDGET_VS_ACTUAL}
            </Text>

            <Flex marginTop={theme.marginL}>
                <div style={{overflowX: 'auto', width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                    <div style={{width: `${chartWidth}px`}}>
                        <Chart type='bar' data={chartData} options={chartOptions} />
                    </div>
                    <Flex width={`${chartWidth}px`} justifyContent='space-around' marginTop={theme.marginL}>
                        {
                            budgetAnalytics.map(item =>{
                                const categoryObj = categoryMap.get(item.categoryIndex);
                                const Icon = getCategoryIcon(categoryObj);
                                return (
                                    <Icon key={item.categoryIndex} color={theme.textSecondary} size='16px'/>
                                );
                            })
                        }
                    </Flex>
                </div>
            </Flex>
        </Box>
    );
}
