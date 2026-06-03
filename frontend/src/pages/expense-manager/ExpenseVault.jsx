import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import SYSTEM_DATA from '../../assets/system-data.json'
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import { Divider, Text, Flex, Stack, useMediaQuery, ButtonGroup, Spacer, Grid } from '@chakra-ui/react'
import { createHash, createPassKey, decryptData, encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useClearOnUnmount from '../../hooks/useClearOnUnmount';

import { ArrowBackIcon, AddIcon, LockIcon, EditIcon, CloseIcon } from '@chakra-ui/icons';
import { MdRefresh, MdAutoGraph, MdOutlineSettingsBackupRestore } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import { PiChartDonut } from "react-icons/pi";
import { TbMoneybagPlus } from "react-icons/tb";
import { RiBubbleChartLine } from "react-icons/ri";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import AppLayout from "../../common-components/AppLayout";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Loading from "../../common-components/Loading";
import PinModal from "../../common-components/PinModal";
import TabGroup from "../../common-components/navbar/TabGroup";
import Dropdown from "../../common-components/form/Dropdown";
import PasswordCard from "../../common-components/vault/PasswordCard";
import AddEditPasswordPopup from "../../common-components/popup/AddEditPasswordPopup";
import AddBankAccountModal from "./AddBankAccountModal";
import BankAccountCard from "../../common-components/widgets/BankAccountCard";
import ManageBankAccountsModal from "./ManageBankAccountsModal";
import AddTrackerPopup from "../../common-components/popup/AddTrackerPopup";
import AddExpensePopup from "../../common-components/popup/AddExpensePopup";
import IncomeTab from "./IncomeTab";
import ExpenseTab from "./ExpenseTab";
import ExpenseAnalyticsModal from "./ExpenseAnalyticsModal";
import CategoryTab from "./CategoryTab";


export default function ExpenseVault() {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, clearMasterKey, hideDeleteExpenseButton, hideInvestments} = useAppContext();
    const navigate = useNavigate();

    const [accountData, setAccountData] = useState(null);
    const [trackerData, setTrackerData] = useState(null);
    const [expenseData, setExpenseData] = useState(null);
    const [categoryData, setCategoryData] = useState(null);

    const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
    const [selectedTrackerIndex, setSelectedTrackerIndex] = useState(null);

    const [refreshAccounts, setRefreshAccounts] = useState(false);
    const [refreshTrackers, setRefreshTrackers] = useState(false);
    const [refreshExpenses, setRefreshExpenses] = useState(false);
    const [refreshCategories, setRefreshCategories] = useState(false);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // use this to disable buttons not to show <Loading/>

    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [DISPLAY.LABELS.INCOME, DISPLAY.LABELS.EXPENSES, DISPLAY.LABELS.CATEGORIES];

    const [showManageAccountModal, setShowManageAccountModal] = useState(false);
    const [showAddTrackerPopup, setShowAddTrackerPopup] = useState(false);
    const [showAddExpensePopup, setShowAddExpensePopup] = useState(false);
    const [showAddCategoryPopup, setShowAddCategoryPopup] = useState(false);
    const [showExpenseAnalytics, setShowExpenseAnalytics] = useState(false);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);

    // for fetching accounts data
    useEffect(() =>{
        if(!masterKey) return;
        setSelectedTrackerIndex(null);
        async function fetchAccountData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/al/accounts',
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedAccounts = [];
                    for(const val of res?.data?.accounts){
                        const decryptedData = JSON.parse(await decryptData(val.accountData, val.nonce, masterKey));
                        decryptedData.accountIndex = val.accountIndex;
                        decryptedData.id = val._id;
                        decryptedAccounts.push(decryptedData);
                    }
                    setAccountData(decryptedAccounts);
                    if(decryptedAccounts.length){
                        setSelectedAccountIndex(decryptedAccounts[0].accountIndex);
                    }
                    else{
                        setSelectedAccountIndex(null);
                        setTrackerData([]);
                        setExpenseData([]);
                    }
                },
                onError: (err)=> {
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchAccountData();
    }, [refreshAccounts, masterKey]);

    // for fetching tracker data
    useEffect(() =>{
        if(!masterKey || selectedAccountIndex === null) return;
        async function fetchTrackerData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/em/trackers/${selectedAccountIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedTrackers = [];
                    for(const val of res?.data?.trackerData){
                        const decryptedTrackerData = JSON.parse(await decryptData(val.trackerData, val.trackerDataNonce, masterKey));
                        const decryptedLimitsData = JSON.parse(await decryptData(val.limitsData, val.limitsDataNonce, masterKey));
                        decryptedTrackerData.limitsData = decryptedLimitsData;
                        decryptedTrackerData.trackerIndex = val.trackerIndex;
                        decryptedTrackerData.id = val._id;
                        decryptedTrackers.push(decryptedTrackerData);
                    }
                    setTrackerData(decryptedTrackers);
                    if(decryptedTrackers.length){
                        setSelectedTrackerIndex(decryptedTrackers[0].trackerIndex);
                    }
                    else{
                        setSelectedTrackerIndex(null);
                        setExpenseData([]);
                    }
                },
                onError: (err)=> {
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchTrackerData();
    }, [refreshTrackers, selectedAccountIndex, masterKey]);

    // for fetching expense data
    useEffect(() =>{
        if(!masterKey || selectedAccountIndex === null || selectedTrackerIndex === null) return;
        async function fetchExpenseData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/em/expenses/${selectedTrackerIndex}/${selectedAccountIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedExpenses = [];
                    for(const val of res?.data?.expenseData){
                        const decryptedExpenseData = JSON.parse(await decryptData(val.expenseData, val.nonce, masterKey));
                        decryptedExpenseData.trackerIndex = val.trackerIndex;
                        decryptedExpenseData.accountIndex = val.accountIndex;
                        decryptedExpenseData.categoryIndex = val.categoryIndex;
                        decryptedExpenseData.id = val._id;
                        decryptedExpenses.push(decryptedExpenseData);
                    }
                    setExpenseData(decryptedExpenses);
                },
                onError: (err)=> {
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchExpenseData();
    }, [refreshExpenses, selectedTrackerIndex, selectedAccountIndex, masterKey]);

    // for fetching custom category data
    useEffect(() =>{
        if(!masterKey) return;
        async function fetchCategoryData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: '/api/em/categories',
                setIsLoading,
                onSuccess: async(res) =>{
                    var decryptedCategoryData = [];
                    if(res?.data?.categoryData?.categoryData){
                        decryptedCategoryData = JSON.parse(await decryptData(res.data.categoryData.categoryData, res.data.categoryData.nonce, masterKey));
                    }
                    setCategoryData([...SYSTEM_DATA.DEFAULT_EXPENSE_CATEGORIES, ...decryptedCategoryData]);
                },
                onError: (err)=> {
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchCategoryData();
    }, [refreshCategories, masterKey]);

    const refreshPage = (e) =>{
        setRefreshAccounts(!refreshAccounts);
        setRefreshTrackers(!refreshTrackers);
        setRefreshExpenses(!refreshExpenses);
        setRefreshCategories(!refreshCategories);
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!accountData){
        return <Loading data={DISPLAY.TEXT.BANK_ACCOUNTS} error={error}/>
    }

    if(!trackerData){
        return <Loading data={DISPLAY.TEXT.TRACKER_DATA} error={error}/>
    }

    if(!expenseData){
        return <Loading data={DISPLAY.TEXT.EXPENSE_DATA} error={error}/>
    }

    if(!categoryData){
        return <Loading data={DISPLAY.TEXT.CATEGORIES} error={error}/>
    }

    if(accountData.length === 0){
        return <AddBankAccountModal onBack={()=> navigate('/home')} refreshAccounts={refreshAccounts} setRefreshAccounts={setRefreshAccounts}/>
    }

    const sidebar = (
        <Flex align='center' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<MdRefresh/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.REFRESH} ttPlacement="right" onClick={refreshPage}/>
            <CircleIconButton icon={<TbMoneybagPlus/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.ADD_TRACKER} ttPlacement="right" onClick={()=> setShowAddTrackerPopup(true)}/>
            <CircleIconButton icon={<AddIcon/>} tooltip={DISPLAY.TOOLTIPS.ADD_EXPENSE} ttPlacement="right" onClick={()=> setShowAddExpensePopup(true)} actionType='primary' />
            <CircleIconButton icon={<RiBubbleChartLine/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.ANALYTICS} ttPlacement="right" onClick={()=> setShowExpenseAnalytics(true) }/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.LEARN_MORE} ttPlacement="right" onClick={()=>{}}/>
        </Flex>
    );

    const selectedAccount = accountData.find(account =>
        account.accountIndex === selectedAccountIndex
    );

    const selectedTracker = trackerData.find(tracker =>
        tracker.trackerIndex === selectedTrackerIndex
    );

    const trackerDataOptions = trackerData.map(tracker =>({
        label: tracker.name,
        value: tracker.trackerIndex
    }));

    return (
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <GiMoneyStack color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.EXPENSE_MANAGER}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/home')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>
                <Grid templateColumns={{base:'1fr', md:'1fr 2fr'}} width='100%' gap={theme.paddingL}>
                    {/* Account Details */}
                    <BankAccountCard account={selectedAccount} setShowManageAccountModal={setShowManageAccountModal}/>

                    <div>
                        <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>
                        {/* Income (Trackers) */}
                        {selectedTab === 0 && 
                            <IncomeTab trackerData={trackerData} selectedAccount={selectedAccount} accountDataArray={accountData} setAccountData={setAccountData} refreshTrackers={refreshTrackers} setRefreshTrackers={setRefreshTrackers} />
                        }
                        {/* Expenses */}
                        {selectedTab === 1 && 
                            <ExpenseTab expenseData={expenseData} trackerData={trackerData} selectedAccount={selectedAccount} selectedTrackerIndex={selectedTrackerIndex} setSelectedTrackerIndex={setSelectedTrackerIndex} categoryData={categoryData} accountDataArray={accountData} setAccountData={setAccountData} refreshExpenses={refreshExpenses} setRefreshExpenses={setRefreshExpenses} trackerDataOptions={trackerDataOptions}/>
                        }
                        {/* Categories */}
                        {selectedTab === 2 && 
                            <CategoryTab expenseData={expenseData} selectedTracker={selectedTracker} selectedAccount={selectedAccount} selectedTrackerIndex={selectedTrackerIndex} setSelectedTrackerIndex={setSelectedTrackerIndex} categoryData={categoryData} accountDataArray={accountData} setAccountData={setAccountData} refreshCategories={refreshCategories} setRefreshCategories={setRefreshCategories} trackerDataOptions={trackerDataOptions} refreshTrackers={refreshTrackers} setRefreshTrackers={setRefreshTrackers}/>
                        }
                    </div>
                </Grid>
            </AppLayout>

            {/* Manage Bank Accounts Modal */}
            {showManageAccountModal && <ManageBankAccountsModal accountData={accountData} onBack={()=> setShowManageAccountModal(false)} setSelectedAccountIndex={setSelectedAccountIndex} refreshAccounts={refreshAccounts} setRefreshAccounts={setRefreshAccounts}/>}

            {/* Add Income Tracker Popup */}
            <AddTrackerPopup isOpen={showAddTrackerPopup} onClose={setShowAddTrackerPopup} selectedAccount={selectedAccount} refreshTracker={refreshTrackers} setRefreshTracker={setRefreshTrackers} accountDataArray={accountData} setAccountData={setAccountData}/>

            {/* Add Expense Popup */}
            <AddExpensePopup isOpen={showAddExpensePopup} onClose={setShowAddExpensePopup} selectedAccount={selectedAccount} selectedTracker={selectedTracker} categoryData={categoryData} refreshExpenses={refreshExpenses} setRefreshExpenses={setRefreshExpenses} accountDataArray={accountData} setAccountData={setAccountData} />

            {/* Show Analytics Modal */}
            {showExpenseAnalytics && <ExpenseAnalyticsModal onBack={()=> setShowExpenseAnalytics(false)} selectedAccount={selectedAccount} selectedTracker={selectedTracker} expenseData={expenseData} categoryData={categoryData} selectedTrackerIndex={selectedTrackerIndex} setSelectedTrackerIndex={setSelectedTrackerIndex} trackerDataOptions={trackerDataOptions} trackerData={trackerData} setSelectedTab={setSelectedTab} />}
        </div>
    );
}
