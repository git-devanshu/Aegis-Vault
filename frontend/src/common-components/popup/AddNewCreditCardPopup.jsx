import React, { useState } from "react";
import { theme } from '../../themes/theme';
import toast from 'react-hot-toast';
import { Text, Flex, Image } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import SYSTEM_DATA from '../../assets/system-data.json';
import { apiRequest, validateAndStartLoading } from "../../utility/api";
import { encryptData } from "../../utility/crypto";

import VISA from '../../assets/card-network-logos/VISA.png';
import MASTERCARD from '../../assets/card-network-logos/MASTERCARD.png';
import AMEX from '../../assets/card-network-logos/AMEX.png';
import RUPAY from '../../assets/card-network-logos/RUPAY.png';
import DINERSCLUB from '../../assets/card-network-logos/DINERSCLUB.png';

import Popup from "./Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import BillingDatePicker from "../form/BillingDatePicker";


export default function AddNewCreditCardPopup({showAddNewCardPopup, setShowAddNewCardPopup, refreshCreditCards, setRefreshCreditCards, selectedAccount}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const defaultCreditCardPayload = {
        cardName: '',
        cardNumber: '',
        network: 'AMEX',
        spendingLimit: 0,
        billingDate: '1D'
    };
    const [newCreditCard, setNewCreditCard] = useState(defaultCreditCardPayload);

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>{
        setNewCreditCard({
            ...newCreditCard,
            [e.target.name]: e.target.name === 'spendingLimit' ? Number(e.target.value) : e.target.value
        });
    }

    const handleBillingDateChange = (value) =>{
        setNewCreditCard({
            ...newCreditCard,
            billingDate: value
        });
    }

    const getCardNetworkLogo = (network) =>{
        if(network === "VISA") return VISA;
        if(network === "MASTERCARD") return MASTERCARD;
        if(network === "AMEX") return AMEX;
        if(network === "RUPAY") return RUPAY;
        if(network === "DINERSCLUB") return DINERSCLUB;
    }

    const addNewCreditCard = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const cardsDataPayload = [{
                cardName: newCreditCard.cardName,
                cardNumber: newCreditCard.cardNumber,
                network: newCreditCard.network,
            }]
            const billingCycleDataPayload = {
                spendingLimit: newCreditCard.spendingLimit,
                billingDate: newCreditCard.billingDate
            }
            const {encryptedData: cardsData, nonce: cardsDataNonce} = await encryptData(JSON.stringify(cardsDataPayload), masterKey);
            const {encryptedData: billingCycleData, nonce: billingCycleDataNonce} = await encryptData(JSON.stringify(billingCycleDataPayload), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/credit-card',
                data: {
                    accountIndex: selectedAccount.accountIndex,
                    cardsData, 
                    billingCycleData, 
                    cardsDataNonce, 
                    billingCycleDataNonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setShowAddNewCardPopup(false);
                    setRefreshCreditCards(!refreshCreditCards);
                    setNewCreditCard(defaultCreditCardPayload);
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
        <Popup isOpen={showAddNewCardPopup} onClose={()=> setShowAddNewCardPopup(false)} title={DISPLAY.LABELS.ADD_CARD} bg={theme.bg} borderColor={theme.success}>
            <form>
                <InputBox type='text' label={DISPLAY.LABELS.CARD_NAME} name='cardName' value={newCreditCard.cardName} onChange={handleChange} required={true} minLen={2} maxLen={30} />
                <InputBox type='text' label={DISPLAY.LABELS.CARD_NUMBER} name='cardNumber' value={newCreditCard.cardNumber} onChange={handleChange} required={true} minLen={15} maxLen={20} />
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginL}>{DISPLAY.LABELS.PAYMENT_NETWORK}</Text>
                <Flex alignItems='center' justifyContent='space-between' padding={theme.paddingL} flexWrap='wrap'>
                    {SYSTEM_DATA.PAYMENT_CARD_NETWORKS.map((network)=> (
                        <Flex alignItems='center' justifyContent='center' borderRadius={theme.radius} cursor='pointer' border={`1px solid ${newCreditCard.network === network ? theme.primary : theme.border}`} onClick={()=> setNewCreditCard({...newCreditCard, network})} padding={theme.paddingL} marginBottom={theme.marginL}>
                            <Image src={getCardNetworkLogo(network)} height='30px' />
                        </Flex>
                    ))}
                </Flex>
                <InputBox type='number' label={DISPLAY.LABELS.SPENDING_LIMIT} name='spendingLimit' value={newCreditCard.spendingLimit} onChange={handleChange} required={true} min={100} />
                <BillingDatePicker label={DISPLAY.LABELS.BILLING_DATE} value={newCreditCard.billingDate} onChange={handleBillingDateChange} />

                <ActionButton name={DISPLAY.BUTTONS.ADD_CARD} actionType='primary' isLoading={isLoading} disabled={isLoading || newCreditCard.spendingLimit < 100} onClick={addNewCreditCard} customStyle={{marginBottom: theme.marginS}} />
            </form>
        </Popup>
    );
}
