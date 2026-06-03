import React, { useState } from "react";
import { Flex, Text, Divider, Spacer } from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from "../../utility/crypto";
import { apiRequest, validateAndStartLoading } from "../../utility/api";

import { ArrowBackIcon } from '@chakra-ui/icons';

import Dropdown from "../../common-components/form/Dropdown";
import ActionButton from "../../common-components/form/ActionButton";
import { GiMoneyStack } from "react-icons/gi";
import InputBox from "../../common-components/form/InputBox";


export default function AddMultipleExpensesModal({onBack, selectedAccount, selectedTracker, categoryData, refreshExpenses, setRefreshExpenses, accountDataArray, setAccountData, quickSaveLogs, setQuickSaveLogs}) {
    if(!selectedAccount || !selectedTracker){
        return null;
    }

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [expenses, setExpenses] = useState(quickSaveLogs);
    const [isLoading, setIsLoading] = useState(false);

    const country = BANKS.country[selectedAccount.countryCode];

    const handleCategoryChange = (index, value) =>{
        const updatedExpenses = [...expenses];
        updatedExpenses[index].categoryIndex = Number(value);
        setExpenses(updatedExpenses);
    }

    const importExpenses = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            let totalExpenseAmount = 0;
            const encryptedExpenses = await Promise.all(
                expenses.map(async(expense)=>{
                    totalExpenseAmount += Number(expense.amount);
                    const expensePayload = {
                        spentAt: expense.spentAt,
                        amount: expense.amount,
                        spentDate: expense.spentDate
                    };
                    const {encryptedData: expenseData, nonce} = await encryptData(JSON.stringify(expensePayload), masterKey);
                    return {
                        accountIndex: selectedAccount.accountIndex,
                        trackerIndex: selectedTracker.trackerIndex,
                        categoryIndex: expense.categoryIndex,
                        expenseData,
                        nonce
                    };
                })
            );

            const updatedAccount = {
                countryCode: selectedAccount.countryCode,
                bankId: selectedAccount.bankId,
                accountNo: selectedAccount.accountNo,
                accountAlias: selectedAccount.accountAlias,
                totalIncome: selectedAccount.totalIncome,
                totalExpense: selectedAccount.totalExpense + totalExpenseAmount
            };
            const {encryptedData: accountData, nonce: accountNonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);

            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/expenses/multiple',
                data: {
                    expenses: encryptedExpenses,
                    accountData,
                    accountNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    const updatedAccountForUI = {
                        ...selectedAccount,
                        totalExpense: selectedAccount.totalExpense + totalExpenseAmount
                    };
                    setAccountData(accountDataArray.map(account =>{
                            if(account.accountIndex === selectedAccount.accountIndex){
                                return updatedAccountForUI;
                            }
                            return account;
                        })
                    );
                    localStorage.removeItem('aegis-saved-logs');
                    setQuickSaveLogs([]);
                    setRefreshExpenses(!refreshExpenses);
                    onBack();
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
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <GiMoneyStack color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                    {DISPLAY.LABELS.EXPENSE_MANAGER}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width:'fit-content'}}/>
            </Flex>

            <Divider borderColor={theme.border} borderWidth='1px' />

            <div className="common-container">
                <Text color={theme.text} fontSize={theme.text} fontWeight={500} textAlign='center' marginTop={theme.spacing} marginBottom={theme.spacing}>
                    {DISPLAY.TEXT.ASSIGN_CATEGORIES}
                </Text>

                <InputBox type='text' label={DISPLAY.LABELS.INCOME_SOURCE} value={selectedTracker?.name} readOnly={true} />

                <div style={{display:'flex', flexDirection:'column', gap:theme.marginL}}>
                    {
                        expenses.map((expense, index)=>(
                            <div key={index} style={{border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 2)`, padding:theme.paddingL, backgroundColor:theme.cardBg}}>
                                <div>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                                        {country.currency.symbol} {expense.amount}
                                    </Text>
                                    <Flex align='center' justify='space-between' marginTop={theme.marginS}>
                                        <Text color={theme.text} fontSize={theme.textSize}>{expense.spentAt}</Text>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} backgroundColor={theme.hoverBg} padding='0 4px' borderRadius='4px'> {expense.spentDate} </Text>
                                    </Flex>
                                </div>
                                <div style={{marginBottom: '-20px'}}>
                                    <Dropdown value={expense.categoryIndex} onChange={(e)=> handleCategoryChange(index, e.target.value)}
                                        options={
                                            categoryData.map((category)=>({
                                                label: category.name,
                                                value: category.categoryIndex
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        ))
                    }
                </div>

                <ActionButton name={DISPLAY.BUTTONS.ADD_EXPENSE} onClick={importExpenses} isLoading={isLoading} disabled={isLoading || expenses.length === 0} actionType='primary' customStyle={{marginTop:theme.spacing}} />
            </div>
        </div>
        </div>
    );
}
