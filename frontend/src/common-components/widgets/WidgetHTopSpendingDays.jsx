import React, { useMemo } from "react";
import { Flex, Text, Box, Divider } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../popup/InfoTooltip";

export default function WidgetHTopSpendingDays({country, analytics}) {
    const {DISPLAY} = useLanguage();

    return (
        <Box bgColor={theme.cardBg} padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} height='100%'>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.TOP_SPENDING_DAYS}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.TOP_SPENDING_DAYS_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Flex gap={theme.marginL} direction='column'>
                {
                    analytics.topDays.map((day, index)=>(<>
                        <Divider borderColor={theme.border} borderWidth='1px' />
                        <Flex key={index} justify='space-between'>
                            <div>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {new Date(day.date).toLocaleDateString(country.locale)}
                                </Text>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {day.percentage.toFixed(2)}% ({DISPLAY.TEXT.INCOME_AMOUNT})
                                </Text>
                            </div>

                            <Text color={theme.primary} fontSize={theme.textSize} fontWeight={500}>
                                {country.currency.symbol} {day.amount.toLocaleString(country.locale)}
                            </Text>
                        </Flex>
                    </>))
                }
            </Flex>
        </Box>
    );
}