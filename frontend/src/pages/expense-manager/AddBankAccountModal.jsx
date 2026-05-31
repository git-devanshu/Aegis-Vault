import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import { Flex, Text, Image, Divider, Spacer } from '@chakra-ui/react';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import BANKS from '../../assets/banks.json';
import { apiRequest, validateAndStartLoading } from "../../utility/api";
import { encryptData } from "../../utility/crypto";

import { ArrowBackIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { GiMoneyStack } from "react-icons/gi";

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import Dropdown from "../../common-components/form/Dropdown";
import InfoTooltip from '../../common-components/popup/InfoTooltip';


export default function AddBankAccountModal({onBack, refreshAccounts, setRefreshAccounts}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, clearMasterKey} = useAppContext();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');

    const [account, setAccount] = useState({
        countryCode: 'IN',
        bankId: '',
        accountNo: '',
        accountAlias: '',
        totalIncome: 0,
        totalExpense: 0
    });

    const [isLoading, setIsLoading] = useState(false);

    const countryOptions = Object.entries(BANKS.country).map(([code, value])=>({
        label:`${value.countryName} (${value.currency.symbol})`,
        value:code
    }));

    const filteredBanks = useMemo(()=>{
        const q = searchQuery.trim().toLowerCase();
        return Object.entries(BANKS.banks).filter(([id, bank])=>
            bank.isActive && (
                bank.bankName.toLowerCase().includes(q) ||
                bank.shortName.toLowerCase().includes(q)
            )
        );
    }, [searchQuery]);

    const addBankAccount = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.EXPENSE_MANAGER.ADDING_ACCOUNT
        });
        if(!toastId) return;
        try{
            const {encryptedData: accountData, nonce} = await encryptData(JSON.stringify(account), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/al/accounts',
                data: {accountData, nonce},
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setAccount({
                        countryCode: 'IN',
                        bankId: '',
                        accountNo: '',
                        accountAlias: '',
                        totalIncome: 0,
                        totalExpense: 0
                    });
                    setRefreshAccounts(!refreshAccounts);
                    onBack();
                },
                onError: (err) =>{
                    onBack();
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
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <GiMoneyStack color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.BANK_ACCOUNT}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <div className="common-container">
                <div style={{display: 'flex', alignItems: 'center', paddingBottom: theme.marginL, paddingTop: theme.spacing, margin: '0 auto', width:'fit-content'}}>
                    <Text color={theme.text} fontSize={theme.headingSize} textAlign='center'>
                        {DISPLAY.LABELS.ADD_BANK_ACCOUNT}
                    </Text>
                    <InfoTooltip label={DISPLAY.TEXT.BANK_ACCOUNT_DISCLAIMER}>
                        <InfoOutlineIcon color={theme.text} marginLeft={theme.marginL} />
                    </InfoTooltip>
                </div>
                
                <form>
                    <Dropdown value={account.countryCode} onChange={(e)=> setAccount({...account, countryCode: e.target.value})} options={countryOptions} />

                    <InputBox type='text' placeholder={`🔎︎ ${DISPLAY.LABELS.SEARCH_BANK}`} name='searchQuery' value={searchQuery} onChange={(e)=> setSearchQuery(e.target.value)}/>

                    <div style={{ border: `1px solid ${theme.border}`, borderRadius: `calc(${theme.radius} * 2)`, maxHeight: '150px', overflowY: 'auto', backgroundColor:theme.cardBg, scrollbarWidth: "none", marginBottom: theme.spacing}}>
                        {
                            filteredBanks.map(([id, bank])=>(
                                <Flex key={id} align='center' justify='space-between' padding={theme.paddingL} cursor='pointer' backgroundColor={account.bankId === id ? theme.hoverBg : 'transparent'} borderBottom={`1px solid ${theme.border}`} transition='0.2s' _hover={{backgroundColor:theme.hoverBg}} onClick={()=> setAccount({...account, bankId:id})} >
                                    <Flex align='center' gap={theme.paddingL}>
                                        <Image src={bank.logo} alt={bank.bankName} width='38px' height='38px' borderRadius='10px' objectFit='cover' />
                                        <div>
                                            <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                                                {bank.bankName}
                                            </Text>
                                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                                {bank.shortName}
                                            </Text>
                                        </div>
                                    </Flex>
                                    {account.bankId === id &&
                                        <div style={{ width:'10px', height:'10px', borderRadius:'50%', backgroundColor:theme.primary }}/>
                                    }
                                </Flex>
                            ))
                        }
                    </div>

                    <InputBox type='text' label={DISPLAY.LABELS.ACCOUNT_NUMBER} name='accountNo' value={account.accountNo} onChange={(e)=> setAccount({...account, accountNo:e.target.value})} required maxLen={30} />

                    <InputBox type='text' label={DISPLAY.LABELS.ACCOUNT_ALIAS} name='accountAlias' value={account.accountAlias} onChange={(e)=> setAccount({...account, accountAlias:e.target.value})} required maxLen={25} />

                    <ActionButton name={DISPLAY.BUTTONS.ADD_ACCOUNT} onClick={addBankAccount} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                </form>
            </div>
        </div>
        </div>
    );
}
