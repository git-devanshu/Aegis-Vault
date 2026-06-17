import React from "react";
import { Flex, Text, Grid, Box } from '@chakra-ui/react';
import { theme } from '../../../themes/theme';
import BANKS from '../../../assets/banks.json';
import useLanguage from "../../../hooks/useLanguage";

import { MdCreditCard, MdSsidChart } from "react-icons/md";
import { FaCoins } from "react-icons/fa";
import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";


export default function WidgetAInvestmentSnapshot({country, analytics}) {
    const {DISPLAY} = useLanguage();

    const MetricCard = ({title, value, Icon}) =>(
        <Flex direction='column' justify='space-between' style={{ backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius: theme.radius, padding:theme.paddingL }}>
            <Flex align='center'>
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:theme.bg, borderRadius:'50%', padding:'6px'}}>
                    <Icon size='22px' color={theme.text} />
                </div>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginL}>
                    {title}
                </Text>
            </Flex>

            <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL} marginLeft={theme.marginS}>
                {country.currency.symbol} {value.toLocaleString(country.locale)}
            </Text>
        </Flex>
    );

    return (
        <Box padding={theme.paddingL} marginTop={theme.marginL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.INVESTMENT_SNAPSHOT}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.ACTIVE_INVESTMENTS_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg:'1fr 1fr 1fr 1fr'}} gap={theme.marginL}>
                <MetricCard
                    title={DISPLAY.TEXT.FD_VALUE}
                    value={analytics.totalFDValue}
                    Icon={MdCreditCard}
                />

                <MetricCard
                    title={DISPLAY.TEXT.RD_VALUE}
                    value={analytics.totalRDValue}
                    Icon={MdCreditCard}
                />

                <MetricCard
                    title={DISPLAY.TEXT.GOLD_VALUE}
                    value={analytics.totalGoldValue}
                    Icon={FaCoins}
                />

                <MetricCard
                    title={DISPLAY.TEXT.STOCK_VALUE}
                    value={analytics.totalStockValue}
                    Icon={MdSsidChart}
                />
            </Grid>
        </Box>
    );
}