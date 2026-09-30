import React, { useState, useEffect, useMemo } from "react";
import { theme } from '../../themes/theme';
import { Text, Flex, Spacer, Stack, Image } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

import VISA from '../../assets/card-network-logos/VISA.png';
import MASTERCARD from '../../assets/card-network-logos/MASTERCARD.png';
import AMEX from '../../assets/card-network-logos/AMEX.png';
import RUPAY from '../../assets/card-network-logos/RUPAY.png';
import DINERSCLUB from '../../assets/card-network-logos/DINERSCLUB.png';

import Popup from "./Popup";


export default function SwitchCreditCardPopup({creditCardData, showSwitchCardPopup, setShowSwitchCardPopup, selectedCCIndex, setSelectedCCIndex}) {
    if(!creditCardData?.length) return;

    const {DISPLAY} = useLanguage();

    const getCardNetworkLogo = (network) =>{
        if(network === "VISA") return VISA;
        if(network === "MASTERCARD") return MASTERCARD;
        if(network === "AMEX") return AMEX;
        if(network === "RUPAY") return RUPAY;
        if(network === "DINERSCLUB") return DINERSCLUB;
    }

    return (
        <Popup isOpen={showSwitchCardPopup} onClose={()=> setShowSwitchCardPopup(false)} title={DISPLAY.LABELS.SWITCH_CARD} bg={theme.bg} borderColor={theme.success}>
            <Stack gap={theme.paddingL} maxHeight='450px' overflowY='scroll'>
                {creditCardData.map((card, index)=> (
                    <Flex key={index} border={`1px solid ${selectedCCIndex === card.ccIndex ? theme.primary : theme.border}`} borderRadius={theme.radius} padding={theme.paddingL} alignItems='center' cursor='pointer' onClick={()=> {setSelectedCCIndex(card.ccIndex); setShowSwitchCardPopup(false); }} transition='ease'>
                        <Stack>
                            <Flex gap={theme.paddingL} alignItems='center'>
                                <Text fontSize={theme.textSize} color={theme.text} fontWeight={500}>{card.cardsData[0].cardName}</Text>
                                <Image src={getCardNetworkLogo(card.cardsData[0]?.network)} height='25px'/>
                            </Flex>
                            <Text color={theme.text} fontSize={theme.textSize} fontFamily='monospace'>{card.cardsData[0]?.cardNumber.slice(-4)}</Text>
                        </Stack>
                        <Spacer/>
                        {selectedCCIndex === card.ccIndex ? <MdRadioButtonChecked fontSize='18px' color={theme.primary} /> : <MdRadioButtonUnchecked fontSize='18px' />}
                    </Flex>
                ))}
            </Stack>
        </Popup>
    );
}
