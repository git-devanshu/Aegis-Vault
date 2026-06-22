import React, { useMemo } from "react";
import { Flex, Text, Box, Spacer, Badge, Divider } from '@chakra-ui/react';
import { theme } from '../../../themes/theme';
import useLanguage from "../../../hooks/useLanguage";
import BANKS from '../../../assets/banks.json';
import ActionButton from "../../form/ActionButton";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

export default function WidgetCTopExpenses({country, onBack, setSelectedTab, analytics}) {
    const {DISPLAY} = useLanguage();

    const showAllExpenses = async() =>{
        onBack();
        setSelectedTab(1);
    }

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='fit-content'>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.TOP_EXPENSES}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.TOP_EXPENSES_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

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
