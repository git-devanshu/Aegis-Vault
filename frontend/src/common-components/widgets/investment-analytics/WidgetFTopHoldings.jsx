import React from "react";
import { Text, Box, Flex, Grid, Spacer } from '@chakra-ui/react';
import { theme } from '../../../themes/theme';
import BANKS from '../../../assets/banks.json';
import useLanguage from "../../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

export default function WidgetFTopHoldings({country, analytics}) {
    const {DISPLAY} = useLanguage();

    const MetricCard = ({title, primaryValue, secondaryValue, footer}) =>(
        <Flex direction='column' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                {title}
            </Text>
            <Text color={theme.text} fontSize={theme.textSize} fontWeight={500} marginTop={theme.marginS}>
                {primaryValue}
            </Text>

            <Spacer/>
    
            <Text color={theme.primary} fontSize={theme.headingSize} fontWeight={500} marginTop={theme.spacing}>
                {secondaryValue}
            </Text>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS}>
                {footer}
            </Text>
        </Flex>
    );

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.TOP_HOLDINGS}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.TOP_HOLDINGS_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Grid templateColumns={'1fr 1fr'} gap={theme.marginL}>
                <MetricCard
                    title={DISPLAY.TEXT.TOP_GOLD_HOLDING}
                    primaryValue={analytics.topGoldHolding?.assetName ?? '-'}
                    secondaryValue={`${country.currency.symbol} ${(analytics.topGoldHolding?.totalPrice || 0).toLocaleString(country.locale)}`}
                    footer={`${analytics.topGoldHolding?.weight || 0} g`}
                />

                <MetricCard
                    title={DISPLAY.TEXT.TOP_STOCK_HOLDING}
                    primaryValue={analytics.topStockHolding?.symbol || '-'}
                    secondaryValue={`${country.currency.symbol} ${(analytics.topStockHolding?.totalPrice || 0).toLocaleString(country.locale)}`}
                    footer={`${analytics.topStockHolding?.units || 0} ${DISPLAY.LABELS.UNITS}`}
                />
            </Grid>
        </Box>
    );
}
