import React, { useState } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { Text, Flex, ButtonGroup, Spacer, Grid } from '@chakra-ui/react'
import { encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import { DeleteIcon } from '@chakra-ui/icons';

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import Dropdown from "../../common-components/form/Dropdown";
import SearchBox from "../../common-components/form/SearchBox";


export default function IncomeTab({trackerData, selectedAccount, accountDataArray, setAccountData, refreshTrackers, setRefreshTrackers, selectedTrackerIndex}) {
    if(!selectedAccount) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, allowIncomeTrackerDeletion} = useAppContext();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newestFirst');

    const [isLoading, setIsLoading] = useState(false);

    const [showDeleteTrackerPopup, setShowDeleteTrackerPopup] = useState(false);
    const [trackerToBeDeleted, setTrackerToBeDeleted] = useState(null);

    const country = BANKS.country[selectedAccount.countryCode];

    const sortOptions = [{
        label: DISPLAY.INCOME_SORT_OPTIONS.NEWSET_FIRST,
        value: 'newestFirst'
    }, {
        label: DISPLAY.INCOME_SORT_OPTIONS.SOURCE_NAME,
        value: 'name'
    }, {
        label: DISPLAY.INCOME_SORT_OPTIONS.AMOUNT_ASC,
        value: 'amountAsc'
    }, {
        label: DISPLAY.INCOME_SORT_OPTIONS.AMOUNT_DESC,
        value: 'amountDesc'
    }];

    const filteredTrackers = trackerData
        .filter(tracker => tracker.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) =>{
            if(sortBy === 'newestFirst'){
                return 0;
            }
            if(sortBy === 'name'){
                return a.name.localeCompare(b.name);
            }
            if(sortBy === 'amountAsc'){
                return a.amount - b.amount;
            }
            if(sortBy === 'amountDesc'){
                return b.amount - a.amount;
            }
            return 0;
        });

    const deleteTracker = async(e) =>{
        if(!trackerToBeDeleted) return;
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
                totalIncome: selectedAccount.totalIncome - Number(trackerToBeDeleted.amount),
                totalExpense: selectedAccount.totalExpense
            };
            const {encryptedData: accountData, nonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/em/trackers/${trackerToBeDeleted.id}`,
                data: { accountData, nonce },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    const updatedAccountForUI = {
                        ...selectedAccount,
                        totalIncome: selectedAccount.totalIncome - Number(trackerToBeDeleted.amount)
                    };
                    setAccountData(accountDataArray.map(account =>{
                            if(account.accountIndex === selectedAccount.accountIndex){
                                return updatedAccountForUI;
                            }
                            return account;
                        })
                    );
                    setRefreshTrackers(!refreshTrackers);
                    setTrackerToBeDeleted(null);
                    setShowDeleteTrackerPopup(false);
                },
                onError: (err) =>{
                    setTrackerToBeDeleted(null);
                    setShowDeleteTrackerPopup(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }


    return (
        <>
            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.marginL} marginTop={theme.spacing}>
                {/* Search by Tracker Name */}
                <div style={{marginBottom: '-10px', marginTop: '-10px'}}>
                    <SearchBox placeholder={DISPLAY.LABELS.SEARCH_INCOME} name='searchQuery' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} maxLen={100} />
                </div>
                {/* Sorting Dropdown */}
                <div style={{marginBottom: '-10px', marginTop: '-10px'}}>
                    <Dropdown value={sortBy} onChange={(e)=> setSortBy(e.target.value)} options={sortOptions} />
                </div>
            </Grid>

            {
                filteredTrackers.length === 0 &&
                <div style={{width:'100%', display:'flex', marginTop:theme.spacing, justifyContent:'center'}}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                        {DISPLAY.TEXT.NO_DATA}
                    </Text>
                </div>
            }

            <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} alignItems='start'>
                {
                    filteredTrackers.map((tracker)=>(
                        <div key={tracker.id} style={{backgroundColor: theme.cardBg, border: `1px solid ${tracker.trackerIndex === selectedTrackerIndex ? theme.primary : theme.border}`, borderRadius: `calc(${theme.radius} * 2)`, padding: theme.paddingL}}>
                            <Flex justify='space-between' align='center'>
                                <div>
                                    <Text color={theme.textSecondary} fontSize={theme.textSize}>
                                        {tracker.name}
                                    </Text>
                                    <Text color={theme.text} fontSize={theme.text} fontWeight={600}>
                                        {country.currency.symbol} {tracker.amount?.toLocaleString(country.locale)}
                                    </Text>
                                </div>
                                {allowIncomeTrackerDeletion && <CircleIconButton icon={<DeleteIcon />} onClick={()=> { setTrackerToBeDeleted(tracker); setShowDeleteTrackerPopup(true); }} tooltip={DISPLAY.TOOLTIPS.DELETE}/> }
                            </Flex>
                        </div>
                    ))
                }
                <div style={{height: '140px'}}></div>
            </Grid>

            {/* Delete Tracker Popup */}
            <Popup isOpen={showDeleteTrackerPopup && allowIncomeTrackerDeletion} onClose={()=> setShowDeleteTrackerPopup(false)} title={DISPLAY.TEXT.DELETE_INCOME} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.COMFIRM_DELETE_INCOME}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteTrackerPopup(false)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteTracker} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                </ButtonGroup>
            </Popup>
        </>
    );
}
