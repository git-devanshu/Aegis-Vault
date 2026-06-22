import React, { useMemo } from "react";
import { Box, Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../../themes/theme';
import { getCssVariable } from "../../../utility/helpers";
import useLanguage from "../../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

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
                borderWidth: 2,
                pointBackgroundColor: getCssVariable('--primary'),
                pointBorderColor: getCssVariable('--primary'),
                pointRadius: 1,
                pointHoverRadius: 3,
                pointHitRadius: 10
            }
        ]
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        interaction: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                display: false,
                grid: { display: false, drawBorder: false }
            },
            y: {
                ticks: {
                    color: getCssVariable('--text-secondary'),
                    font: {
                        size: 10
                    },
                    padding: 8
                },
                grid: {
                    color: `${getCssVariable('--border')}40`,
                    drawBorder: false,
                    tickLength: 0
                },
                border: {
                    display: false
                }
            }
        },
        elements: {
            line: {
                tension: 0,
                borderJoinStyle: 'round'
            }
        }
    };

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='100%'>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.SPENDING_TIMELINE}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.SPENDING_TIMELINE_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Flex padding={theme.paddingL}>
                <div style={{width:'100%'}}>
                    <Chart type='line' data={chartData} options={chartOptions} />
                </div>
            </Flex>
        </Box>
    );
}
