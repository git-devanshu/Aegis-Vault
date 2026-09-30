import React, { useState } from "react";
import { theme } from '../../themes/theme';
import toast from 'react-hot-toast';
import { Text } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import SYSTEM_DATA from '../../assets/system-data.json';
import { apiRequest, validateAndStartLoading } from "../../utility/api";
import { encryptData } from "../../utility/crypto";

import Popup from "./Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import Dropdown from "../form/Dropdown";


export default function PayCreditCardBillPopup({showPayBillPopup, setShowPayBillPopup, refreshSpendings, setRefreshSpendings, selectedAccount, spendingData, trackerDataOptions, totalAmountDue, setAccountData, accountDataArray}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [selectedTrackerIndex, setSelectedTrackerIndex] = useState(trackerDataOptions[0].value);
    const [isLoading, setIsLoading] = useState(false);

    const payCreditCardBill = async(e) =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try{
            const encryptedExpenses = await Promise.all(
                spendingData.map(async(spending)=>{
                    if(spending.paymentDue){
                        const expensePayload = {
                            spentAt: spending.spentAt,
                            amount: spending.amount,
                            spentDate: spending.spentDate
                        };
                        const {encryptedData: expenseData, nonce} = await encryptData(JSON.stringify(expensePayload), masterKey);
                        return {
                            accountIndex: selectedAccount.accountIndex,
                            trackerIndex: selectedTrackerIndex,
                            categoryIndex: spending.categoryIndex,
                            expenseData,
                            nonce
                        };
                    }
                    return null;
                })
            );

            const updatedAccount = {
                countryCode: selectedAccount.countryCode,
                bankId: selectedAccount.bankId,
                accountNo: selectedAccount.accountNo,
                accountAlias: selectedAccount.accountAlias,
                totalIncome: selectedAccount.totalIncome,
                totalExpense: selectedAccount.totalExpense + totalAmountDue
            };
            const {encryptedData: accountData, nonce: accountNonce} = await encryptData(JSON.stringify(updatedAccount), masterKey);

            const spendingIDs = [];
            spendingData.map((spending)=> {
                if(spending.paymentDue) spendingIDs.push(spending.id);
            });

            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/credit-card/pay-bill',
                data: {
                    spendingIDs, 
                    expenses: encryptedExpenses, 
                    accountData, 
                    accountNonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    const updatedAccountForUI = {
                        ...selectedAccount,
                        totalExpense: selectedAccount.totalExpense + totalAmountDue
                    };
                    setAccountData(accountDataArray.map(account =>{
                            if(account.accountIndex === selectedAccount.accountIndex){
                                return updatedAccountForUI;
                            }
                            return account;
                        })
                    );
                    setRefreshSpendings(!refreshSpendings);
                    setShowPayBillPopup(false);
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
        <Popup isOpen={showPayBillPopup} onClose={()=> setShowPayBillPopup(false)} title={DISPLAY.LABELS.PAY_CREDIT_CARD_BILL} bg={theme.bg} borderColor={theme.success}>
            <Text color={theme.text} fontSize={theme.textSize}>{DISPLAY.TEXT.BILL_PAYMENT_NOTE}</Text>
            <Dropdown value={selectedTrackerIndex} onChange={(e)=> setSelectedTrackerIndex(Number(e.target.value))} options={trackerDataOptions} />
            <InputBox type='number' label={DISPLAY.LABELS.TOTAL_AMOUNT} value={totalAmountDue} readOnly={true} />
            <ActionButton name={DISPLAY.BUTTONS.PAY_BILL} actionType='primary' isLoading={isLoading} disabled={isLoading || totalAmountDue <= 0} onClick={payCreditCardBill} customStyle={{marginBottom: theme.marginS}} />
        </Popup>
    );
}
