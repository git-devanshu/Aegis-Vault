import React, { useMemo } from "react";
import { Flex, Text, Box, Spacer, Badge, Divider } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import BANKS from '../../assets/banks.json';
import ActionButton from "../form/ActionButton";
import { ExternalLinkIcon } from "@chakra-ui/icons";


export default function WidgetCTopExpenses({expenseData, selectedTracker, selectedAccount, onBack, setSelectedTab}) {
    const {DISPLAY} = useLanguage();

    const country = BANKS.country[selectedAccount.countryCode];

    const analytics = useMemo(()=>{
        const sortedExpenses = [...expenseData].sort((a, b)=> b.amount - a.amount);
        const topExpenses = sortedExpenses.slice(0, 3);
        const largestExpense = sortedExpenses[0];
        const percentageConsumed = largestExpense ? (largestExpense.amount / selectedTracker.amount) * 100 : 0;
        return {
            largestExpense,
            topExpenses,
            percentageConsumed
        };
    }, [expenseData, selectedTracker]);

    const showAllExpenses = async() =>{
        onBack();
        setSelectedTab(1);
    }

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='fit-content'>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.TOP_EXPENSES}
            </Text>

            {analytics.topExpenses[0] &&
                <Flex direction='column' border={`1px solid ${theme.border}`} bgColor={theme.hoverBg} borderRadius={theme.radius} padding={theme.paddingL}>
                    <Text fontSize={theme.smallTextSize} color={theme.textSecondary}>
                        {DISPLAY.TEXT.LARGEST_EXPENSE} ({analytics.percentageConsumed.toFixed(1)}%)
                    </Text>
                    <Flex alignItems='center' marginTop={theme.marginL} gap={theme.paddingL}>
                        <Badge color='#0F172A' bgColor={theme.primary} paddingX='8px'>
                            1
                        </Badge>
                        <Text fontSize={theme.textSize} color={theme.text}>
                            {analytics.topExpenses[0].spentAt.substring(0, 25)}
                        </Text>
                        <Spacer/>
                        <Text fontSize={theme.textSize} color={theme.text}>
                            {country.currency.symbol} {analytics.topExpenses[0].amount.toLocaleString(country.locale)}
                        </Text>
                    </Flex>
                </Flex>
            }

            {analytics.topExpenses[1] &&
                <Flex alignItems='center' marginTop={theme.marginL} gap={theme.paddingL} paddingX={theme.paddingL}>
                    <Badge color='#0F172A' bgColor={theme.primary} paddingX='8px'>
                        2
                    </Badge>
                    <Text fontSize={theme.textSize} color={theme.text}>
                        {analytics.topExpenses[1].spentAt.substring(0, 25)}
                    </Text>
                    <Spacer/>
                    <Text fontSize={theme.textSize} color={theme.text}>
                        {country.currency.symbol} {analytics.topExpenses[1].amount.toLocaleString(country.locale)}
                    </Text>
                </Flex>
            }

            {analytics.topExpenses[2] &&
                <>
                    <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL}/>
                    <Flex alignItems='center' marginTop={theme.marginL} gap={theme.paddingL} paddingX={theme.paddingL}>
                        <Badge color='#0F172A' bgColor={theme.primary} paddingX='8px'>
                            3
                        </Badge>
                        <Text fontSize={theme.textSize} color={theme.text}>
                            {analytics.topExpenses[2].spentAt.substring(0, 25)}
                        </Text>
                        <Spacer/>
                        <Text fontSize={theme.textSize} color={theme.text}>
                            {country.currency.symbol} {analytics.topExpenses[2].amount.toLocaleString(country.locale)}
                        </Text>
                    </Flex>
                </>
            }

            <ActionButton name={DISPLAY.BUTTONS.SHOW_ALL_EXPENSES} actionType='primary' onClick={showAllExpenses} icon={<ExternalLinkIcon/>} customStyle={{marginTop: theme.marginL}}/>
        </Box>
    );
}
