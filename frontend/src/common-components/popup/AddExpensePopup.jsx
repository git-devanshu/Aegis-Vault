import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import {Divider, Flex, Text} from '@chakra-ui/react';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';
import TabGroup from '../navbar/TabGroup';
import AddMultipleExpensesModal from '../../pages/expense-manager/AddMultipleExpensesModal';

import * as XLSX from 'xlsx';


export default function AddExpensePopup({isOpen, onClose, selectedAccount, selectedTracker, categoryData, refreshExpenses, setRefreshExpenses, accountDataArray, setAccountData}) {
    if(!selectedTracker){
        return null;
    }
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [expense, setExpense] = useState({
        amount: 0,
        spentAt: '',
        spentDate: new Date().toLocaleDateString('en-CA')
    });

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const tabs = [DISPLAY.LABELS.FILL_DETAILS, DISPLAY.LABELS.IMPORT];
    const [selectedTab, setSelectedTab] = useState(0);

    const [quickSaveLogs, setQuickSaveLogs] = useState(JSON.parse(localStorage.getItem('aegis-saved-logs')) || []);
    const [showAddMultipleExpenseModal, setShowAddMultipleExpenseModal] = useState(false);

    const handleChange = (e) =>{
        setExpense({
            ...expense,
            [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
        });
    }

    const addExpense = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const {encryptedData: expenseData, nonce} = await encryptData(JSON.stringify(expense), masterKey);
            const updatedAccount = {
                countryCode: selectedAccount.countryCode,
                bankId: selectedAccount.bankId,
                accountNo: selectedAccount.accountNo,
                accountAlias: selectedAccount.accountAlias,
                totalIncome: selectedAccount.totalIncome, 
                totalExpense: selectedAccount.totalExpense + Number(expense.amount)
            };
            const {encryptedData: accountData, nonce: accountNonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/expenses',
                data: {
                    accountIndex: selectedAccount.accountIndex,
                    trackerIndex: selectedTracker.trackerIndex,
                    categoryIndex: selectedCategoryIndex,
                    expenseData,
                    nonce,
                    accountData,
                    accountNonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    const updatedAccountForUI = {
                        ...selectedAccount,
                        totalExpense: selectedAccount.totalExpense + Number(expense.amount)
                    };
                    setAccountData(accountDataArray.map(account =>{
                            if(account.accountIndex === selectedAccount.accountIndex){
                                return updatedAccountForUI;
                            }
                            return account;
                        })
                    );
                    onClose(false);
                    setRefreshExpenses(!refreshExpenses);
                    setExpense({
                        amount: 0,
                        spentAt: '',
                        spentDate: new Date().toLocaleDateString('en-CA')
                    });
                    setSelectedCategoryIndex(0);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }


    // function to import the data from excel
    const importFromExcel = async(e) =>{
        try{
            const file = e.target.files[0];
            if(!file) return;

            const data = await file.arrayBuffer();    
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {defval: ''});
    
            const formattedLogs = jsonData
                .map(row =>({
                    spentAt: String(row['spent At'] || '').trim(),
                    amount: Number(row['amount']) || 0,
                    spentDate: row['date'] 
                        ? new Date(row['date']).toLocaleDateString('en-CA')
                        : new Date().toLocaleDateString('en-CA'),
                    categoryIndex: 0
                }))
                .filter(log =>
                    log.spentAt.length > 0 &&
                    log.amount > 0
                );
            setQuickSaveLogs(formattedLogs);
            setShowAddMultipleExpenseModal(true);
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR);
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.ADD_EXPENSE} bg={theme.bg} borderColor={theme.success}>
            <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>

            {/* Fill details */}
            {selectedTab === 0 && <form style={{marginTop: theme.spacing, height: '397px'}}>
                <InputBox type='text' label={DISPLAY.LABELS.INCOME_SOURCE} value={selectedTracker?.name} readOnly={true} />
                <InputBox type='text' label={DISPLAY.LABELS.SPENT_AT} name='spentAt' value={expense.spentAt} onChange={handleChange} required maxLen={50} />
                <InputBox type='number' label={DISPLAY.LABELS.AMOUNT} name='amount' value={expense.amount} onChange={handleChange} required min={0} />
                <DateInput value={expense.spentDate} name='spentDate' onChange={handleChange} />

                <Dropdown value={selectedCategoryIndex} onChange={(e)=> setSelectedCategoryIndex(Number(e.target.value))} 
                    options={categoryData.map(
                        (category, index)=>({
                            label: category.name,
                            value: index
                        })
                    )}
                />

                <ActionButton name={DISPLAY.BUTTONS.ADD_EXPENSE} actionType='primary' isLoading={isLoading} disabled={isLoading || expense.amount <= 0} onClick={addExpense} customStyle={{marginBottom: theme.marginL}} />
            </form>}
            
            {/* Import */}
            {selectedTab === 1 && <Flex alignItems='center' direction='column' style={{marginTop: theme.spacing, height: '397px'}}>
                <Text color={theme.text} fontSize={theme.textSize} align='center' marginBottom={theme.marginL}>{DISPLAY.TEXT.QUICKSAVE_EXPENSE_COUNT}: {quickSaveLogs.length}</Text>
                <ActionButton onClick={()=> setShowAddMultipleExpenseModal(true) } name={DISPLAY.BUTTONS.IMPORT_FROM_QUICKSAVE} disabled={quickSaveLogs.length === 0} actionType='primary' customStyle={{width: 'fit-content', marginTop: theme.marginL, marginBottom: theme.spacing}}/>

                <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} marginBottom={theme.marginL}/>

                <Text color={theme.text} fontSize={theme.textSize} align='center' marginTop={theme.marginL}>{DISPLAY.TEXT.EXCEL_UPLOAD_INFO}:</Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} align='center' marginTop={theme.marginS} marginBottom={theme.marginL}>
                    [{DISPLAY.LABELS.SPENT_AT}] [{DISPLAY.LABELS.AMOUNT}] [{DISPLAY.LABELS.DATE}](YYYY-MM-DD)
                </Text>

                <label style={{display:'flex', justifyContent:'center', width:'100%', cursor:'pointer'}}>
                    <input type='file' accept='.xlsx,.xls' hidden onChange={importFromExcel} />
                    <div style={{ width:'fit-content', padding:`10px ${theme.spacing}`, borderRadius:`calc(${theme.radius} * 2)`, border:`1px solid ${theme.border}`, backgroundColor:theme.cardBg, color:theme.text, fontSize:theme.textSize, fontWeight:500, transition:'0.2s', marginTop:theme.spacing, marginBottom:theme.marginL }}
                        onMouseEnter={(e)=>{
                            e.currentTarget.style.backgroundColor = theme.hoverBg;
                        }}
                        onMouseLeave={(e)=>{
                            e.currentTarget.style.backgroundColor = theme.cardBg;
                        }}
                    >
                        {DISPLAY.BUTTONS.UPLOAD_EXCEL}
                    </div>
                </label>
            </Flex>}

            {showAddMultipleExpenseModal && 
                <AddMultipleExpensesModal onBack={()=> setShowAddMultipleExpenseModal(false) } selectedAccount={selectedAccount} selectedTracker={selectedTracker} categoryData={categoryData} refreshExpenses={refreshExpenses} setRefreshExpenses={setRefreshExpenses} accountDataArray={accountDataArray} setAccountData={setAccountData} quickSaveLogs={quickSaveLogs} setQuickSaveLogs={setQuickSaveLogs} />
            }
        </Popup>
    );
}
