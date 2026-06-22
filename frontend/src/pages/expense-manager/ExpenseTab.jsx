import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import { Divider, Text, Flex, ButtonGroup, Spacer, Grid } from '@chakra-ui/react'
import { encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { getCategoryDisplayName, getCategoryMap } from "../../utility/helpers";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import { DeleteIcon } from '@chakra-ui/icons';
import { RiFileTransferLine } from "react-icons/ri";
import { MdOutlineViewAgenda } from "react-icons/md";
import { ImSortAmountDesc } from "react-icons/im";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Dropdown from "../../common-components/form/Dropdown";
import ExpenseTransferModal from "./ExpenseTransferModal";


export default function ExpenseTab({expenseData, trackerData, selectedAccount, selectedTrackerIndex, setSelectedTrackerIndex, categoryData, accountDataArray, setAccountData, refreshExpenses, setRefreshExpenses, trackerDataOptions, selectedTracker}) {
    if(!selectedAccount || !trackerData) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, allowExpenseDeletion} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];

    const [searchQuery, setSearchQuery] = useState('');
    const [groupByCategory, setGroupByCategory] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [showDeleteExpensePopup, setShowDeleteExpensePopup] = useState(false);
    const [expenseToBeDeleted, setExpenseToBeDeleted] = useState(null);

    const [showExpenseTransferModal, setShowExpenseTransferModal] = useState(false);

    const filteredExpenses = useMemo(()=>{
        const q = searchQuery.trim().toLowerCase();
        return [...expenseData].filter(expense =>
                expense.spentAt.toLowerCase().includes(q)
            ).sort((a, b)=>
                new Date(b.spentDate) - new Date(a.spentDate)
            );
    }, [expenseData, searchQuery]);

    const categoryMap = useMemo(
        ()=> getCategoryMap(categoryData),
        [categoryData]
    );

    const groupedExpenses = useMemo(()=>{
        const grouped = {};
        filteredExpenses.forEach(expense =>{
            const category = categoryMap[expense.categoryIndex];
            if(!category) return;
            if(!grouped[category.name]){
                grouped[category.name] = {
                    category,
                    expenses: []
                };
            }
            grouped[category.name].expenses.push(expense);
        });
        return Object.values(grouped);
    }, [filteredExpenses, categoryMap]);

    const getCategoryIcon = (category) =>{
        return CATEGORY_ICONS[category.icon];
    }

    const deleteExpense = async() =>{
        if(!expenseToBeDeleted) return;
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        try{
            const updatedAccount = {
                countryCode: selectedAccount.countryCode,
                bankId: selectedAccount.bankId,
                accountNo: selectedAccount.accountNo,
                accountAlias: selectedAccount.accountAlias,
                totalIncome: selectedAccount.totalIncome,
                totalExpense: selectedAccount.totalExpense - Number(expenseToBeDeleted.amount)
            };
            const {encryptedData: accountData, nonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/em/expenses/${expenseToBeDeleted.id}`,
                data: {accountData, nonce},
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    const updatedAccountForUI = {
                        ...selectedAccount,
                        totalExpense: selectedAccount.totalExpense - Number(expenseToBeDeleted.amount)
                    };
                    setAccountData(
                        accountDataArray.map(account =>{
                            if(account.accountIndex === selectedAccount.accountIndex){
                                return updatedAccountForUI;
                            }
                            return account;
                        })
                    );
                    setRefreshExpenses(!refreshExpenses);
                    setExpenseToBeDeleted(null);
                    setShowDeleteExpensePopup(false);
                },
                onError: () =>{
                    setExpenseToBeDeleted(null);
                    setShowDeleteExpensePopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    const ExpenseCard = ({expense}) =>{
        const category = categoryMap[expense.categoryIndex];
        const Icon = getCategoryIcon(category);
        return (
            <div style={{ backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 2)`, overflow:'hidden' }}>
                <Flex align='center' justify='space-between' padding={theme.paddingL} backgroundColor={theme.hoverBg}>
                    <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600}>
                        {country.currency.symbol} {expense.amount}
                    </Text>
                    <Icon color={theme.text} size='20px' style={{marginRight: theme.marginL}}/>
                </Flex>

                <div style={{padding: theme.paddingL, paddingTop: '0px'}}>
                    <Flex align='center' justify='space-between'>
                        <div>
                            <Text color={theme.text} fontSize={theme.textSize}>
                                {expense.spentAt}
                            </Text>
                            <Text color={theme.textSecondary} fontWeight={500} fontSize={theme.smallTextSize} backgroundColor={theme.hoverBg} padding='0 6px' borderRadius='4px' marginTop='3px' width='fit-content'>
                                {new Date(expense.spentDate).toLocaleDateString(country.locale)}
                            </Text>
                        </div>
                        {allowExpenseDeletion && 
                            <div style={{marginTop: theme.marginL}}>
                                <CircleIconButton icon={<DeleteIcon />} onClick={()=> { setExpenseToBeDeleted(expense); setShowDeleteExpensePopup(true); }} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                            </div>
                        }
                    </Flex>
                </div>
            </div>
        );
    }

    return (
        <>
            <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.spacing}>
                <Flex align='center' gap={theme.marginL}>
                    <div style={{width:'100%', marginBottom:'-10px', marginTop: '-10px'}}>
                        <Dropdown value={selectedTrackerIndex} onChange={(e)=> setSelectedTrackerIndex(Number(e.target.value))} options={trackerDataOptions} />
                    </div>
                    <div style={{marginBottom: '8px'}}>
                        <CircleIconButton icon={groupByCategory ? <ImSortAmountDesc/> : <MdOutlineViewAgenda/>}
                            iconSize='16px'
                            onClick={()=> setGroupByCategory(!groupByCategory)}
                            tooltip={groupByCategory ? DISPLAY.TOOLTIPS.SORT_BY_DATE : DISPLAY.TOOLTIPS.GROUP_BY_CATEGORY}
                        />
                    </div>
                </Flex>
                <Flex align='center' gap={theme.marginL}>
                    <div style={{width:'100%', marginBottom:'-10px', marginTop: '-10px'}}>
                        <InputBox placeholder={`🔎︎ ${DISPLAY.LABELS.SEARCH_EXPENSE}`} type='text' name='searchQuery' value={searchQuery} onChange={(e)=> setSearchQuery(e.target.value)}/>
                    </div>
                    <div style={{marginBottom: '8px'}}>
                        <CircleIconButton icon={<RiFileTransferLine/>}
                            iconSize='18px'
                            onClick={()=> { setShowExpenseTransferModal(true); }}
                            tooltip={DISPLAY.TOOLTIPS.TRANSFER_EXPENSES}
                        />
                    </div>
                </Flex>
            </Grid>

            {filteredExpenses.length === 0 &&
                <div style={{width:'100%', display:'flex', marginTop:theme.spacing, justifyContent:'center'}}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                        {DISPLAY.TEXT.NO_DATA}
                    </Text>
                </div>
            }

            {!groupByCategory &&
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} alignItems='start' >
                    {
                        filteredExpenses.map(expense =>(
                            <ExpenseCard key={expense.id} expense={expense}/>
                        ))
                    }
                    <div style={{height:'140px'}}></div>
                </Grid>
            }

            {groupByCategory &&
                <div style={{marginTop:theme.marginL}}>
                    {
                        groupedExpenses.map(group =>{
                            const Icon = getCategoryIcon(group.category);
                            return(
                                <div key={group.category.categoryIndex} style={{marginBottom:theme.spacing}}>
                                    <Flex align='center' gap={theme.marginS} marginBottom={theme.marginL}>
                                        <Icon color={theme.primary} size='18px'/>
                                        <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}> {getCategoryDisplayName(group.category, DISPLAY)} </Text>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}> ({group.expenses.length}) </Text>
                                    </Flex>
                                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} alignItems='start'>
                                        {
                                            group.expenses.map(expense =>(
                                                <ExpenseCard key={expense.id} expense={expense}/>
                                            ))
                                        }
                                    </Grid>
                                </div>
                            )
                        })
                    }
                    <div style={{height:'140px'}}></div>
                </div>
            }

            {/* Delete Expense Popup */}
            <Popup isOpen={showDeleteExpensePopup && allowExpenseDeletion} onClose={()=> setShowDeleteExpensePopup(false)} title={DISPLAY.TEXT.DELETE_EXPENSE} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_EXPENSE}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteExpensePopup(false)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteExpense} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                </ButtonGroup>
            </Popup>

            {/* Expense Transfer Modal */}
            {showExpenseTransferModal && <ExpenseTransferModal onBack={()=> setShowExpenseTransferModal(false) } expenseData={expenseData} trackerData={trackerData} selectedTracker={selectedTracker} country={country} refreshExpenses={refreshExpenses} setRefreshExpenses={setRefreshExpenses} />}
        </>
    );
}
