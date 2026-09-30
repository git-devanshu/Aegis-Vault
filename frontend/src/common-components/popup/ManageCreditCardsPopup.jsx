import React, { useState } from "react";
import { theme } from '../../themes/theme';
import toast from 'react-hot-toast';
import { Text, Flex, Image, Stack, Spacer, ButtonGroup, Grid } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import SYSTEM_DATA from '../../assets/system-data.json';
import { apiRequest, validateAndStartLoading } from "../../utility/api";
import { encryptData } from "../../utility/crypto";

import { DeleteIcon } from "@chakra-ui/icons";

import VISA from '../../assets/card-network-logos/VISA.png';
import MASTERCARD from '../../assets/card-network-logos/MASTERCARD.png';
import AMEX from '../../assets/card-network-logos/AMEX.png';
import RUPAY from '../../assets/card-network-logos/RUPAY.png';
import DINERSCLUB from '../../assets/card-network-logos/DINERSCLUB.png';

import Popup from "./Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import BillingDatePicker from "../form/BillingdatePicker";
import CircleIconButton from "../form/CircleIconButton";


export default function ManageCreditCardsPopup({showManageCardPopup, setShowManageCardPopup, refreshCreditCards, setRefreshCreditCards, selectedAccount, selectedCreditCard}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [billingCycleDataPayload, setBillingCycleDataPayload] = useState({
        billingDate: selectedCreditCard.billingDate,
        spendingLimit: selectedCreditCard.spendingLimit
    });
    const [companionCards, setCompanionCards] = useState(selectedCreditCard.cardsData);

    const defaultCompanionCard = {
        cardName: '',
        cardNumber: '',
        network: "AMEX"
    };
    const [newCompanionCard, setNewCompanionCard] = useState(defaultCompanionCard);

    const [isLoading, setIsLoading] = useState(false);

    const handleNewCompanionCardChange = (e) =>{
        setNewCompanionCard({
            ...newCompanionCard,
            [e.target.name]: e.target.value
        })
    }

    const handleCreditLimitChange = (value) =>{
        setBillingCycleDataPayload({
            ...billingCycleDataPayload,
            spendingLimit: value
        });
    }

    const handleBillingDateChange = (value) =>{
        setBillingCycleDataPayload({
            ...billingCycleDataPayload,
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

    const addNewCompanionCard = (e) =>{
        setCompanionCards([
            ...companionCards, newCompanionCard
        ]);
        setNewCompanionCard(defaultCompanionCard);
    }

    const removeCompanionCard = (cardNumber) =>{
        const updatedCompanionCards = companionCards.filter(card => card.cardNumber != cardNumber);
        setCompanionCards(updatedCompanionCards);
    }

    const saveCreditCard = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const {encryptedData: cardsData, nonce: cardsDataNonce} = await encryptData(JSON.stringify(companionCards), masterKey);
            const {encryptedData: billingCycleData, nonce: billingCycleDataNonce} = await encryptData(JSON.stringify(billingCycleDataPayload), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/em/credit-card',
                data: {
                    accountIndex: selectedAccount.accountIndex,
                    ccIndex: selectedCreditCard.ccIndex,
                    cardsData, 
                    billingCycleData, 
                    cardsDataNonce, 
                    billingCycleDataNonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setShowManageCardPopup(false);
                    setRefreshCreditCards(!refreshCreditCards);
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
        <Popup isOpen={showManageCardPopup} onClose={()=> { setCompanionCards(selectedCreditCard.cardsData); setNewCompanionCard(defaultCompanionCard); setShowManageCardPopup(false); }} title={DISPLAY.LABELS.MANAGE_CARD} bg={theme.bg} borderColor={theme.success}>
            <form>
                <Grid templateColumns='1fr 1fr' gap={theme.paddingL}>
                    <InputBox type='number' label={DISPLAY.LABELS.SPENDING_LIMIT} name='spendingLimit' value={billingCycleDataPayload.spendingLimit} onChange={handleCreditLimitChange} required={true} min={100} />
                    <BillingDatePicker label={DISPLAY.LABELS.BILLING_DATE} value={billingCycleDataPayload.billingDate} onChange={handleBillingDateChange} />
                </Grid>

                <Text color={theme.text} fontSize={theme.textSize} marginTop='-10px' marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.COMPANION_CARDS}
                </Text>

                <Stack gap={theme.paddingL} maxHeight='200px' overflowY='scroll'>
                    {companionCards?.map((card, index)=> (
                        <Flex key={index} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} alignItems='center'>
                            <Stack>
                                <Flex gap={theme.paddingL} alignItems='center'>
                                    <Text fontSize={theme.textSize} color={theme.text} fontWeight={500}>{card.cardName}</Text>
                                    <Image src={getCardNetworkLogo(card.network)} height='25px'/>
                                </Flex>
                                <Text color={theme.text} fontSize={theme.textSize} fontFamily='monospace'>{card.cardNumber.slice(-4)}</Text>
                            </Stack>
                            <Spacer/>
                            <CircleIconButton icon={<DeleteIcon />} iconSize="20px" onClick={()=> removeCompanionCard(card.cardNumber)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                        </Flex>
                    ))}
                </Stack>
                
                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.marginL}>
                    <InputBox type='text' label={DISPLAY.LABELS.CARD_NAME} name='cardName' value={newCompanionCard.cardName} onChange={handleNewCompanionCardChange} minLen={2} maxLen={30} />
                    <InputBox type='text' label={DISPLAY.LABELS.CARD_NUMBER} name='cardNumber' value={newCompanionCard.cardNumber} onChange={handleNewCompanionCardChange} minLen={15} maxLen={20} />
                </Grid>

                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginL} marginTop='-10px'>{DISPLAY.LABELS.PAYMENT_NETWORK}</Text>
                <Flex alignItems='center' justifyContent='space-between' padding={theme.paddingL} flexWrap='wrap'>
                    {SYSTEM_DATA.PAYMENT_CARD_NETWORKS.map((network)=> (
                        <Flex alignItems='center' justifyContent='center' borderRadius={theme.radius} cursor='pointer' border={`1px solid ${newCompanionCard.network === network ? theme.primary : theme.border}`} onClick={()=> setNewCompanionCard({...newCompanionCard, network })} padding={theme.paddingL} marginBottom={theme.marginL}>
                            <Image src={getCardNetworkLogo(network)} height='30px' />
                        </Flex>
                    ))}
                </Flex>
                
                <ButtonGroup marginBottom={theme.marginL} width='full'>
                    <ActionButton name={DISPLAY.BUTTONS.ADD_CARD} isLoading={isLoading} disabled={isLoading} onClick={addNewCompanionCard} />
                    <ActionButton name={DISPLAY.BUTTONS.SAVE} actionType='primary' isLoading={isLoading} disabled={isLoading || billingCycleDataPayload.spendingLimit < 100} onClick={saveCreditCard} />
                </ButtonGroup>
            </form>
        </Popup>
    );
}
