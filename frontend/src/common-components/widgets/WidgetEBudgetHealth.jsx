import React, { useMemo } from "react";
import { Flex, Text, Box } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';
import { getCssVariable } from '../../utility/helpers';
import useLanguage from "../../hooks/useLanguage";

export default function WidgetEBudgetHealth({analytics}) {
    const {DISPLAY} = useLanguage();
    

    const chartData = {
        datasets: [
            {
                data: [
                    analytics.exceeded,
                    analytics.warning,
                    analytics.healthy
                ],
                backgroundColor: [
                    getCssVariable('--error'),
                    getCssVariable('--warning'),
                    getCssVariable('--primary')
                ],
                borderWidth: 0,
                spacing: 3,
                borderRadius: 4,
                cutout: '72%'
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='100%' minWidth='300px'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.BUDGET_HEALTH}
            </Text>

            <Flex align='center' justify='center' gap={theme.paddingL} marginTop={theme.spacing}>
                <Chart type='doughnut' data={chartData} options={chartOptions} style={{maxHeight: '120px', maxWidth: '120px'}}/>

                <Flex direction='column' gap={theme.paddingL}>
                    <Flex align='center' gap={theme.marginL}>
                        <Box width='12px' height='12px' borderRadius='50%' bgColor={theme.error}/>
                        <Text color={theme.text} fontSize={theme.smallTextSize}>
                            {analytics.exceeded} {DISPLAY.TEXT.OVER_BUDGET}
                        </Text>
                    </Flex>

                    <Flex align='center' gap={theme.marginL}>
                        <Box width='12px' height='12px' borderRadius='50%' bgColor={theme.warning}/>
                        <Text color={theme.text} fontSize={theme.smallTextSize}>
                            {analytics.warning} {DISPLAY.TEXT.NEAR_LIMIT}
                        </Text>
                    </Flex>

                    <Flex align='center' gap={theme.marginL}>
                        <Box width='12px' height='12px' borderRadius='50%' bgColor={theme.primary}/>
                        <Text color={theme.text} fontSize={theme.smallTextSize}>
                            {analytics.healthy} {DISPLAY.TEXT.ON_TRACK}
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
}
