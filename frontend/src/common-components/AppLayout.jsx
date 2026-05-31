import React from "react";
import { Box, Flex } from '@chakra-ui/react'
import { theme } from '../themes/theme';

export default function AppLayout({sidebar, children}) {
    return (
        <Flex bg={theme.bg} position='relative'>
            <Flex position={{base:'fixed', sm:'sticky'}}
                left={{base:'50%', sm:'0'}}
                top={{base:'unset', sm:'15px'}}
                bottom={{base:'15px', sm:'unset'}}
                transform={{base:'translateX(-50%)', sm:'none'}}
                direction={{base:'row', sm:'column'}}
                align='center'
                gap={theme.paddingL}
                bg={theme.cardBg}
                border={`1px solid ${theme.border}`}
                borderRadius='25px'
                p='8px'
                m={{base:'0', sm:theme.marginL}}
                zIndex='99'
                height='fit-content'
            >
                {sidebar}
            </Flex>

            <Box flex='1' p={theme.paddingL} overflowY='auto'>
                {children}
            </Box>
        </Flex>
    );
}
