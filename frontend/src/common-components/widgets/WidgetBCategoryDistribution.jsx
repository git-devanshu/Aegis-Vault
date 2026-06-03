import React, { useMemo } from "react";
import { Flex, Text, Box, Grid, Spacer } from '@chakra-ui/react';
import { Chart } from 'primereact/chart';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import BANKS from '../../assets/banks.json';
import {getCategoryColor} from '../../assets/categoryIcons';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';


export default function WidgetBCategoryDistribution({categoryData, expenseData, selectedAccount}) {
    const {DISPLAY} = useLanguage();

    const country = BANKS.country[selectedAccount.countryCode];

    const categoryMap = useMemo(
        ()=> new Map(
            categoryData.map(category => [
                category.categoryIndex,
                category
            ])
        ),
        [categoryData]
    );

    const analytics = useMemo(()=>{
        const categorySpendMap = new Map();
        expenseData.forEach(expense =>{
            categorySpendMap.set(
                expense.categoryIndex, 
                (categorySpendMap.get(expense.categoryIndex) || 0) + expense.amount
            );
        });

        const totalExpense = expenseData.reduce((sum, expense)=> sum + expense.amount, 0);

        const categoryDistribution = categoryData
            .map(category =>({
                categoryName: category.name,
                amount: categorySpendMap.get(category.categoryIndex) || 0,
                categoryIndex: category.categoryIndex
            }))
            .filter(category => category.amount > 0)
            .sort((a, b)=> b.amount - a.amount)
            .map(category =>({
                ...category,
                percentage: totalExpense ? (category.amount / totalExpense) * 100 : 0
            }));

        return {
            totalExpense,
            categoryDistribution
        };
    }, [expenseData, categoryData]);

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
        <Flex direction='column' padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.CATEGORYWISE_DISTRIBUTION}
            </Text>

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.paddingL}>
                <Flex justify='center' padding={theme.paddingL} style={{position:'relative'}}>
                    <Chart type='doughnut' data={chartData} options={chartOptions} style={{width:'60%', maxWidth: '190px'}} />
                    <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center', pointerEvents:'none'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600}>
                            {analytics.categoryDistribution.length}
                        </Text>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                            {DISPLAY.LABELS.CATEGORIES}
                        </Text>
                    </div>
                </Flex>

                <Box paddingTop={theme.paddingL} overflowY='auto' maxHeight='190px'>
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
            </Grid>
        </Flex>
    );
}
