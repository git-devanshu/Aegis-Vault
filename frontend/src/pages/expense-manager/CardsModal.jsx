import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { CATEGORY_ICONS } from '../../assets/categoryIcons';
import { Divider, Text, Flex, ButtonGroup, Spacer, Grid, Box } from '@chakra-ui/react'
import { encryptData } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { getCategoryDisplayName, getCategoryMap, getLatestBillingDate } from "../../utility/helpers";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import { AddIcon, ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import { MdAddCard, MdCreditCard, MdOutlineCreditCardOff, MdPayments } from "react-icons/md";
import { GoCheckCircle } from "react-icons/go";
import { PiWarning, PiCardholder } from "react-icons/pi";

import CreditCardsCarousel from "../../common-components/vault/CreditCardsCarousel";
import ActionButton from "../../common-components/form/ActionButton";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import SearchBox from "../../common-components/form/SearchBox";
import SwitchCreditCardPopup from "../../common-components/popup/SwitchCreditCardPopup";
import AddNewCreditCardPopup from "../../common-components/popup/AddNewCreditCardPopup";
import Popup from "../../common-components/popup/Popup";
import ManageCreditCardsPopup from "../../common-components/popup/ManageCreditCardsPopup";
import AddSpendingPopup from "../../common-components/popup/AddSpendingPopup";
import PayCreditCardBillPopup from "../../common-components/popup/PayCreditCardBillPopup";


export default function CardsModal({creditCardData, spendingData, selectedAccount, selectedCreditCard, categoryData, refreshCreditCards, setRefreshCreditCards, refreshSpendings, setRefreshSpendings, onBack, selectedCCIndex, setSelectedCCIndex, trackerDataOptions, setAccountData, accountDataArray}) {
    if(!selectedAccount || !selectedCreditCard) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];

    const [showOnlyUnpaidExpenses, setShowOnlyUnpaidExpenses] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showSwitchCardPopup, setShowSwitchCardPopup] = useState(false);
    const [showAddNewCardPopup, setShowAddNewCardPopup] = useState(false);
    const [showDeleteCardPopup, setShowDeleteCardPopup] = useState(false);
    const [showManageCardPopup, setShowManageCardPopup] = useState(false);

    const [showAddSpendingPopup, setShowAddSpendingPopup] = useState(false);
    const [showDeleteSpendingPopup, setShowDeleteSpendingPopup] = useState(false);
    const [showPayBillPopup, setShowPayBillPopup] = useState(false);

    const [spendingIDToBeDeleted, setSpendingIDToBeDeleted] = useState(null);

    const filteredExpenses = useMemo(()=>{
        var allSpendings = spendingData;
        if(showOnlyUnpaidExpenses){
            allSpendings = [...spendingData].filter(expense => expense.paymentDue);
        }
        const q = searchQuery.trim().toLowerCase();
        return [...allSpendings].filter(expense =>
                expense.spentAt.toLowerCase().includes(q)
            ).sort((a, b)=>
                new Date(b.spentDate) - new Date(a.spentDate)
            );
    }, [spendingData, searchQuery, showOnlyUnpaidExpenses]);

    const categoryMap = useMemo(()=> getCategoryMap(categoryData), [categoryData]);

    const billingCycle = useMemo(()=> getLatestBillingDate(selectedCreditCard.billingDate), [selectedCreditCard]);

    const totalAmountDue = useMemo(()=> {
        return [...spendingData].reduce((sum, expense)=> sum + (expense.paymentDue ? expense.amount : 0), 0);
    }, [selectedCreditCard, spendingData]);

    const getCategoryIcon = (category) =>{
        return CATEGORY_ICONS[category.icon];
    }

    const filterPaymentDueExpenses = (e) =>{
        setShowOnlyUnpaidExpenses(prev => !prev);
    }

    const deleteCreditCard = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        const cardId = selectedCreditCard.id;
        await apiRequest({
            method: 'DELETE',
            endpoint: `/api/em/credit-card/${cardId}`,
            toastId,
            setIsLoading,
            onSuccess: (res) =>{
                setRefreshCreditCards(!refreshCreditCards);
                setShowDeleteCardPopup(false);
                onBack();
            },
            onError: (err) =>{
                setShowDeleteCardPopup(false);
                onBack();
            }
        });
    }

    const deleteSpending = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        await apiRequest({
            method: 'DELETE',
            endpoint: `/api/em/credit-card-spendings/${spendingIDToBeDeleted}`,
            toastId,
            setIsLoading,
            onSuccess: (res) =>{
                setRefreshSpendings(!refreshSpendings);
                setShowDeleteSpendingPopup(false);
            },
            onError: (err) =>{
                setShowDeleteSpendingPopup(false);
            }
        });
    }

    const ExpenseCard = ({expense}) =>{
        const category = categoryMap[expense.categoryIndex];
        const Icon = getCategoryIcon(category);
        return (
            <div style={{ backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 2)`, overflow:'hidden' }}>
                <Flex align='center' gap={theme.paddingL} padding={theme.paddingL} backgroundColor={theme.hoverBg}>
                    <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600}>
                        {country.currency.symbol} {expense.amount}
                    </Text>
                    <Spacer/>
                    {expense.paymentDue ? <PiWarning color={theme.warning} size='22px' /> : <GoCheckCircle color={theme.success} size='22px' />}
                    <Icon color={theme.text} size='20px' style={{marginRight: theme.marginL}}/>
                </Flex>

                <div style={{borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, padding: `${theme.paddingS} ${theme.paddingL}`}}>
                    <Text color={theme.text} fontSize={theme.textSize}>{expense.cardUsed}</Text>
                </div>

                <div style={{padding: theme.paddingL, paddingTop: theme.paddingS}}>
                    <Flex align='center' justify='space-between'>
                        <div>
                            <Text color={theme.text} fontSize={theme.textSize}>
                                {expense.spentAt}
                            </Text>
                            <Text color={theme.textSecondary} fontWeight={500} fontSize={theme.smallTextSize} backgroundColor={theme.hoverBg} padding='0 6px' borderRadius='4px' marginTop='3px' width='fit-content'>
                                {new Date(expense.spentDate).toLocaleDateString(country.locale)}
                            </Text>
                        </div>
                        {true && 
                            <div style={{marginTop: theme.marginL}}>
                                <CircleIconButton icon={<DeleteIcon />} onClick={()=> { setSpendingIDToBeDeleted(expense.id); setShowDeleteSpendingPopup(true); }} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                            </div>
                        }
                    </Flex>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <MdCreditCard color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.CARDS}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width: 'fit-content'}}/>
            </Flex>

            <Divider borderColor={theme.border} borderWidth='1px' />

            <Grid templateColumns={{base:'1fr', md:'1fr 2fr'}} gap={theme.marginL} marginTop={theme.spacing} alignItems='start'>
                <CreditCardsCarousel cardsData={selectedCreditCard.cardsData} />

                <div>
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} alignItems='start'>
                        <Box border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} padding={theme.paddingL}>
                            <Flex justifyContent='space-between' alignItems='center'>
                                <Text color={theme.textSecondary} fontSize={theme.textSize}>{DISPLAY.TEXT.BILLING_CYCLE}</Text>
                                <Text color={theme.text} fontSize={theme.textSize}>{new Date(billingCycle).toLocaleDateString(country.locale)}</Text>
                            </Flex>
                            <Flex justifyContent='space-between' alignItems='center'>
                                <Text color={theme.textSecondary} fontSize={theme.textSize}>{DISPLAY.TEXT.CREDIT_LIMIT}</Text>
                                <Text color={theme.text} fontSize={theme.textSize}>{country.currency.symbol} {selectedCreditCard.spendingLimit.toLocaleString(country.locale)}</Text>
                            </Flex>
                            <Flex justifyContent='space-between' alignItems='center'>
                                <Text color={totalAmountDue ? theme.warning : theme.success} fontSize={theme.textSize} fontWeight={500}>{DISPLAY.TEXT.OUTSTANDING_AMOUNT}</Text>
                                <Text color={totalAmountDue ? theme.warning : theme.success} fontSize={theme.textSize} fontWeight={500}>{country.currency.symbol} {totalAmountDue.toLocaleString(country.locale)}</Text>
                            </Flex>
                        </Box>
                        
                        <Box>
                            <Flex gap={theme.paddingL} justifyContent='center'>
                                <CircleIconButton icon={<PiCardholder/>} iconSize="19px" sidebarIconSize='24px' tooltip={DISPLAY.TOOLTIPS.SWITCH_CARD} ttPlacement="bottom" onClick={()=> setShowSwitchCardPopup(true)} />
                                <CircleIconButton icon={<MdCreditCard/>} iconSize="18px" sidebarIconSize='24px' tooltip={DISPLAY.TOOLTIPS.MANAGE_CARD} ttPlacement="bottom" onClick={()=> setShowManageCardPopup(true)} />
                                <CircleIconButton icon={<MdOutlineCreditCardOff/>} iconSize="18px" sidebarIconSize='24px' tooltip={DISPLAY.TOOLTIPS.DELETE_CURRENT_CARD} ttPlacement="bottom" onClick={()=> setShowDeleteCardPopup(true)} />
                                <CircleIconButton icon={<MdAddCard/>} iconSize="18px" sidebarIconSize='24px' tooltip={DISPLAY.TOOLTIPS.ADD_NEW_CARD} ttPlacement="bottom" onClick={()=> setShowAddNewCardPopup(true)} />
                                <CircleIconButton icon={<MdPayments/>} iconSize="19px" sidebarIconSize='24px' tooltip={DISPLAY.TOOLTIPS.PAY_BILL} ttPlacement="bottom" onClick={()=> setShowPayBillPopup(true)} />
                                <CircleIconButton icon={<AddIcon/>} iconSize="18px" sidebarIconSize='24px' tooltip={DISPLAY.TOOLTIPS.ADD_SPENDING} ttPlacement="bottom" actionType='primary' onClick={()=> setShowAddSpendingPopup(true)} />
                                <CircleIconButton icon={showOnlyUnpaidExpenses ? <GoCheckCircle color={theme.success}/> : <PiWarning color={theme.warning}/>} iconSize="18px" sidebarIconSize='24px' tooltip={showOnlyUnpaidExpenses ? DISPLAY.TOOLTIPS.SHOW_ALL : DISPLAY.TOOLTIPS.SHOW_ONLY_UNPAID} ttPlacement="bottom" onClick={filterPaymentDueExpenses} />
                            </Flex>
                            
                            <Flex alignItems='center' gap={theme.paddingL}>
                                <div style={{width:'100%', marginBottom:'-10px'}}>
                                    <SearchBox placeholder={DISPLAY.LABELS.SEARCH_EXPENSE} name='searchQuery' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} maxLen={100} />
                                </div>
                            </Flex>
                            
                        </Box>
                    </Grid>

                    {/* No Spendings */}
                    {filteredExpenses.length === 0 &&
                        <div style={{width:'100%', display:'flex', marginTop:theme.spacing, justifyContent:'center'}}>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                                {DISPLAY.TEXT.NO_DATA}
                            </Text>
                        </div>
                    }

                    {/* Spendings */}
                    <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} alignItems='start'>
                        {filteredExpenses?.map((expense, index)=> 
                            <ExpenseCard expense={expense} key={index}/>
                        )}
                    </Grid>
                </div>
            </Grid>
        </div>
        </div>
        
        {/* Switch Credit Card Popup */}
        <SwitchCreditCardPopup creditCardData={creditCardData} showSwitchCardPopup={showSwitchCardPopup} setShowSwitchCardPopup={setShowSwitchCardPopup} selectedCCIndex={selectedCCIndex} setSelectedCCIndex={setSelectedCCIndex} />

        {/* Add New Credit Card Popup */}
        <AddNewCreditCardPopup showAddNewCardPopup={showAddNewCardPopup} setShowAddNewCardPopup={setShowAddNewCardPopup} refreshCreditCards={refreshCreditCards} setRefreshCreditCards={setRefreshCreditCards} selectedAccount={selectedAccount} />

        {/* Manage Credit Card Popup */}
        <ManageCreditCardsPopup showManageCardPopup={showManageCardPopup} setShowManageCardPopup={setShowManageCardPopup} refreshCreditCards={refreshCreditCards} setRefreshCreditCards={setRefreshCreditCards} selectedAccount={selectedAccount} selectedCreditCard={selectedCreditCard} />

        {/* Delete Selected Credit Card Popup */}
        <Popup isOpen={showDeleteCardPopup} onClose={()=> setShowDeleteCardPopup(false)} title={DISPLAY.TEXT.DELETE_CARD} borderColor={theme.warning}>
            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                {DISPLAY.TEXT.CONFIRM_DELETE_CARD}
            </Text>
            <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteCardPopup(false)} disabled={isLoading} />
                <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteCreditCard} isLoading={isLoading} disabled={isLoading} actionType='primary' />
            </ButtonGroup>
        </Popup>

        {/* Add Spending Popup */}
        <AddSpendingPopup showAddSpendingPopup={showAddSpendingPopup} setShowAddSpendingPopup={setShowAddSpendingPopup} selectedCreditCard={selectedCreditCard} refreshSpendings={refreshSpendings} setRefreshSpendings={setRefreshSpendings} categoryData={categoryData} />

        {/* Delete Spending Popup */}
        <Popup isOpen={showDeleteSpendingPopup} onClose={()=> setShowDeleteSpendingPopup(false)} title={DISPLAY.TEXT.DELETE_SPENDING} borderColor={theme.warning}>
            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                {DISPLAY.TEXT.CONFIRM_DELETE_SPENDING}
            </Text>
            <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteSpendingPopup(false)} disabled={isLoading} />
                <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteSpending} isLoading={isLoading} disabled={isLoading} actionType='primary' />
            </ButtonGroup>
        </Popup>

        {/* Pay Credit Card Bill Popup */}
        <PayCreditCardBillPopup showPayBillPopup={showPayBillPopup} setShowPayBillPopup={setShowPayBillPopup} selectedAccount={selectedAccount} spendingData={spendingData} trackerDataOptions={trackerDataOptions} totalAmountDue={totalAmountDue} refreshSpendings={refreshSpendings} setRefreshSpendings={setRefreshSpendings} setAccountData={setAccountData} accountDataArray={accountDataArray} />

        </>
    );
}
