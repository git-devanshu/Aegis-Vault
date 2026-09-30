import React, { useEffect, useState } from "react";
import { Box, Flex, IconButton, Text, VStack, HStack, Badge, Image} from "@chakra-ui/react";
import { theme } from '../../themes/theme';

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FaWifi } from "react-icons/fa";
import { FcSimCardChip } from "react-icons/fc";

import VISA from '../../assets/card-network-logos/VISA.png';
import MASTERCARD from '../../assets/card-network-logos/MASTERCARD.png';
import AMEX from '../../assets/card-network-logos/AMEX.png';
import RUPAY from '../../assets/card-network-logos/RUPAY.png';
import NPCI from '../../assets/card-network-logos/NPCI.png';
import DINERSCLUB from '../../assets/card-network-logos/DINERSCLUB.png';


export default function CreditCardsCarousel({cardsData}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const screenWidth = window.innerWidth;

    const resetCarouselToZeroIndex = () =>{
        setCurrentIndex(0);
        return cardsData[0];
    }

    const currentCard = cardsData[currentIndex] ?? resetCarouselToZeroIndex();

    const showPrevious = () =>{
        setCurrentIndex(prev => prev - 1);
    }

    const showNext = () =>{
        setCurrentIndex(prev => prev + 1);
    }

    const getCardNetworkLogo = (network) =>{
        if(network === "VISA") return VISA;
        if(network === "MASTERCARD") return MASTERCARD;
        if(network === "AMEX") return AMEX;
        if(network === "RUPAY") return RUPAY;
        if(network === "DINERSCLUB") return DINERSCLUB;
    }

    return (
        <Flex align="center" width="100%" gap='5px' justify="center" marginBottom={theme.marginL}>
            <IconButton 
                aria-label="Previous card" height='30px' icon={<ChevronLeftIcon boxSize={6} />} disabled={currentIndex <= 0} onClick={showPrevious}
                borderRadius="full" variant="ghost" bgColor='transparent' 
                _hover={{bgColor: theme.hoverBg, color: theme.textSecondary}}
            />

            <Flex align="center" width={`calc(100% - 50px)`} justify="center">
                <Box
                    flex="1"
                    width="100%"
                    aspectRatio="1.65"
                    minWidth={0}
                    borderRadius="16px"
                    padding={4}
                    color="white"
                    background="linear-gradient(135deg, #0F172A, #1E293B)"
                    position="relative"
                    overflow="scroll"
                >
                    <VStack align="stretch" justify="space-between" height="100%">
                        <HStack justify="space-between">
                            <Text fontSize={theme.textSize} fontWeight="semibold">
                                {currentCard.cardName}
                            </Text>
                            <Flex gap={1} alignItems='center'>
                                {currentCard.network === "RUPAY" && <Image src={NPCI} height='23px'/>}
                                <FaWifi style={{rotate: '90deg'}} color='#babfc6' />
                            </Flex>
                        </HStack>

                        {screenWidth >= 380 && <FcSimCardChip fontSize='50px' />}

                        <Text fontSize='xl' letterSpacing="2px" fontWeight="medium">
                            {`**** **** **** ${currentCard.cardNumber.slice(-4)}`}
                        </Text>

                        <HStack justify="space-between" alignItems='end'>
                            <Text fontSize="xs" opacity={0.7}>
                                CREDIT CARD
                            </Text>
                            <Image src={getCardNetworkLogo(currentCard.network)} height='36px' />
                        </HStack>
                    </VStack>
                </Box>
            </Flex>

            <IconButton 
                aria-label="Next card" height='30px' icon={<ChevronRightIcon boxSize={6} />} disabled={currentIndex >= cardsData.length - 1} onClick={showNext}
                borderRadius="full" variant="ghost" bgColor='transparent' 
                _hover={{bgColor: theme.hoverBg, color: theme.textSecondary}}
            />
        </Flex>
    );
};
