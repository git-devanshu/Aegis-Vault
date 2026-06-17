import React, { useMemo } from "react";
import { Box, Flex, Text } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';
import { getCssVariable } from "../../utility/helpers";
import useLanguage from "../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../popup/InfoTooltip";

export default function WidgetIWeekendVsWeekday({country, analytics}) {
    const {DISPLAY} = useLanguage();

    const chartData = {
        labels: [DISPLAY.TEXT.WEEKDAY, DISPLAY.TEXT.WEEKEND],
        datasets: [
            {
                data: [
                    analytics.weekdaySpend,
                    analytics.weekendSpend
                ],
                backgroundColor: [
                    getCssVariable('--primary'),
                    getCssVariable('--accent')
                ],
                borderWidth: 0
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            r: {
                ticks: {
                    display: false
                },
                grid: {
                    color: `${getCssVariable('--border')}40`
                },
                angleLines: {
                    color: `${getCssVariable('--border')}40`
                },
                pointLabels: {
                    display: false
                }
            }
        }
    };

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='100%'>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.WEEKDAY_VS_WEEKEND}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.WEEKEND_VS_WEEKDAY_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Flex padding={theme.paddingL} gap={theme.paddingL} alignItems='center' justifyContent='center'>
                <Chart type='polarArea' data={chartData} options={chartOptions} style={{maxHeight: '140px', maxWidth: '140px'}} />

                <Flex direction='column' gap={theme.paddingL} alignItems='center' justifyContent='center'>
                    <Box padding={`${theme.paddingS} ${theme.paddingL}`} bgColor={theme.cardBg} borderRadius={theme.radius} border={`2px solid ${theme.primary}`}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.WEEKDAY}</Text>
                        <Text color={theme.text} fontSize={theme.smallTextSize} textAlign='center'>
                            {country.currency.symbol} {analytics.weekdaySpend.toLocaleString(country.locale)}
                        </Text>
                    </Box>

                    <Box padding={`${theme.paddingS} ${theme.paddingL}`} bgColor={theme.cardBg} borderRadius={theme.radius} border={`2px solid ${theme.accent}`}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>{DISPLAY.TEXT.WEEKEND}</Text>
                        <Text color={theme.text} fontSize={theme.smallTextSize} textAlign='center'>
                            {country.currency.symbol} {analytics.weekendSpend.toLocaleString(country.locale)}
                        </Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
}
