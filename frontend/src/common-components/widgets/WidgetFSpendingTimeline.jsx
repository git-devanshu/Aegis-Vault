import React, { useMemo } from "react";
import { Box, Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';
import { getCssVariable } from "../../utility/helpers";
import useLanguage from "../../hooks/useLanguage";


export default function WidgetFSpendingTimeline({analytics}) {
    const {DISPLAY} = useLanguage();

    const timelineData = analytics.timelineData;

    const chartData = {
        labels: timelineData.labels,
        datasets: [
            {
                data: timelineData.values,
                tension: 0,
                borderColor: getCssVariable('--primary'),
                backgroundColor: 'transparent',
                pointBackgroundColor: getCssVariable('--primary'),
                pointBorderColor: getCssVariable('--primary'),
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                display: false,
                grid: { display: false, drawBorder: false }
            },
            y: {
                ticks: {
                    color: getCssVariable('--text')
                },
                grid: { 
                    color: `${getCssVariable('--border')}40`,
                    drawBorder: false
                }
            }
        }
    };

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='100%'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.SPENDING_TIMELINE}
            </Text>

            <Flex padding={theme.paddingL}>
                <div style={{width:'100%'}}>
                    <Chart type='line' data={chartData} options={chartOptions} />
                </div>
            </Flex>
        </Box>
    );
}
