import React from "react";
import { Flex, Text, Grid, Box, Spacer } from '@chakra-ui/react';
import { theme } from '../../../themes/theme';
import BANKS from '../../../assets/banks.json';
import useLanguage from "../../../hooks/useLanguage";
import useAppContext from "../../../hooks/useAppContext";

import { MdCreditCard, MdSsidChart } from "react-icons/md";
import { FaCoins } from "react-icons/fa";
import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

export default function WidgetCInterestEarned({country, analytics}) {
    const {DISPLAY} = useLanguage();
    const {hideClosedFD, hideClosedRD, hideSoldGoldAssets, hideSoldStocks} = useAppContext();

    const MetricCard = ({title, value, Icon, roi, roiColor, prefix=''}) =>(
        <Flex direction='column' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} height='170px'>
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:theme.bg, borderRadius:'50%', padding:'6px', width:'fit-content'}}>
                <Icon size='22px' color={theme.text} />
            </div>
    
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginS}>
                {title}
            </Text>
    
            <Spacer/>
    
            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginS}>
                {value}
            </Text>
    
            <Text color={roiColor} fontSize={theme.smallTextSize} marginTop={theme.marginS} fontWeight={500}>
                {prefix}{roi.toFixed(2)}% ROI
            </Text>
        </Flex>
    );

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.RETURNS_AND_ROI}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.RETURNS_AND_ROI_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Grid templateColumns={{base:'1fr 1fr', md:'1fr 1fr', lg: '1fr 1fr 1fr 1fr'}} gap={theme.marginL}>
                <MetricCard
                    title={DISPLAY.TEXT.FD_INTEREST}
                    value={hideClosedFD ? `${country.currency.symbol} 0` : `${country.currency.symbol} ${analytics.fdInterestEarned.toLocaleString(country.locale)}`}
                    roi={hideClosedFD ? 0 : analytics.fdROI}
                    roiColor={theme.primary}
                    Icon={MdCreditCard}
                />

                <MetricCard
                    title={DISPLAY.TEXT.RD_INTEREST}
                    value={hideClosedRD ? `${country.currency.symbol} 0` : `${country.currency.symbol} ${analytics.rdInterestEarned.toLocaleString(country.locale)}`}
                    roi={hideClosedRD ? 0 : analytics.rdROI}
                    roiColor={theme.primary}
                    Icon={MdCreditCard}
                />

                <MetricCard
                    title={DISPLAY.TEXT.GOLD_PROFIT_LOSS}
                    value={hideSoldGoldAssets ? `${country.currency.symbol} 0` : `${country.currency.symbol} ${Math.abs(analytics.goldProfitLoss).toLocaleString(country.locale)}`}
                    roi={hideSoldGoldAssets ? 0 : Math.abs(analytics.goldROI)}
                    roiColor={analytics.goldProfitLoss >= 0 ? theme.success : theme.error}
                    Icon={FaCoins}
                    prefix={analytics.goldProfitLoss >= 0 ? '+' : '-'}
                />

                <MetricCard
                    title={DISPLAY.TEXT.STOCK_PROFIT_LOSS}
                    value={hideSoldStocks ? `${country.currency.symbol} 0` : `${country.currency.symbol} ${Math.abs(analytics.stockProfitLoss).toLocaleString(country.locale)}`}
                    roi={hideSoldStocks ? 0 : Math.abs(analytics.stockROI)}
                    roiColor={analytics.stockProfitLoss >= 0 ? theme.success : theme.error}
                    Icon={MdSsidChart}
                    prefix={analytics.stockProfitLoss >= 0 ? '+' : '-'}
                />
            </Grid>
        </Box>
    );
}
