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

import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { MdAddchart, MdRefresh } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { GiGoldBar } from "react-icons/gi";
import { TbMoneybagPlus } from "react-icons/tb";
import { RiBubbleChartLine } from "react-icons/ri";

import ActionButton from "../../common-components/form/ActionButton";
import AppLayout from "../../common-components/AppLayout";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Loading from "../../common-components/Loading";
import PinModal from "../../common-components/PinModal";
import TabGroup from "../../common-components/navbar/TabGroup";
import AddBankAccountModal from "../expense-manager/AddBankAccountModal";
import BankAccountCard from "../../common-components/widgets/BankAccountCard";
import ManageBankAccountsModal from "../expense-manager/ManageBankAccountsModal";
import AddDepositPopup from "../../common-components/popup/AddDepositPopup";
import DepositsTab from "./DepositsTab";
import { groupFDData } from "../../utility/investmentCalculators";
import AddHoldingsPopup from "../../common-components/popup/AddHoldingsPopup";
import HoldingsTab from "./HoldingsTab";


export default function InvestmentVault() {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, clearMasterKey} = useAppContext();
    const navigate = useNavigate();

    const [accountData, setAccountData] = useState(null);
    const [fdData, setFDData] = useState(null);
    const [rdData, setRDData] = useState(null);
    const [goldAssetData, setGoldAssetData] = useState(null);
    const [stockData, setStockData] = useState(null);

    const [refreshAccounts, setRefreshAccounts] = useState(false);
    const [refreshFDs, setRefreshFDs] = useState(false);
    const [refreshRDs, setRefreshRDs] = useState(false);
    const [refreshGoldAssets, setRefreshGoldAssets] = useState(false);
    const [refreshStocks, setRefreshStocks] = useState(false);

    const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // use this to disable buttons not to show <Loading/>

    const [selectedTab, setSelectedTab] = useState(0);
    const tabs = [DISPLAY.LABELS.DEPOSITS, DISPLAY.LABELS.HOLDINGS];

    const [showManageAccountModal, setShowManageAccountModal] = useState(false);
    const [showAddDepositPopup, setShowAddDepositPopup] = useState(false);
    const [showAddHoldingsPopup, setShowAddHoldingsPopup] = useState(false);

    // for removing the master key after exiting the module
    useClearOnUnmount(clearMasterKey);


    // for fetching accounts data
    useEffect(() =>{
        if(!masterKey) return;
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


    // for fetching FD data
    useEffect(() =>{
        if(!masterKey || selectedAccountIndex === null) return;
        async function fetchFDData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/im/fd/${selectedAccountIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedFDs = [];
                    for(const val of res?.data?.fdData){
                        const decryptedFDData = JSON.parse(await decryptData(val.fdData, val.nonce, masterKey));
                        decryptedFDData.fdIndex = val.fdIndex;
                        decryptedFDData.status = val.status;
                        decryptedFDData.id = val._id;
                        decryptedFDs.push(decryptedFDData);
                    }
                    setFDData(decryptedFDs);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchFDData();
    }, [refreshFDs, selectedAccountIndex, masterKey]);


    // for fetching RD data
    useEffect(() =>{
        if(!masterKey || selectedAccountIndex === null) return;
        async function fetchRDData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/im/rd/${selectedAccountIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedRDs = [];
                    for(const val of res?.data?.rdData){
                        const decryptedRDData = JSON.parse(await decryptData(val.rdData, val.nonce, masterKey));
                        decryptedRDData.rdIndex = val.rdIndex;
                        decryptedRDData.status = val.status;
                        decryptedRDData.id = val._id;
                        decryptedRDs.push(decryptedRDData);
                    }
                    setRDData(decryptedRDs);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchRDData();
    }, [refreshRDs, selectedAccountIndex, masterKey]);


    // for fetching gold asssets
    useEffect(() =>{
        if(!masterKey || selectedAccountIndex === null) return;
        async function fetchGoldAssetData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/im/gold/${selectedAccountIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedGoldAssets = [];
                    for(const val of res?.data?.goldAssetData){
                        const decryptedAssetData = JSON.parse(await decryptData(val.assetData, val.nonce, masterKey));
                        decryptedAssetData.status = val.status;
                        decryptedAssetData.id = val._id;
                        decryptedGoldAssets.push(decryptedAssetData);
                    }
                    setGoldAssetData(decryptedGoldAssets);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchGoldAssetData();
    }, [refreshGoldAssets, selectedAccountIndex, masterKey]);


    // for fetching stocks
    useEffect(() =>{
        if(!masterKey || selectedAccountIndex === null) return;
        async function fetchStockData(){
            setIsLoading(true);
            await apiRequest({
                method: 'GET',
                endpoint: `/api/im/stocks/${selectedAccountIndex}`,
                setIsLoading,
                onSuccess: async(res) =>{
                    const decryptedStocks = [];
                    for(const val of res?.data?.stockData){
                        const decryptedStockData = JSON.parse(await decryptData(val.stockData, val.nonce, masterKey));
                        decryptedStockData.status = val.status;
                        decryptedStockData.id = val._id;
                        decryptedStocks.push(decryptedStockData);
                    }
                    setStockData(decryptedStocks);
                },
                onError: err =>{
                    setError(err);
                },
                defaultSuccessToast: false
            });
        }
        fetchStockData();
    }, [refreshStocks, selectedAccountIndex, masterKey]);


    const refreshPage = (e) =>{
        setRefreshAccounts(!refreshAccounts);
    }

    if(!masterKey){
        return <PinModal/>
    }

    if(!accountData){
        return <Loading data={DISPLAY.TEXT.BANK_ACCOUNTS} error={error}/>
    }

    if(!fdData){
        return <Loading data={DISPLAY.TEXT.FD_DATA} error={error}/>
    }
    
    if(!rdData){
        return <Loading data={DISPLAY.TEXT.RD_DATA} error={error}/>
    }
    
    if(!goldAssetData){
        return <Loading data={DISPLAY.TEXT.GOLD_ASSET_DATA} error={error}/>
    }
    
    if(!stockData){
        return <Loading data={DISPLAY.TEXT.STOCK_DATA} error={error}/>
    }

    if(accountData.length === 0){
        return <AddBankAccountModal onBack={()=> navigate('/home')} refreshAccounts={refreshAccounts} setRefreshAccounts={setRefreshAccounts}/>
    }

    const sidebar = (
        <Flex align='center' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<MdRefresh/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.REFRESH} ttPlacement="right" onClick={refreshPage}/>
            <CircleIconButton icon={<MdAddchart/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.ADD_HOLDING} ttPlacement="right" onClick={()=> setShowAddHoldingsPopup(true) }/>
            <CircleIconButton icon={<AddIcon/>} tooltip={DISPLAY.TOOLTIPS.ADD_DEPOSIT} ttPlacement="right" onClick={()=> setShowAddDepositPopup(true) } actionType='primary' />
            <CircleIconButton icon={<RiBubbleChartLine/>} iconSize="18px" tooltip={DISPLAY.TOOLTIPS.ANALYTICS} ttPlacement="right" onClick={()=> {} }/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.LEARN_MORE} ttPlacement="right" onClick={()=>{}}/>
        </Flex>
    );

    const selectedAccount = accountData.find(account =>
        account.accountIndex === selectedAccountIndex
    );

    const groupedFDData = groupFDData(fdData || []);

    return (
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <GiGoldBar color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.INVESTMENT_MANAGER}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/home')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>
                <Grid templateColumns={{base:'1fr', md:'1fr 2fr'}} width='100%' gap={theme.paddingL}>
                    {/* Account Details */}
                    <BankAccountCard account={selectedAccount} setShowManageAccountModal={setShowManageAccountModal} showIncomeAndExpense={false} showAccountBalance={false}/>

                    <div>
                        <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>
                        {/* Deposits */}
                        {selectedTab === 0 && 
                            <DepositsTab selectedAccount={selectedAccount} groupedFDData={groupedFDData} refreshFDs={refreshFDs} setRefreshFDs={setRefreshFDs} rdData={rdData} refreshRDs={refreshRDs} setRefreshRDs={setRefreshRDs}/>
                        }
                        {/* Holdings */}
                        {selectedTab === 1 && 
                            <HoldingsTab selectedAccount={selectedAccount} goldAssetData={goldAssetData} refreshGoldAssets={refreshGoldAssets} setRefreshGoldAssets={setRefreshGoldAssets} stockData={stockData} refreshStocks={refreshStocks} setRefreshStocks={setRefreshStocks} />
                        }
                    </div>
                </Grid>
            </AppLayout>

            {/* Manage Bank Accounts Modal */}
            {showManageAccountModal && <ManageBankAccountsModal accountData={accountData} onBack={()=> setShowManageAccountModal(false)} setSelectedAccountIndex={setSelectedAccountIndex} refreshAccounts={refreshAccounts} setRefreshAccounts={setRefreshAccounts}/>}

            {/* Add Deposit Popup */}
            <AddDepositPopup isOpen={showAddDepositPopup} onClose={setShowAddDepositPopup} selectedAccount={selectedAccount} refreshFDs={refreshFDs} setRefreshFDs={setRefreshFDs} refreshRDs={refreshRDs} setRefreshRDs={setRefreshRDs} />

            {/* Add Holding Popup */}
            <AddHoldingsPopup isOpen={showAddHoldingsPopup} onClose={setShowAddHoldingsPopup} selectedAccount={selectedAccount} refreshGoldAssets={refreshGoldAssets} setRefreshGoldAssets={setRefreshGoldAssets} refreshStocks={refreshStocks} setRefreshStocks={setRefreshStocks} />
        </div>
    );
}
