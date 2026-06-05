import React, { useMemo } from "react";
import { Flex, Text, Box, Grid, Spacer } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import {getCategoryColor} from '../../assets/categoryIcons';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';


export default function WidgetBCategoryDistribution({categoryData, country, analytics}) {
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


    const chartData = {
        labels: analytics.categoryDistribution.map(item => item.categoryName),
        datasets: [
            {
                data: analytics.categoryDistribution.map(item => item.amount),
                backgroundColor: analytics.categoryDistribution.map(item =>
                    getCategoryColor(item.categoryIndex)
                ),
                borderWidth: 0
            }
        ]
    };

    const chartOptions = {
        cutout: '72%',
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true
            }
        }
    };

    const getCategoryIcon = (category) =>{
        return CATEGORY_ICONS[category.icon];
    }

    return (
        <Flex direction='column' padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='486px'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.CATEGORYWISE_DISTRIBUTION}
            </Text>

            <Flex direction='column' gap={theme.paddingL} height='90%'>
                <Flex justify='center' padding={theme.paddingL} style={{position:'relative'}}>
                    <Chart type='doughnut' data={chartData} options={chartOptions} style={{maxHeight:'190px'}} />
                    <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center', pointerEvents:'none'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600}>
                            {analytics.categoryDistribution.length}
                        </Text>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            {DISPLAY.LABELS.CATEGORIES}
                        </Text>
                    </div>
                </Flex>

                <Box paddingTop={theme.paddingL} overflowY='scroll'>
                    <Flex wrap='wrap' gap={theme.marginL} padding={theme.paddingS} justifyContent='center' alignContent='flex-start'>
                        {
                            analytics.categoryDistribution.map(category =>{
                                const categoryObj = categoryMap.get(category.categoryIndex);
                                const Icon = getCategoryIcon(categoryObj);

                                return (
                                    <Flex key={category.categoryIndex} direction='column' align='center' justify='center' minWidth='100px' backgroundColor={theme.cardBg} border={`2px solid ${getCategoryColor(category.categoryIndex)}`} borderRadius={theme.radius} padding={theme.paddingS}>
                                        <Icon color={getCategoryColor(category.categoryIndex)} size='20px'/>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} noOfLines={1} maxWidth='80px' textAlign='center'>
                                            {category.categoryName}
                                        </Text>
                                        <Text color={theme.text} fontSize={theme.smallTextSize} textAlign='center'>
                                            {country.currency.symbol} {category.amount.toLocaleString(country.locale)}
                                        </Text>
                                    </Flex>
                                );
                            })
                        }
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
}
