import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import SYSTEM_DATA from '../../assets/system-data.json'
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import { Divider, Text, Flex, Stack, useMediaQuery, ButtonGroup, Spacer, Grid } from '@chakra-ui/react'
import { createHash, createPassKey, decryptData, encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useClearOnUnmount from '../../hooks/useClearOnUnmount';

import { ArrowBackIcon, AddIcon, LockIcon, EditIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import { MdRefresh, MdAutoGraph, MdOutlineSettingsBackupRestore } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { PiChartDonut } from "react-icons/pi";
import { TbMoneybagPlus } from "react-icons/tb";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Dropdown from "../../common-components/form/Dropdown";


export default function CategoryTab({expenseData, selectedTracker, selectedAccount, selectedTrackerIndex, setSelectedTrackerIndex, categoryData, accountDataArray, setAccountData, refreshCategories, setRefreshCategories, trackerDataOptions}) {
    if(!selectedAccount || !selectedTracker) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];

    const [isLoading, setIsLoading] = useState(false);

    const [showSetBudgetPopup, setShowSetBudgetPopup] = useState(false);
    const [showCreateCategoryPopup, setShowCreateCategoryPopup] = useState(false);
    const [showDeleteCategoryPopup, setShowDeleteCategoryPopup] = useState(false);

    const categoryBudgetData = useMemo(()=>{
        const limitsMap = new Map(
            (selectedTracker?.limitsData || []).map(limit => [
                limit.categoryIndex,
                limit.limit
            ])
        );
    
        return categoryData.map((category, index)=>{
            const budgetLimit = limitsMap.get(index);
            if(!budgetLimit){
                return { hasBudget: false };
            }
    
            const spentAmount = expenseData
                .filter(expense => expense.categoryIndex === index)
                .reduce((sum, expense)=> sum + expense.amount, 0);
    
            const percentageUsed = Math.min((spentAmount / budgetLimit) * 100, 100);
    
            return {
                hasBudget: true,
                budgetLimit,
                spentAmount,
                percentageUsed
            };
        });
    }, [categoryData, expenseData, selectedTracker]);

    const getCategoryIcon = (category) =>{
        return CATEGORY_ICONS[category.icon];
    }

    return (
        <>
            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL} alignItems='center'>
                <div style={{marginBottom: '-10px', marginTop: '-10px'}}>
                    <Dropdown value={selectedTrackerIndex} onChange={(e)=> setSelectedTrackerIndex(Number(e.target.value))} options={trackerDataOptions} />
                </div>
                <div style={{ marginTop: '-10px'}}>
                    <ButtonGroup width='100%'>
                        <ActionButton name={DISPLAY.BUTTONS.CREATE_CATEGORY} onClick={()=> {}} />
                        <ActionButton name={DISPLAY.BUTTONS.SET_BUDGET} onClick={()=> { setShowSetBudgetPopup(true) }} actionType='primary' />
                    </ButtonGroup>
                </div>
            </Grid>

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                {categoryData.map((category, index) => {
                    const Icon = getCategoryIcon(category);
                    return(
                        <Flex backgroundColor={theme.cardBg} direction='column' padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
                            <Flex alignItems='center' height='40px'>
                                <Icon color={theme.text} size='20px' style={{marginRight: theme.marginL, marginLeft: theme.marginS}}/>
                                <Text color={theme.text} fontSize={theme.textSize}>{category.name}</Text>
                                <Spacer/>
                                {index >= SYSTEM_DATA.DEFAULT_EXPENSE_CATEGORIES.length && <CircleIconButton icon={<DeleteIcon />} onClick={()=> {}} tooltip={DISPLAY.TOOLTIPS.DELETE}/>}
                            </Flex>
                            <Flex direction='column' marginTop={theme.marginS}>
                                {
                                    categoryBudgetData[index]?.hasBudget ?
                                    <>
                                        <Flex justify='space-between' marginBottom={theme.marginS}>
                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                                {DISPLAY.TEXT.BUDGET}
                                            </Text>

                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                                {country.currency.symbol} {categoryBudgetData[index].spentAmount} {" / "} {country.currency.symbol} {categoryBudgetData[index].budgetLimit}
                                            </Text>
                                        </Flex>

                                        <div style={{ width:'100%', height:'8px', borderRadius:'999px', backgroundColor:theme.border, overflow:'hidden' }}>
                                            <div style={{ width:`${categoryBudgetData[index].percentageUsed}%`, height:'100%', transition:'0.3s',
                                                backgroundColor: categoryBudgetData[index].percentageUsed >= 100 ? theme.error : categoryBudgetData[index].percentageUsed >= 70 ? theme.warning : theme.primary,
                                            }}/>
                                        </div>
                                    </> :
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                        {DISPLAY.TEXT.NO_BUDGET_SET}
                                    </Text>
                                }
                            </Flex>
                        </Flex>
                    )}
                )}
            </Grid>

            {/* Popup to Set Budget for the category */}
            <Popup isOpen={showSetBudgetPopup} onClose={()=> setShowSetBudgetPopup(false)} title={DISPLAY.TEXT.SET_BUDGET} borderColor={theme.warning}>
                <form>

                    <ActionButton name={DISPLAY.BUTTONS.SET_BUDGET} onClick={()=>{}} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                </form>
            </Popup>

            {/* Popup to delete custom category */}
        </>
    );
}
