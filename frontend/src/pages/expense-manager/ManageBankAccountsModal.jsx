import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { theme } from '../../themes/theme';
import { Flex, Text, Image, Divider, Spacer, ButtonGroup } from '@chakra-ui/react';
import useLanguage from "../../hooks/useLanguage";
import BANKS from '../../assets/banks.json';
import { apiRequest, validateAndStartLoading } from "../../utility/api";

import { ArrowBackIcon } from '@chakra-ui/icons';
import { RiBankLine } from "react-icons/ri";

import ActionButton from "../../common-components/form/ActionButton";
import AddBankAccountModal from "./AddBankAccountModal";
import Popup from "../../common-components/popup/Popup";
import useAppContext from "../../hooks/useAppContext";


export default function ManageBankAccountsModal({ accountData, onBack, setSelectedAccountIndex, refreshAccounts, setRefreshAccounts }) {
    const {DISPLAY, TOASTS} = useLanguage();
    const navigate = useNavigate();
    const {allowBankAccountDeletion} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);

    const [accountIdToBeDeleted, setAccountIdToBeDeleted] = useState('');

    const deleteAccount = async() =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        await apiRequest({
            method: 'DELETE',
            endpoint: `/api/al/accounts/${accountIdToBeDeleted}`,
            toastId,
            setIsLoading,
            onSuccess: (res) =>{
                navigate('/home');
            }
        });
    }

    return (
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiBankLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500} align={{base: 'center', sm: 'left'}}>
                    {DISPLAY.LABELS.BANK_ACCOUNT}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width: 'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <div className="common-container">
                <Text color={theme.text} fontSize={theme.headingSize} textAlign='center' marginTop={theme.spacing} marginBottom={theme.spacing}>
                    {DISPLAY.LABELS.SELECT_BANK_ACCOUNT}
                </Text>
                
                {accountData.map((account) => {
                    const bank = BANKS.banks[account.bankId];
                    const country = BANKS.country[account.countryCode];
                    const maskedAccountNo = `**** **** **** ${account.accountNo.slice(-4)}`;
                    return(
                        <div style={{backgroundColor: theme.cardBg, borderRadius: theme.radius, marginTop: theme.marginL, padding: theme.paddingL}}>
                            <Flex gap={theme.paddingL} align='center'>
                                <Image src={bank.logo} alt={bank.bankName} width='48px' height='48px' borderRadius='4px' />
                                <div>
                                    <Text fontSize={theme.text} fontWeight={500} color={theme.text}>
                                        {bank.bankName}
                                    </Text>
                                    <Text fontSize={theme.smallTextSize} color={theme.textSecondary}>
                                        {country.countryName}
                                    </Text>
                                </div>
                            </Flex>
                            <Text letterSpacing='1px' color={theme.text} marginTop={theme.marginL} fontSize={theme.textSize} fontFamily='math' fontWeight={600}>
                                {maskedAccountNo}
                            </Text>
                            <Text fontSize={theme.textSize} color={theme.textSecondary} marginBottom={theme.marginL}>
                                {account.accountAlias}
                            </Text>
                            <Divider borderColor={theme.border} borderWidth='1px' />
                            <ButtonGroup width='100%' marginTop={theme.marginL}>
                                {allowBankAccountDeletion && <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={()=>{ setAccountIdToBeDeleted(account.id); setShowDeleteAccountPopup(true); }} /> }
                                <ActionButton name={DISPLAY.BUTTONS.SELECT} onClick={()=>{ setSelectedAccountIndex(account.accountIndex); onBack(); }} actionType='primary' />
                            </ButtonGroup>
                        </div>
                    )
                })}

                <ActionButton name={DISPLAY.BUTTONS.ADD_NEW_ACCOUNT} onClick={()=> setShowAddAccountModal(true)} actionType='primary' customStyle={{marginTop: theme.spacing}} />
            </div>

            {/* Add New Bank Account Modal */}
            {showAddAccountModal && <AddBankAccountModal onBack={()=> setShowAddAccountModal(false)} refreshAccounts={refreshAccounts} setRefreshAccounts={setRefreshAccounts}/>}

            {/* Delete Account Popup */}
            <Popup isOpen={showDeleteAccountPopup && allowBankAccountDeletion} onClose={()=> setShowDeleteAccountPopup(false)} title={DISPLAY.TEXT.DELETE_ACCOUNT} borderColor={theme.error}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_ACCOUNT}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteAccountPopup(false)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteAccount} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                </ButtonGroup>
            </Popup>
        </div>
        </div>
    );
}
