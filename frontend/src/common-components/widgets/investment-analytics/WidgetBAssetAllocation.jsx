import React from "react";
import { Flex, Text, Box, Grid } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../../themes/theme';
import useLanguage from "../../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";


export default function WidgetBAssetAllocation({analytics}) {
    const {DISPLAY} = useLanguage();

    const chartData = {
        labels: analytics.allocationData.map(item =>
            item.label
        ),
        datasets: [
            {
                data: analytics.allocationData.map(item =>
                    item.amount
                ),
                backgroundColor: analytics.allocationData.map(item =>
                    item.color
                ),
                borderWidth: 0,
                spacing: 4,
                borderRadius: 4
            }
        ]
    };

    const chartOptions = {
        cutout: '76%',
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.ASSET_ALLOCATION}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.ASSET_ALLOCATION_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.spacing}>
                <Flex justify='center' align='center' style={{position:'relative'}}>
                    <Chart
                        type='doughnut'
                        data={chartData}
                        options={chartOptions}
                        style={{
                            maxHeight:'170px',
                            maxWidth:'170px'
                        }}
                    />

                    <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center', pointerEvents:'none'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600}>
                            {analytics.allocationData.filter(item => item.amount > 0).length}
                        </Text>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            {DISPLAY.TEXT.ASSETS}
                        </Text>
                    </div>
                </Flex>

                <Flex direction='column' justify='center' gap={theme.paddingL} padding={theme.paddingL}>
                    {
                        analytics.allocationData.map(item =>
                            <Flex key={item.label} align='center' gap={theme.marginL}>
                                <Box width='12px' height='12px' borderRadius='50%' bgColor={item.color} />
                                <Text color={theme.text} fontSize={theme.smallTextSize}>
                                    {item.label}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    ({item.percentage.toFixed(1)}%)
                                </Text>
                            </Flex>
                        )
                    }
                </Flex>
            </Grid>
        </Box>
    );
}