import React, { useMemo, useState } from "react";
import { Flex, Text, Divider, Spacer, Grid, Image, GridItem, Box } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from "../../hooks/useLanguage";
import { calculateInvestmentAnalytics } from "../../utility/investmentAnalyticsMetrics";

import { ArrowBackIcon } from '@chakra-ui/icons';
import { RiBubbleChartLine } from "react-icons/ri";

import ActionButton from "../../common-components/form/ActionButton";
import WidgetAInvestmentSnapshot from "../../common-components/widgets/investment-analytics/WidgetAInvestmentSnapshot";
import WidgetBAssetAllocation from "../../common-components/widgets/investment-analytics/WidgetBAssetAllocation";
import WidgetCInterestEarned from "../../common-components/widgets/investment-analytics/WidgetCInterestEarned";
import WidgetDUpcomingMaturities from "../../common-components/widgets/investment-analytics/WidgetDUpcomingMaturities";
import WidgetEHoldingsSummary from "../../common-components/widgets/investment-analytics/WidgetEHoldingsSummary";
import WidgetFTopHoldings from "../../common-components/widgets/investment-analytics/WidgetFTopHoldings";


export default function InvestmentAnalyticsModal({onBack, selectedAccount, groupedFDData, rdData, goldAssetData, stockData}) {
    if(!selectedAccount){
        return null;
    }

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const lgColumnWidth = (screenWidth - (3 * 10)) / 2; // 10 is the value for theme.paddingL
    const mdColumnWidth = (lgColumnWidth - 10) / 2; // 10 is the value for theme.paddingL
    const baseColumnWidth = (screenWidth - (2 * 10)); // 10 is the value for theme.paddingL

    const {DISPLAY} = useLanguage();
    const country = BANKS.country[selectedAccount.countryCode];
    const bank = BANKS.banks[selectedAccount.bankId];

    const analytics = useMemo(
        () => calculateInvestmentAnalytics(
            groupedFDData,
            rdData,
            goldAssetData,
            stockData,
            DISPLAY
        ),
        [groupedFDData, rdData, goldAssetData, stockData]
    );

    return (
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiBubbleChartLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                    {DISPLAY.LABELS.INVESTMENT_ANALYTICS}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width:'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <Flex gap={theme.paddingL} justifyContent='space-between' alignItems='center' marginTop={theme.marginL} marginBottom={theme.marginL}>
                <Flex gap={theme.paddingL} align='center'>
                    <Image src={bank.logo} alt={bank.bankName} width='45px' height='45px' borderRadius='4px' />
                    <div>
                        <Text fontSize={theme.text} fontWeight={500} color={theme.text}>
                            {bank.bankName}
                        </Text>
                        <Text fontSize={theme.smallTextSize} color={theme.textSecondary}>
                            {country.countryName}
                        </Text>
                    </div>
                </Flex>
            </Flex>

            {/* Active Investments Aggregation */}
            <WidgetAInvestmentSnapshot country={country} analytics={analytics} />

            <Grid templateColumns={{base:`${baseColumnWidth}px`, lg:`${lgColumnWidth}px ${lgColumnWidth}px`}} templateRows={{base: '1fr 1fr', lg: '226px'}} gap={theme.paddingL} marginTop={theme.marginL}>    
                <WidgetBAssetAllocation analytics={analytics} />
                <WidgetCInterestEarned country={country} analytics={analytics} />
            </Grid>

            <Grid templateColumns={{base:`${baseColumnWidth}px`, lg:`${lgColumnWidth}px ${lgColumnWidth}px`}} gap={theme.paddingL} marginTop={theme.marginL}>  
                <Grid templateColumns={{base:`${baseColumnWidth}px`, md:`${mdColumnWidth}px ${mdColumnWidth}px`}} gap={theme.paddingL}>
                    <WidgetEHoldingsSummary analytics={analytics} />
                    <WidgetFTopHoldings country={country} analytics={analytics} />
                </Grid>
                <WidgetDUpcomingMaturities country={country} analytics={analytics} />
            </Grid>

            {screenWidth > 486 && <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginL}>
                {DISPLAY.TEXT.ZOOM_AT_90_NOTE}
            </Text>}
        </div>
        </div>
    );
}
