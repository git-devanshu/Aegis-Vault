import React, { useMemo, useState } from "react";
import { Flex, Text, Divider, Spacer, Grid, Image, GridItem } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext.jsx";
import getExpenseAnalyticsMetrics, {downloadAnalyticsReport, downloadExpenseStatement} from "../../utility/expenseAnalyticsMetrics.js";

import { ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import { RiBubbleChartLine } from "react-icons/ri";
import { BiSolidReport } from "react-icons/bi";

import ActionButton from "../../common-components/form/ActionButton";
import WidgetAAccountSnapshot from "../../common-components/widgets/expense-analytics/WidgetAAccountSnapshot.jsx";
import WidgetBCategoryDistribution from "../../common-components/widgets/expense-analytics/WidgetBCategoryDistribution.jsx";
import WidgetCTopExpenses from "../../common-components/widgets/expense-analytics/WidgetCTopExpenses.jsx";
import WidgetDBudgetVsActual from "../../common-components/widgets/expense-analytics/WidgetDBudgetVsActual.jsx";
import WidgetEBudgetHealth from "../../common-components/widgets/expense-analytics/WidgetEBudgetHealth.jsx";
import WidgetFSpendingTimeline from "../../common-components/widgets/expense-analytics/WidgetFSpendingTimeline.jsx";
import WidgetGIncomeOverview from "../../common-components/widgets/expense-analytics/WidgetGIncomeOverview.jsx";
import WidgetHTopSpendingDays from "../../common-components/widgets/expense-analytics/WidgetHTopSpendingDays.jsx";
import WidgetIWeekendVsWeekday from "../../common-components/widgets/expense-analytics/WidgetIWeekendVsWeekday.jsx";
import WidgetJInsights from "../../common-components/widgets/expense-analytics/WidgetJInsights.jsx";
import Dropdown from "../../common-components/form/Dropdown";


export default function ExpenseAnalyticsModal({onBack, selectedAccount, selectedTracker, expenseData, categoryData, selectedTrackerIndex, setSelectedTrackerIndex, trackerDataOptions, trackerData, setSelectedTab}) {
    if(!selectedAccount || !selectedTracker){
        return null;
    }

    const {hideAccountSnapshotInAnalytics} = useAppContext();

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const lgColumnWidth = (screenWidth - (3 * 10)) / 2; // 10 is the value for theme.paddingL
    const mdColumnWidth = (lgColumnWidth - 10) / 2; // 10 is the value for theme.paddingL
    const baseColumnWidth = (screenWidth - (2 * 10)); // 10 is the value for theme.paddingL

    const {DISPLAY} = useLanguage();
    const country = BANKS.country[selectedAccount.countryCode];
    const bank = BANKS.banks[selectedAccount.bankId];

    const analytics = useMemo(
        ()=> getExpenseAnalyticsMetrics({
            expenseData,
            categoryData,
            selectedTracker,
            selectedAccount,
            DISPLAY
        }),
        [expenseData, categoryData, selectedTracker, selectedAccount]
    );
    
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
                <div style={{marginBottom: '-20px', marginTop: '-10px'}}>
                    <Dropdown value={selectedTrackerIndex} onChange={(e)=> setSelectedTrackerIndex(Number(e.target.value))} options={trackerDataOptions} />
                </div>
            </Flex>

            {!hideAccountSnapshotInAnalytics && <WidgetAAccountSnapshot selectedAccount={selectedAccount} analytics={analytics} /> }

            <Grid templateColumns={{base:`${baseColumnWidth}px`, lg:`${lgColumnWidth}px ${lgColumnWidth}px`}} templateRows={{base: 'auto', lg: '486px'}} gap={theme.paddingL} marginTop={theme.marginL}>
                <Flex direction='column' gap={theme.paddingL}>
                    <WidgetGIncomeOverview analytics={analytics} country={country} />
                    <Grid templateColumns={{base:`${baseColumnWidth}px`, md:`${mdColumnWidth}px ${mdColumnWidth}px`}} gap={theme.paddingL} height='100%'>
                        <WidgetDBudgetVsActual analytics={analytics} categoryData={categoryData} />
                        <WidgetEBudgetHealth analytics={analytics} />
                    </Grid>
                </Flex>
                <Grid templateColumns={{base: `${baseColumnWidth}px`, md: `${mdColumnWidth}px ${mdColumnWidth}px`}} gap={theme.paddingL}>
                    <WidgetBCategoryDistribution analytics={analytics} categoryData={categoryData} country={country}/>
                    <WidgetJInsights expenseData={expenseData} categoryData={categoryData} selectedTracker={selectedTracker} country={country}/>
                </Grid>
            </Grid>

            <Grid templateColumns={{base:`${baseColumnWidth}px`, lg:`${lgColumnWidth}px ${lgColumnWidth}px`}} gap={theme.paddingL} marginTop={theme.marginL}>    
                <Grid templateColumns={{base:`${baseColumnWidth}px`, md:`${mdColumnWidth}px ${mdColumnWidth}px`}} gap={theme.paddingL}>
                    <WidgetCTopExpenses analytics={analytics} country={country} onBack={onBack} setSelectedTab={setSelectedTab}/>
                    <WidgetFSpendingTimeline analytics={analytics} />
                </Grid>
                <Grid templateColumns={{base:`${baseColumnWidth}px`, md:`${mdColumnWidth}px ${mdColumnWidth}px`}} gap={theme.paddingL}>
                    <WidgetHTopSpendingDays analytics={analytics} country={country} />
                    <WidgetIWeekendVsWeekday analytics={analytics} country={country} />
                </Grid>
            </Grid>

            <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg:'1fr 1fr 1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                {screenWidth > 486 && <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginTop={theme.marginL}>
                    {DISPLAY.TEXT.ZOOM_AT_90_NOTE}
                </Text>}
                
                <GridItem colStart={{lg:3}}>
                    <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_STATEMENT} icon={<DownloadIcon/>}
                        onClick={()=> downloadExpenseStatement({
                            expenseData,
                            categoryData,
                            selectedTracker,
                            bank,
                            country,
                            DISPLAY
                        })}
                    />
                </GridItem>

                <GridItem>
                    <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_REPORT} actionType='primary' icon={<BiSolidReport/>}
                        onClick={()=> downloadAnalyticsReport({
                            analytics,
                            selectedAccount,
                            selectedTracker,
                            country,
                            DISPLAY,
                            bank
                        })}
                    />
                </GridItem>
            </Grid>
        </div>
        </div>
    );
}
