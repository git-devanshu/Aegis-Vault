import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { getCategoryDisplayName } from '../../utility/helpers';
import * as XLSX from 'xlsx';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';
import AddMultipleExpensesModal from '../../pages/expense-manager/AddMultipleExpensesModal';
import TabGroup from '../navbar/TabGroup';
import { Divider, Flex, Text } from '@chakra-ui/react';
import AddMultipleSpendingModal from '../../pages/expense-manager/AddMultipleSpendingModal';


export default function AddSpendingPopup({showAddSpendingPopup, setShowAddSpendingPopup, selectedCreditCard, refreshSpendings, setRefreshSpendings, categoryData}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [spending, setSpending] = useState({
        amount: 0,
        spentAt: '',
        spentDate: new Date().toLocaleDateString('en-CA'),
        cardUsed: `${selectedCreditCard.cardsData[0].cardName} - ${selectedCreditCard.cardsData[0].network}`
    });
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const tabs = [DISPLAY.LABELS.FILL_DETAILS, DISPLAY.LABELS.IMPORT];
    const [selectedTab, setSelectedTab] = useState(0);

    const [quickSaveLogs, setQuickSaveLogs] = useState([]);
    const [savedExpenses, setSavedExpenses] = useState({});
    const [expenseGroups, setExpenseGroups] = useState([]);
    const [selectedExpenseGroupIndex, setSelectedExpenseGroupIndex] = useState("");
    const [showAddMultipleSpendingModal, setShowAddMultipleSpendingModal] = useState(false);
    const [isQuickSaveImport, setIsQuickSaveImport] = useState(false);

    const handleChange = (e) =>{
        setSpending({
            ...spending,
            [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
        });
    }

    useEffect(() => {
        if (!showAddSpendingPopup || selectedTab !== 1) return;
        const groups = JSON.parse(localStorage.getItem("aegis-quicksave-groups")) || [];
        const expenses = JSON.parse(localStorage.getItem("aegis-saved-expenses")) || {};
    
        setExpenseGroups(groups);
        setSavedExpenses(expenses);
        setSelectedExpenseGroupIndex(prev =>
            prev !== "" && Number(prev) < groups.length ? prev : groups.length ? "0" : ""
        );
    }, [showAddSpendingPopup, selectedTab]);

    const selectedGroupExpenses = selectedExpenseGroupIndex !== "" ? savedExpenses[selectedExpenseGroupIndex] || [] : [];

    const resetSpending = () =>{
        setSpending({
            ...spending,
            amount: 0,
            spentAt: ''
        })
    }

    const addSpending = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const {encryptedData: spendingData, nonce} = await encryptData(JSON.stringify(spending), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/credit-card-spendings',
                data: {
                    accountIndex: selectedCreditCard.accountIndex,
                    ccIndex: selectedCreditCard.ccIndex,
                    categoryIndex: selectedCategoryIndex,
                    spendingData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshSpendings(!refreshSpendings);
                    setShowAddSpendingPopup(false);
                    resetSpending();
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    const importFromQuickSave = () => {
        if (selectedGroupExpenses.length === 0) return;
        setQuickSaveLogs(selectedGroupExpenses.map(expense => ({
            ...expense,
            categoryIndex: 0,
            cardUsed: `${selectedCreditCard.cardsData[0].cardName} - ${selectedCreditCard.cardsData[0].network}`
        })));
        setIsQuickSaveImport(true);
        setShowAddMultipleSpendingModal(true);
    };

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
                    spentAt: String(row['SpentAt'] || '').trim(),
                    amount: Number(row['Amount']) || 0,
                    spentDate: row['Date'] 
                        ? new Date(row['Date']).toLocaleDateString('en-CA')
                        : new Date().toLocaleDateString('en-CA'),
                    categoryIndex: 0
                }))
                .filter(log =>
                    log.spentAt.length > 0 &&
                    log.amount > 0
                );
            setQuickSaveLogs(formattedLogs.map(expense => ({
                ...expense,
                cardUsed: `${selectedCreditCard.cardsData[0].cardName} - ${selectedCreditCard.cardsData[0].network}`
            })));
            
            setIsQuickSaveImport(false);
            setShowAddMultipleSpendingModal(true);
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR);
        }
    }

    return (
        <Popup isOpen={showAddSpendingPopup} onClose={()=> { resetSpending(); setShowAddSpendingPopup(false); }} title={DISPLAY.TEXT.ADD_SPENDING} bg={theme.bg} borderColor={theme.success}>
            <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>
            
            {/* Fill Details */}
            {selectedTab === 0 && <form style={{marginTop: theme.spacing}}>
                <Dropdown value={spending.cardUsed} onChange={(e)=> setSpending({...spending, cardUsed: e.target.value})}
                    options={selectedCreditCard.cardsData.map(
                        (card)=>({
                            label: `${card.cardName} - ${card.network}`,
                            value: `${card.cardName} - ${card.network}`
                        })
                    )}
                />

                <DateInput value={spending.spentDate} name='spentDate' onChange={handleChange} label={DISPLAY.LABELS.SPENT_DATE} />

                <div style={{marginTop: '-20px'}}>
                    <Dropdown value={selectedCategoryIndex} onChange={(e)=> setSelectedCategoryIndex(Number(e.target.value))}
                        options={categoryData.map(
                            (category)=>({
                                label: getCategoryDisplayName(category, DISPLAY),
                                value: category.categoryIndex
                            })
                        )}
                    />
                </div>

                <InputBox type='text' label={DISPLAY.LABELS.SPENT_AT} name='spentAt' value={spending.spentAt} onChange={handleChange} required maxLen={50} />
                <InputBox type='number' label={DISPLAY.LABELS.AMOUNT} name='amount' value={spending.amount} onChange={handleChange} required min={0} />

                <ActionButton name={DISPLAY.BUTTONS.ADD_SPENDING} actionType='primary' isLoading={isLoading} disabled={isLoading || spending.amount <= 0} onClick={addSpending} customStyle={{marginBottom: theme.marginS}} />
            </form>}

            {/* Import */}
            {selectedTab === 1 && <Flex alignItems='center' direction='column' style={{marginTop: theme.spacing, minHeight: '370px'}}>
                <div style={{width: '70%'}}>
                    <Dropdown
                        value={selectedExpenseGroupIndex}
                        onChange={e => setSelectedExpenseGroupIndex(e.target.value)}
                        options={expenseGroups.map((group, index) => ({
                            label: group,
                            value: String(index)
                        }))}
                        placeholder={DISPLAY.TEXT.EXPENSE_GROUPS}
                    />
                </div>
                <Text color={theme.text} fontSize={theme.textSize} align='center' marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.QUICKSAVE_EXPENSE_COUNT}: {selectedGroupExpenses.length}
                </Text>
                <ActionButton onClick={importFromQuickSave} name={DISPLAY.BUTTONS.IMPORT_FROM_QUICKSAVE} disabled={selectedGroupExpenses.length === 0} actionType='primary' customStyle={{width: 'fit-content', marginTop: theme.marginL, marginBottom: theme.spacing}} />

                <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} marginBottom={theme.marginL}/>

                <Text color={theme.text} fontSize={theme.textSize} align='center' marginTop={theme.marginL}>{DISPLAY.TEXT.EXCEL_UPLOAD_INFO}:</Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} align='center' marginTop={theme.marginS} marginBottom={theme.marginL}>
                    [SpentAt] [Amount] [Date](YYYY-MM-DD)
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

            {showAddMultipleSpendingModal && (
                <AddMultipleSpendingModal onBack={() => setShowAddMultipleSpendingModal(false)} selectedCreditCard={selectedCreditCard} categoryData={categoryData} refreshSpendings={refreshSpendings} setRefreshSpendings={setRefreshSpendings} quickSaveLogs={quickSaveLogs} setQuickSaveLogs={setQuickSaveLogs} selectedExpenseGroupIndex={selectedExpenseGroupIndex} isQuickSaveImport={isQuickSaveImport} setSavedExpenses={setSavedExpenses} />
            )}
        </Popup>
    );
}
