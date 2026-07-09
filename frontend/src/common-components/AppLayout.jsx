import React from "react";
import { Box, Flex } from '@chakra-ui/react'
import { theme } from '../themes/theme';

export default function AppLayout({sidebar, children}) {
    return (
        <Flex bg={theme.bg} position='relative'>
            <Flex
                position={{base:'fixed', sm:'sticky'}}
                left={{base:'0', sm:'0'}}
                right={{base:'0', sm:'unset'}}
                top={{base:'unset', sm:'15px'}}
                bottom={{base:'0', sm:'unset'}}
                transform={{base:'none', sm:'none'}}
                direction={{base:'row', sm:'column'}}
                justify={{base:'space-evenly', sm:'center'}}
                align='center'
                gap={{base:0, sm:theme.paddingL}}
                bg={theme.cardBg}
                border={{base:'none', sm:`1px solid ${theme.border}`}}
                borderTop={{base:`1px solid ${theme.border}`, sm:'none'}}
                borderRadius={{base:'0', sm:'25px'}}
                p={{base:'10px 16px', sm:'8px'}}
                m={{base:'0', sm:theme.marginL}}
                width={{base:'100%', sm:'fit-content'}}
                height='fit-content'
                zIndex='99'
            >
                {sidebar}
            </Flex>

            <Box flex='1' p={theme.paddingL} overflowY='auto'>
                {children}
            </Box>
        </Flex>
    );
}
