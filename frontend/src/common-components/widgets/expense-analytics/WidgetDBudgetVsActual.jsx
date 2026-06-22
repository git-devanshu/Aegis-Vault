import React, { useMemo } from "react";
import { Box, Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../../themes/theme';
import BANKS from '../../../assets/banks.json';
import { CATEGORY_ICONS } from '../../../assets/categoryIcons';
import useLanguage from "../../../hooks/useLanguage";
import { getCssVariable } from "../../../utility/helpers";
import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

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
                backgroundColor: getCssVariable('--success'),
                borderRadius: 4
            },
            {
                data: budgetAnalytics.map(item => item.actual),
                backgroundColor: getCssVariable('--error'),
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
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.BUDGET_VS_ACTUAL}
                </Text>
                <InfoTooltip label={<>
                    {DISPLAY.TOOLTIPS.BUDGET_VS_ACTUAL_INFO}
                    <Flex align='center' gap={theme.paddingL}>
                        <Flex align='center' gap={theme.paddingS}>
                            <Box width='12px' height='12px' borderRadius='3px' bgColor={theme.success}/>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                {DISPLAY.TEXT.BUDGET}
                            </Text>
                        </Flex>
                        <Flex align='center' gap={theme.paddingS}>
                            <Box width='12px' height='12px' borderRadius='3px' bgColor={theme.error}/>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                {DISPLAY.TEXT.ACTUAL}
                            </Text>
                        </Flex>
                    </Flex>
                </>}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Flex marginTop={theme.marginL} overflowX='scroll' width='100%'>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width:`${chartWidth}px`}}>
                    <div style={{width:`${chartWidth}px`}}>
                        <Chart type='bar' data={chartData} options={chartOptions} />
                    </div>
                    <Flex width='100%' justifyContent='space-around' marginTop={theme.marginL}>
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
