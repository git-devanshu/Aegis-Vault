import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import SYSTEM_DATA from '../../assets/system-data.json'
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import { Text, Flex, ButtonGroup, Grid } from '@chakra-ui/react'
import { createHash, createPassKey, decryptData, encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { getCategoryDisplayName } from "../../utility/helpers";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import Dropdown from "../../common-components/form/Dropdown";


export default function CategoryTab({expenseData, selectedTracker, selectedAccount, selectedTrackerIndex, setSelectedTrackerIndex, categoryData, refreshCategories, setRefreshCategories, trackerDataOptions, refreshTrackers, setRefreshTrackers}) {
    if(!selectedAccount) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, allowNewCategoryCreation} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];

    const [isLoading, setIsLoading] = useState(false);

    const [showSetBudgetPopup, setShowSetBudgetPopup] = useState(false);
    const [showCreateCategoryPopup, setShowCreateCategoryPopup] = useState(false);

    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: Object.keys(CATEGORY_ICONS)[0]
    });

    const [budgetData, setBudgetData] = useState([]);

    const categoryBudgetData = useMemo(()=>{
        const limitsMap = new Map(
            (selectedTracker?.limitsData || []).map(limit => [
                limit.categoryIndex,
                limit.limit
            ])
        );
    
        return categoryData.map(category =>{
            const budgetLimit = limitsMap.get(category.categoryIndex);
            if(!budgetLimit) return { hasBudget: false };
        
            const spentAmount = expenseData
                .filter(expense => expense.categoryIndex === category.categoryIndex)
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

    const createNewCategory = async(e) =>{
        if(categoryData.some(category => category.name.trim().toLowerCase() === newCategory.name.trim().toLowerCase())){
            toast.error(TOASTS.EXPENSE_MANAGER.CATEGORY_ALREADY_EXISTS);
            return;
        }
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const customCategories = categoryData.slice(SYSTEM_DATA.DEFAULT_EXPENSE_CATEGORIES.length);
            const highestCategoryIndex = categoryData.at(-1)?.categoryIndex ?? SYSTEM_DATA.DEFAULT_EXPENSE_CATEGORIES.length - 1;
            const updatedCategoryData = [
                ...customCategories,
                {
                    name: newCategory.name.trim(),
                    icon: newCategory.icon,
                    categoryIndex: highestCategoryIndex + 1
                }
            ];
            const {encryptedData: encryptedCategoryData, nonce} = await encryptData(JSON.stringify(updatedCategoryData), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/categories',
                data: { categoryData: encryptedCategoryData, nonce },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshCategories(!refreshCategories);
                    setNewCategory({
                        name: '',
                        icon: 'FaFolderOpen'
                    });
                    setShowCreateCategoryPopup(false);
                },
                onError: () =>{
                    setShowCreateCategoryPopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
        }
    }

    const openBudgetPopup = () =>{
        const limitsMap = new Map(
            (selectedTracker?.limitsData || []).map(limit => [
                limit.categoryIndex,
                limit.limit
            ])
        );
        setBudgetData(categoryData.map(category => ({
                categoryIndex: category.categoryIndex,
                limit: limitsMap.get(category.categoryIndex) || 0
            }))
        );
        setShowSetBudgetPopup(true);
    }

    const updateTrackerBudget = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const updatedLimitsData = budgetData
                .filter(item => Number(item.limit) > 0)
                .map(item => ({
                    categoryIndex: item.categoryIndex,
                    limit: Number(item.limit)
                }));
    
            const {encryptedData: limitsData, nonce: limitsDataNonce} = await encryptData(JSON.stringify(updatedLimitsData), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/limits',
                data: {
                    accountIndex: selectedAccount.accountIndex,
                    trackerIndex: selectedTracker.trackerIndex,
                    limitsData,
                    limitsDataNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshTrackers(!refreshTrackers);
                    setShowSetBudgetPopup(false);
                },
                onError: () =>{
                    setShowSetBudgetPopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
        }
    }

    return (
        <>
            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.marginL} marginTop={theme.spacing} alignItems='center'>
                <div style={{marginBottom: '-10px', marginTop: '-10px'}}>
                    <Dropdown value={selectedTrackerIndex} onChange={(e)=> setSelectedTrackerIndex(Number(e.target.value))} options={trackerDataOptions} />
                </div>
                <div style={{ marginTop: '-10px'}}>
                    <ButtonGroup width='100%'>
                        {allowNewCategoryCreation && <ActionButton name={DISPLAY.BUTTONS.CREATE_CATEGORY} onClick={()=> { setShowCreateCategoryPopup(true) }} /> }
                        <ActionButton name={DISPLAY.BUTTONS.SET_BUDGET} onClick={openBudgetPopup} actionType='primary' />
                    </ButtonGroup>
                </div>
            </Grid>

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL} alignItems='start'>
                {categoryData.map((category) => {
                    const Icon = getCategoryIcon(category);
                    return(
                        <Flex key={category.categoryIndex} backgroundColor={theme.cardBg} direction='column' padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
                            <Flex alignItems='center'>
                                <Icon color={theme.text} size='20px' style={{marginRight: theme.marginL, marginLeft: theme.marginS}}/>
                                <Text color={theme.text} fontSize={theme.textSize}>{getCategoryDisplayName(category, DISPLAY)}</Text>
                            </Flex>
                            <Flex direction='column' marginTop={theme.marginS}>
                                {
                                    categoryBudgetData[category.categoryIndex]?.hasBudget ?
                                    <>
                                        <Flex justify='space-between' marginBottom={theme.marginS}>
                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                                {DISPLAY.TEXT.BUDGET}
                                            </Text>

                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                                {country.currency.symbol} {categoryBudgetData[category.categoryIndex].spentAmount} {" / "} {country.currency.symbol} {categoryBudgetData[category.categoryIndex].budgetLimit}
                                            </Text>
                                        </Flex>

                                        <div style={{ width:'100%', height:'8px', borderRadius:'999px', backgroundColor:theme.border, overflow:'hidden' }}>
                                            <div style={{ width:`${categoryBudgetData[category.categoryIndex].percentageUsed}%`, height:'100%', transition:'0.3s',
                                                backgroundColor: categoryBudgetData[category.categoryIndex].percentageUsed >= 100 ? theme.error : categoryBudgetData[category.categoryIndex].percentageUsed >= 70 ? theme.warning : theme.primary,
                                            }}/>
                                        </div>
                                    </> :
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginS}>
                                        {DISPLAY.TEXT.NO_BUDGET_SET}
                                    </Text>
                                }
                            </Flex>
                        </Flex>
                    )}
                )}
                <div style={{height: '140px'}}></div>
            </Grid>

            {/* Popup for creating custom category */}
            <Popup isOpen={showCreateCategoryPopup && allowNewCategoryCreation} onClose={()=> setShowCreateCategoryPopup(false)} title={DISPLAY.TEXT.CREATE_CATEGORY} borderColor={theme.success} bg={theme.bg}>
                <form>
                    <InputBox type='text' label={DISPLAY.LABELS.CATEGORY_NAME} value={newCategory.name} onChange={(e)=> setNewCategory({...newCategory, name: e.target.value})} maxLen={30} required />
                    <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                        {DISPLAY.LABELS.SELECT_ICON}
                    </Text>
                    <Grid templateColumns='repeat(5, 1fr)' gap={theme.marginS} marginBottom={theme.spacing} height='280px' overflowY='scroll' style={{scrollbarWidth: "none"}}>
                        {
                            Object.entries(CATEGORY_ICONS).map(([iconName, Icon])=>(
                                <Flex key={iconName} align='center' justify='center' cursor='pointer' height='52px' 
                                    border={`1px solid ${newCategory.icon === iconName ? theme.primary : theme.border}`}
                                    borderRadius={`calc(${theme.radius} * 2)`}
                                    backgroundColor={newCategory.icon === iconName ? theme.hoverBg : theme.cardBg}
                                    transition='0.2s'
                                    _hover={{backgroundColor: theme.hoverBg}}
                                    onClick={()=> setNewCategory({...newCategory, icon: iconName})}
                                >
                                    <Icon size={20} color={newCategory.icon === iconName ? theme.primary : theme.text}/>
                                </Flex>
                            ))
                        }
                    </Grid>
                    <ActionButton name={DISPLAY.BUTTONS.CREATE_CATEGORY} onClick={createNewCategory} isLoading={isLoading} disabled={isLoading || newCategory.name.trim().length === 0} actionType='primary' customStyle={{marginBottom: theme.marginS}} />
                </form>
            </Popup>

            {/* Popup to Set Budget for the category */}
            <Popup isOpen={showSetBudgetPopup} onClose={()=> setShowSetBudgetPopup(false)} title={DISPLAY.TEXT.SET_BUDGET} borderColor={theme.success} bg={theme.bg}>
                <form>
                    <InputBox type='text' label={DISPLAY.LABELS.INCOME_SOURCE} value={selectedTracker?.name} readOnly={true} />
                    <div style={{height: '300px', overflowY: 'scroll', scrollbarWidth: 'none'}}>
                        {
                            categoryData.map((category, index)=>{
                                const Icon = CATEGORY_ICONS[category.icon];
                                return(
                                    <Grid key={category.categoryIndex} templateColumns='1fr 1fr' marginBottom='-10px' marginTop='-10px'>
                                        <Flex align='center' marginLeft={theme.marginS}>
                                            <Icon color={theme.text} size='18px' style={{marginRight: theme.marginL}}/>
                                            <Text color={theme.text}>
                                                {getCategoryDisplayName(category, DISPLAY)}
                                            </Text>
                                        </Flex>
                                        <InputBox type='number' value={budgetData[index]?.limit || ''} 
                                            onChange={(e)=>{
                                                const updatedData = [...budgetData];
                                                updatedData[index].limit = Number(e.target.value) || 0;
                                                setBudgetData(updatedData);
                                            }}
                                            customStyle={{marginTop: '-10px', marginBottom: '-10px'}}
                                        />
                                    </Grid>
                                );
                            })
                        }
                    </div>
                    <ActionButton name={DISPLAY.BUTTONS.SET_BUDGET} onClick={updateTrackerBudget} isLoading={isLoading} disabled={isLoading} actionType='primary' customStyle={{marginTop: theme.marginL, marginBottom: theme.marginS}} />
                </form>
            </Popup>
        </>
    );
}
