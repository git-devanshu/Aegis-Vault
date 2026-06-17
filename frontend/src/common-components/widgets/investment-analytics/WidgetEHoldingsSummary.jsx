import React from "react";
import { Text, Box, Flex, Grid } from '@chakra-ui/react';
import { theme } from '../../../themes/theme';
import BANKS from '../../../assets/banks.json';
import useLanguage from "../../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

export default function WidgetEHoldingsSummary({analytics}){
    const {DISPLAY} = useLanguage();

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.HOLDINGS_SUMMARY}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.HOLDINGS_SUMMARY_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Flex direction='column' gap={theme.paddingL}>
                <Grid templateColumns='1fr 1fr' padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                    <Grid borderRight={`1px solid ${theme.border}`} placeItems='center'>
                        <Text color={theme.primary} fontSize={theme.textSize} fontWeight={500} textAlign='center'>
                            {analytics.goldAssetCount}
                        </Text>

                        <Text color={theme.primary} fontSize={theme.smallTextSize} textAlign='center'>
                            {DISPLAY.TEXT.GOLD_ASSETS}
                        </Text>
                    </Grid>

                    <Grid placeItems='center'>
                        <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                            {analytics.goldWeight.toFixed(2)} g
                        </Text>

                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>
                            {DISPLAY.TEXT.GOLD_WEIGHT}
                        </Text>
                    </Grid>
                </Grid>

                <Grid templateColumns='1fr 1fr' padding={theme.paddingL} bgColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                    <Grid borderRight={`1px solid ${theme.border}`} placeItems='center'>
                        <Text color={theme.primary} fontSize={theme.textSize} fontWeight={500} textAlign='center'>
                            {analytics.stockHoldingCount}
                        </Text>

                        <Text color={theme.primary} fontSize={theme.smallTextSize} textAlign='center'>
                            {DISPLAY.TEXT.STOCKS_HELD}
                        </Text>
                    </Grid>

                    <Grid placeItems='center'>
                        <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                            {analytics.stockUnits.toLocaleString()}
                        </Text>

                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='center'>
                            {DISPLAY.TEXT.UNITS_OWNED}
                        </Text>
                    </Grid>
                </Grid>
            </Flex>
        </Box>
    );
}