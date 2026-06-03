import React, { useMemo } from "react";
import { Flex, Text, Divider, Spacer, Grid, Progress, Image } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import useLanguage from "../../hooks/useLanguage";

import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdAnalytics, MdDownload, MdOutlineInsights } from "react-icons/md";
import { FaChartPie, FaWallet, FaChartLine } from "react-icons/fa";
import { RiBubbleChartLine } from "react-icons/ri";

import ActionButton from "../../common-components/form/ActionButton";
import WidgetAAccountSnapshot from "../../common-components/widgets/WidgetAAccountSnapshot";
import WidgetBCategoryDistribution from "../../common-components/widgets/WidgetBCategoryDistribution";
import WidgetCTopExpenses from "../../common-components/widgets/WidgetCTopExpenses";
import WidgetDBudgetVsActual from "../../common-components/widgets/WidgetDBudgetVsActual";
import WidgetEBudgetHealth from "../../common-components/widgets/WidgetEBudgetHealth";
import WidgetFSpendingTimeline from "../../common-components/widgets/WidgetFSpendingTimeline";
import WidgetGIncomeOverview from "../../common-components/widgets/WidgetGIncomeOverview";
import WidgetHTopSpendingDays from "../../common-components/widgets/WidgetHTopSpendingDays";
import WidgetIWeekendVsWeekday from "../../common-components/widgets/WidgetIWeekendVsWeekday";
import WidgetJInsights from "../../common-components/widgets/WidgetJInsights";
import InputBox from "../../common-components/form/InputBox";
import Dropdown from "../../common-components/form/Dropdown";


export default function ExpenseAnalyticsModal({onBack, selectedAccount, selectedTracker, expenseData, categoryData, selectedTrackerIndex, setSelectedTrackerIndex, trackerDataOptions, trackerData, setSelectedTab}) {
    if(!selectedAccount || !selectedTracker){
        return null;
    }

    const {DISPLAY} = useLanguage();
    const country = BANKS.country[selectedAccount.countryCode];
    const bank = BANKS.banks[selectedAccount.bankId];
    
    return (
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiBubbleChartLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                    {DISPLAY.LABELS.EXPENSE_ANALYTICS}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width:'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <Flex gap={theme.marginL} justifyContent='space-between' alignItems='center' marginTop={theme.marginL}>
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
                <div style={{marginBottom: '-20px', marginTop: '-10px'}}>
                    <Dropdown value={selectedTrackerIndex} onChange={(e)=> setSelectedTrackerIndex(Number(e.target.value))} options={trackerDataOptions} />
                </div>
            </Flex>

            <Grid templateColumns={{base:'1fr', lg:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                <Flex direction='column' gap={theme.paddingL}>
                    <WidgetAAccountSnapshot selectedAccount={selectedAccount} trackerData={trackerData} onBack={onBack} setSelectedTab={setSelectedTab} />
                    <WidgetGIncomeOverview selectedAccount={selectedAccount} selectedTracker={selectedTracker} expenseData={expenseData} country={country} setSelectedTab={setSelectedTab} onBack={onBack} />
                </Flex>
                <Flex direction='column' gap={theme.paddingL}>
                    <WidgetBCategoryDistribution categoryData={categoryData} expenseData={expenseData} selectedAccount={selectedAccount}/>
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}>
                        
                        <WidgetJInsights expenseData={expenseData} categoryData={categoryData} selectedTracker={selectedTracker} selectedAccount={selectedAccount}/>
                    </Grid>
                </Flex>

                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}>
                    <WidgetDBudgetVsActual categoryData={categoryData} expenseData={expenseData} selectedTracker={selectedTracker} country={country}/>
                </Grid>
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}></Grid>

                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}></Grid>
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}></Grid>
            </Grid>
            
            
            {/* <div style={{paddingTop: theme.marginL}}>
                <WidgetAAccountSnapshot
                    selectedAccount={selectedAccount}
                    country={country}
                />

                <Grid templateColumns={{base:'1fr', xl:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                    <WidgetGIncomeOverview
                        selectedTracker={selectedTracker}
                        expenseData={expenseData}
                        country={country}
                    />

                    <WidgetCTopExpenses
                        selectedTracker={selectedTracker}
                        expenseData={expenseData}
                        country={country}
                    />
                </Grid>

                <Grid templateColumns={{base:'1fr', xl:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                    <WidgetBCategoryDistribution
                        categoryData={categoryData}
                        expenseData={expenseData}
                        country={country}
                    />

                    <WidgetEBudgetHealth
                        expenseData={expenseData}
                        selectedTracker={selectedTracker}
                    />
                </Grid>

                <div style={{marginTop: theme.marginL}}>
                    <WidgetDBudgetVsActual
                        categoryData={categoryData}
                        expenseData={expenseData}
                        selectedTracker={selectedTracker}
                        country={country}
                    />
                </div>

                <div style={{marginTop: theme.marginL}}>
                    <WidgetFSpendingTimeline
                        expenseData={expenseData}
                        country={country}
                    />
                </div>

                <Grid templateColumns={{base:'1fr', xl:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                    <WidgetHTopSpendingDays
                        expenseData={expenseData}
                        country={country}
                    />
                    <WidgetIWeekendVsWeekday
                        expenseData={expenseData}
                        country={country}
                    />
                </Grid>

                <div style={{marginTop: theme.marginL}}>
                    <WidgetJInsights
                        expenseData={expenseData}
                        selectedTracker={selectedTracker}
                        categoryData={categoryData}
                        country={country}
                    />
                </div>

                <div style={{height:'120px'}}></div>

            </div> */}
        </div>
        </div>
    );
}
