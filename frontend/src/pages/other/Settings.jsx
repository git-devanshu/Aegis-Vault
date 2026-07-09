import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import SYSTEM_DATA from '../../assets/system-data.json';
import { Avatar, Divider, Heading, Text, Spacer, Flex, Stack, useMediaQuery, ButtonGroup } from '@chakra-ui/react'
import { createHash, createPassKey } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { decodeToken, downloadPassKeyFile, getAuthToken, getAuthUser } from '../../utility/helpers';
import useLanguage, { getLanguageIcon, getLanguageName, setLanguage } from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useTheme from "../../hooks/useTheme";

import { LockIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { GiMoneyStack, GiGoldBar } from "react-icons/gi";
import { MdRefresh, MdLockReset, MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { BsCalendarRange } from "react-icons/bs";
import { RiBankLine } from "react-icons/ri";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Popup from "../../common-components/popup/Popup";
import TitleBar from "../../common-components/navbar/TitleBar";
import AppLayout from "../../common-components/AppLayout";
import CircleIconButton from "../../common-components/form/CircleIconButton";
import ToggleSwitch from "../../common-components/form/ToggleSwitch";


export default function Settings() {
    const { name, email } = getAuthUser();
    const {DISPLAY, TOASTS} = useLanguage();
    const {aegisTheme, toggleAegisTheme} = useTheme();
    const {
        userSalt, setUserSalt,
        hideRemovedLabels, setHideRemovedLabels,
        hideShowPasswordButton, setHideShowPasswordButton,
        disablePasswordModifications, setDisablePasswordModifications,
        allowBankAccountDeletion, setAllowBankAccountDeletion,
        allowIncomeTrackerDeletion, setAllowIncomeTrackerDeletion,
        allowExpenseDeletion, setAllowExpenseDeletion,
        allowNewCategoryCreation, setAllowNewCategoryCreation,
        hideAccountSnapshotInAnalytics, setHideAccountSnapshotInAnalytics,
        hideAccountBalanceInCard, setHideAccountBalanceInCard,
        allowFDDeletion, setAllowFDDeletion,
        allowRDDeletion, setAllowRDDeletion,
        allowGoldAssetDeletion, setAllowGoldAssetDeletion,
        allowStockDeletion, setAllowStockDeletion,
        hideClosedFD, setHideClosedFD,
        hideClosedRD, setHideClosedRD,
        hideSoldGoldAssets, setHideSoldGoldAssets,
        hideSoldStocks, setHideSoldStocks,
        disableShoppingListModifications, setDisableShoppingListModifications,
        disableFoodListModifications, setDisableFoodListModifications,
        disableWatchlistModifications, setDisableWatchlistModifications,
        disableReadingListModifications, setDisableReadingListModifications,
        disableWishlistModifications, setDisableWishlistModifications,
        disableTodoListModifications, setDisableTodoListModifications,
        disableTripListModifications, setDisableTripListModifications,
        disableNotepadModifications, setDisableNotepadModifications,
        use12HourClockInSchedule, setUse12HourClockInSchedule,
        disableJournalModifications, setDisableJournalModifications,
        hideWeeklyScheduleItems, setHideWeeklyScheduleItems,
        hideHighPriorityTasks, setHideHighPriorityTasks,
        hideCompletedTasks, setHideCompletedTasks,
        hideHighPriorityNotes, setHideHighPriorityNotes,
        disableNoteModifications, setDisableNoteModifications
    } = useAppContext();

    const navigate = useNavigate();

    const [password, setPassword] = useState('');

    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false); //use this to disable buttons not to show <Loading/>

    const [showLanguageSettingPopup, setShowLanguageSettingPopup] = useState(false);

    useEffect(()=>{
        async function fetchUserSettings(){
            const toastId = validateAndStartLoading({
                loadingMessage: TOASTS.COMMON.LOADING,
                setIsLoading
            });
            await apiRequest({
                method: 'GET',
                endpoint: '/api/config/settings',
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setUserSalt(res?.data?.userSalt);
                    setHideShowPasswordButton(res?.data?.userSettings?.hideShowPasswordButton);
                    setHideRemovedLabels(res?.data?.userSettings?.hideRemovedLabels);
                    setDisablePasswordModifications(res?.data?.userSettings?.disablePasswordModifications);
                    setAllowBankAccountDeletion(res?.data?.userSettings?.allowBankAccountDeletion);
                    setAllowIncomeTrackerDeletion(res?.data?.userSettings?.allowIncomeTrackerDeletion);
                    setAllowExpenseDeletion(res?.data?.userSettings?.allowExpenseDeletion);
                    setAllowNewCategoryCreation(res?.data?.userSettings?.allowNewCategoryCreation);
                    setHideAccountSnapshotInAnalytics(res?.data?.userSettings?.hideAccountSnapshotInAnalytics);
                    
                    setHideAccountBalanceInCard(res?.data?.userSettings?.hideAccountBalanceInCard);
                    setAllowFDDeletion(res?.data?.userSettings?.allowFDDeletion);
                    setAllowRDDeletion(res?.data?.userSettings?.allowRDDeletion);
                    setAllowGoldAssetDeletion(res?.data?.userSettings?.allowGoldAssetDeletion);
                    setAllowStockDeletion(res?.data?.userSettings?.allowStockDeletion);
                    setHideClosedFD(res?.data?.userSettings?.hideClosedFD);
                    setHideClosedRD(res?.data?.userSettings?.hideClosedRD);
                    setHideSoldGoldAssets(res?.data?.userSettings?.hideSoldGoldAssets);
                    setHideSoldStocks(res?.data?.userSettings?.hideSoldStocks);
                    
                    setDisableShoppingListModifications(res?.data?.userSettings?.disableShoppingListModifications);
                    setDisableFoodListModifications(res?.data?.userSettings?.disableFoodListModifications);
                    setDisableWatchlistModifications(res?.data?.userSettings?.disableWatchlistModifications);
                    setDisableReadingListModifications(res?.data?.userSettings?.disableReadingListModifications);
                    setDisableWishlistModifications(res?.data?.userSettings?.disableWishlistModifications);
                    setDisableTodoListModifications(res?.data?.userSettings?.disableTodoListModifications);
                    setDisableTripListModifications(res?.data?.userSettings?.disableTripListModifications);
                    setDisableNotepadModifications(res?.data?.userSettings?.disableNotepadModifications);
                    setUse12HourClockInSchedule(res?.data?.userSettings?.use12HourClockInSchedule);
                    setDisableJournalModifications(res?.data?.userSettings?.disableJournalModifications);
                    setHideWeeklyScheduleItems(res?.data?.userSettings?.hideWeeklyScheduleItems);
                    setHideHighPriorityTasks(res?.data?.userSettings?.hideHighPriorityTasks);
                    setHideCompletedTasks(res?.data?.userSettings?.hideCompletedTasks);
                    setHideHighPriorityNotes(res?.data?.userSettings?.hideHighPriorityNotes);
                    setDisableNoteModifications(res?.data?.userSettings?.disableNoteModifications);
                }
            });
        }
        fetchUserSettings();
    }, [refresh]);

    const saveUserSettings = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const passwordHash = await createHash(password, userSalt);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/config/settings',
                data: {
                    passwordHash,
                    hideRemovedLabels, hideShowPasswordButton, disablePasswordModifications,
                    allowBankAccountDeletion,
                    allowIncomeTrackerDeletion, allowExpenseDeletion, allowNewCategoryCreation, hideAccountSnapshotInAnalytics,
                    hideAccountBalanceInCard, allowFDDeletion, allowRDDeletion, allowGoldAssetDeletion, allowStockDeletion, hideClosedFD, hideClosedRD, hideSoldGoldAssets, hideSoldStocks,
                    disableShoppingListModifications, disableFoodListModifications, disableWatchlistModifications, disableReadingListModifications, disableWishlistModifications, disableTodoListModifications, disableTripListModifications, disableNotepadModifications,
                    use12HourClockInSchedule, disableJournalModifications, hideWeeklyScheduleItems, hideHighPriorityTasks, hideCompletedTasks,
                    hideHighPriorityNotes, disableNoteModifications
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setPassword('');
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    const resetSettings = (e) =>{
        setPassword('');
    
        setHideRemovedLabels(false);
        setDisablePasswordModifications(false);
        setHideShowPasswordButton(false);
    
        setAllowBankAccountDeletion(false);
        setAllowExpenseDeletion(true);
        setAllowIncomeTrackerDeletion(true);
        setAllowNewCategoryCreation(true);
    
        setHideAccountSnapshotInAnalytics(false);
    
        setHideAccountBalanceInCard(false);
        setAllowFDDeletion(true);
        setAllowRDDeletion(true);
        setAllowGoldAssetDeletion(true);
        setAllowStockDeletion(true);
        setHideClosedFD(false);
        setHideClosedRD(false);
        setHideSoldGoldAssets(false);
        setHideSoldStocks(false);

        setDisableShoppingListModifications(false);
        setDisableFoodListModifications(false);
        setDisableWatchlistModifications(false);
        setDisableReadingListModifications(false);
        setDisableWishlistModifications(false);
        setDisableTodoListModifications(false);
        setDisableTripListModifications(false);
        setDisableNotepadModifications(false);
        setUse12HourClockInSchedule(false);
        setDisableJournalModifications(false);
        setHideWeeklyScheduleItems(false);
        setHideHighPriorityTasks(false);
        setHideCompletedTasks(false);
        setHideHighPriorityNotes(false);
        setDisableNoteModifications(false);
    }

    const sidebar = (
        <Flex align='center' width='full' justify='space-around' gap={theme.paddingL} direction={{base:'row', sm:'column'}} backgroundColor={theme.cardBg} borderRadius='35px'>
            <CircleIconButton icon={<MdRefresh/>} iconSize="18px" sidebarIconSize='24px' forSidebar tooltip={DISPLAY.TOOLTIPS.REFRESH} ttPlacement="right" onClick={()=> setRefresh(!refresh)}/>
            <CircleIconButton icon={<MdLockReset/>} iconSize="18px" sidebarIconSize='24px' forSidebar tooltip={DISPLAY.TOOLTIPS.RESET_SETTINGS} ttPlacement="right" onClick={resetSettings}/>
            <CircleIconButton icon={<FaInfo/>} tooltip={DISPLAY.TOOLTIPS.LEARN_MORE} sidebarIconSize='20px' forSidebar ttPlacement="right" onClick={()=>{}}/>
        </Flex>
    );

    return (
        <div className="common-page">
            <TitleBar>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/home')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </TitleBar>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <AppLayout sidebar={sidebar}>
                <Flex direction={{base: 'column', md: 'row'}} width='100%' gap={theme.spacing}>
                    {/* Sesstings div */}
                    <div style={{width: '100%'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing} align={{base: 'center', sm: 'left'}}>
                            {DISPLAY.LABELS.SETTINGS}
                        </Text>

                        {/* Profile Details */}
                        <div style={{padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, marginBottom: theme.marginL}}>
                            <div style={{display: 'flex', gap: theme.spacing, alignItems: 'center', marginBottom: theme.marginL}}>
                                <Avatar name={name} size='lg'/>
                                <div>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>{name}</Text>
                                    <Text color={theme.text} fontSize={theme.textSize}>{email}</Text>
                                </div>
                            </div>
                            <Divider borderColor={theme.border} borderWidth='1px' />
                            <Flex align='center'gap={theme.paddingL} marginTop={theme.marginL}>
                                <CircleIconButton icon={aegisTheme === 'dark' ? <MdOutlineLightMode/> : <MdOutlineDarkMode/>} tooltip={DISPLAY.TOOLTIPS.THEME} onClick={toggleAegisTheme}/>
                                <ActionButton name={getLanguageName(localStorage.getItem('aegis-language') || 'en')} icon={getLanguageIcon(localStorage.getItem('aegis-language') || 'en')} onClick={()=> setShowLanguageSettingPopup(true)} customStyle={{width: 'fit-content'}} />
                            </Flex>
                        </div>

                        {/* Password Manager Settings */}
                        <div style={{padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, marginBottom: theme.marginL}}>
                            <Flex align='center' marginBottom={theme.marginL}>
                                <LockIcon color={theme.textSecondary} margin={0}/>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS} marginBottom='2px' fontWeight={500}>
                                    {DISPLAY.TEXT.PASSWORD_MANAGER_SETTINGS}
                                </Text>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>{DISPLAY.TEXT.HIDE_REMOVED_LABELS}</Text>
                                <ToggleSwitch value={hideRemovedLabels} onChange={setHideRemovedLabels}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>{DISPLAY.TEXT.HIDE_SHOW_PASSWORD_BUTTON}</Text>
                                <ToggleSwitch value={hideShowPasswordButton} onChange={setHideShowPasswordButton}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>{DISPLAY.TEXT.DISABLE_PASSWORD_MODIFICATIONS}</Text>
                                <ToggleSwitch value={disablePasswordModifications} onChange={setDisablePasswordModifications}/>
                            </Flex>
                        </div>

                        {/* Bank Account Settings */}
                        <div style={{padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, marginBottom: theme.marginL}}>
                            <Flex align='center' marginBottom={theme.marginL}>
                                <RiBankLine color={theme.textSecondary} margin={0}/>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS} marginBottom='2px' fontWeight={500}>
                                    {DISPLAY.TEXT.BANK_ACCOUNT_SETTINGS}
                                </Text>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_BANK_ACCOUNT_DELETION}
                                </Text>
                                <ToggleSwitch value={allowBankAccountDeletion} onChange={setAllowBankAccountDeletion}/>
                            </Flex>
                        </div>

                        {/* Expense Manager Settings */}
                        <div style={{padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, marginBottom: theme.marginL}}>
                            <Flex align='center' marginBottom={theme.marginL}>
                                <GiMoneyStack color={theme.textSecondary} margin={0}/>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS} marginBottom='2px' fontWeight={500}>
                                    {DISPLAY.TEXT.EXPENSE_MANAGER_SETTINGS}
                                </Text>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_INCOME_TRACKER_DELETION}
                                </Text>
                                <ToggleSwitch value={allowIncomeTrackerDeletion} onChange={setAllowIncomeTrackerDeletion}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_EXPENSE_DELETION}
                                </Text>
                                <ToggleSwitch value={allowExpenseDeletion} onChange={setAllowExpenseDeletion}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_NEW_CATEGORY_CREATION}
                                </Text>
                                <ToggleSwitch value={allowNewCategoryCreation} onChange={setAllowNewCategoryCreation}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_ACCOUNT_SNAPSHOT_IN_ANALYTICS}
                                </Text>
                                <ToggleSwitch value={hideAccountSnapshotInAnalytics} onChange={setHideAccountSnapshotInAnalytics}/>
                            </Flex>
                        </div>

                        {/* Investment Settings */}
                        <div style={{padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, marginBottom: theme.marginL}}>
                            <Flex align='center' marginBottom={theme.marginL}>
                                <GiGoldBar color={theme.textSecondary} margin={0}/>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS} marginBottom='2px' fontWeight={500}>
                                    {DISPLAY.TEXT.INVESTMENT_MANAGER_SETTINGS}
                                </Text>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_ACCOUNT_BALANCE_IN_CARD}
                                </Text>
                                <ToggleSwitch value={hideAccountBalanceInCard} onChange={setHideAccountBalanceInCard}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_FD_DELETION}
                                </Text>
                                <ToggleSwitch value={allowFDDeletion} onChange={setAllowFDDeletion}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_RD_DELETION}
                                </Text>
                                <ToggleSwitch value={allowRDDeletion} onChange={setAllowRDDeletion}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_GOLD_ASSET_DELETION}
                                </Text>
                                <ToggleSwitch value={allowGoldAssetDeletion} onChange={setAllowGoldAssetDeletion}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.ALLOW_STOCK_DELETION}
                                </Text>
                                <ToggleSwitch value={allowStockDeletion} onChange={setAllowStockDeletion}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_CLOSED_FD}
                                </Text>
                                <ToggleSwitch value={hideClosedFD} onChange={setHideClosedFD}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_CLOSED_RD}
                                </Text>
                                <ToggleSwitch value={hideClosedRD} onChange={setHideClosedRD}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_SOLD_GOLD_ASSETS}
                                </Text>
                                <ToggleSwitch value={hideSoldGoldAssets} onChange={setHideSoldGoldAssets}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_SOLD_STOCKS}
                                </Text>
                                <ToggleSwitch value={hideSoldStocks} onChange={setHideSoldStocks}/>
                            </Flex>
                        </div>

                        {/* Planning Manager Settings */}
                        <div style={{padding: theme.paddingL, borderRadius: `calc(${theme.radius} * 2)`, border: `1px solid ${theme.border}`, backgroundColor: theme.cardBg, marginBottom: theme.marginL}}>
                            <Flex align='center' marginBottom={theme.marginL}>
                                <BsCalendarRange color={theme.textSecondary} margin={0}/>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS} marginBottom='2px' fontWeight={500}>
                                    {DISPLAY.TEXT.PLANNER_SETTINGS}
                                </Text>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_SHOPPING_LIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableShoppingListModifications} onChange={setDisableShoppingListModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_FOOD_LIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableFoodListModifications} onChange={setDisableFoodListModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_WATCHLIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableWatchlistModifications} onChange={setDisableWatchlistModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_READING_LIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableReadingListModifications} onChange={setDisableReadingListModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_WISHLIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableWishlistModifications} onChange={setDisableWishlistModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_TODO_LIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableTodoListModifications} onChange={setDisableTodoListModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_TRIP_LIST_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableTripListModifications} onChange={setDisableTripListModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_NOTEPAD_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableNotepadModifications} onChange={setDisableNotepadModifications}/>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.USE_12_HOUR_CLOCK_IN_SCHEDULE}
                                </Text>
                                <ToggleSwitch value={use12HourClockInSchedule} onChange={setUse12HourClockInSchedule}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_WEEKLY_SCHEDULE_ITEMS}
                                </Text>
                                <ToggleSwitch value={hideWeeklyScheduleItems} onChange={setHideWeeklyScheduleItems}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_HIGH_PRIORITY_TASKS}
                                </Text>
                                <ToggleSwitch value={hideHighPriorityTasks} onChange={setHideHighPriorityTasks}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_COMPLETED_TASKS}
                                </Text>
                                <ToggleSwitch value={hideCompletedTasks} onChange={setHideCompletedTasks}/>
                            </Flex>

                            <Divider borderColor={theme.border} borderWidth='1px' marginTop={theme.marginL} />

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_JOURNAL_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableJournalModifications} onChange={setDisableJournalModifications}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.HIDE_HIGH_PRIORITY_NOTES}
                                </Text>
                                <ToggleSwitch value={hideHighPriorityNotes} onChange={setHideHighPriorityNotes}/>
                            </Flex>

                            <Flex align='center' justify='space-between' marginTop={theme.marginL}>
                                <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginS}>
                                    {DISPLAY.TEXT.DISABLE_NOTE_MODIFICATIONS}
                                </Text>
                                <ToggleSwitch value={disableNoteModifications} onChange={setDisableNoteModifications}/>
                            </Flex>
                        </div>
                    </div>

                    {/* Password verification div */}
                    <div style={{width: '100%'}}>
                        <Text color={theme.text} fontSize={theme.headingSize} marginBottom={theme.spacing} align={{base: 'center', sm: 'left'}}>
                            {DISPLAY.LABELS.SAVE_SETTINGS}
                        </Text>
                        <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                            {DISPLAY.TEXT.PASSWORD_NEEDED_TO_SAVE_SETTINGS}
                        </Text>
                        <form style={{display: 'flex', alignItems: 'center', gap: theme.marginL}}>
                            <InputBox type='password' name='password' value={password} label={DISPLAY.LABELS.PASSWORD} onChange={(e)=> setPassword(e.target.value)} required={true} minLen={8} maxLen={30}/>
                            <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveUserSettings} actionType='primary' isLoading={isLoading} disabled={isLoading} customStyle={{marginBottom: theme.marginL, width: 'fit-content', paddingLeft: theme.spacing, paddingRight: theme.spacing}}/>
                        </form>
                        <div style={{height: '80px', width: '100%'}}></div> {/* For extra space in mobile devices */}
                    </div>
                </Flex>
            </AppLayout>

            {/* Language Selection Popup */}
            <Popup isOpen={showLanguageSettingPopup} onClose={()=> setShowLanguageSettingPopup(false)} title={DISPLAY.TEXT.SELECT_LANGUAGE}>
                <div style={{marginBottom: theme.marginS}}>
                    {
                        SYSTEM_DATA.SUPPORTED_LANGUAGES.map(language => (
                            <ActionButton key={language.code} name={language.name} icon={getLanguageIcon(language.code)} onClick={()=> {setLanguage(language.code); setShowLanguageSettingPopup(false)}} customStyle={{marginBottom: theme.marginS}}/>
                        ))
                    }
                    <Text color={theme.textSecondary} fontSize={theme.textSize} textAlign='center'>
                        {DISPLAY.TEXT.TRANSLATION_DESCLAIMER}
                    </Text>
                </div>
            </Popup>
        </div>
    );
}
