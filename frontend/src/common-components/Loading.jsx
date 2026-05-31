import React from 'react'
import { Spinner, Flex, Text } from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons';
import useLanguage from '../hooks/useLanguage';
import { theme } from '../themes/theme';
import { ThreeDot } from "react-loading-indicators";


export default function Loading({data, error}) {
    const {DISPLAY} = useLanguage();

    return (
        <Flex minHeight='100vh' backgroundColor={theme.bg} align='center' justify='center' padding={theme.spacing}>
            {
                !error ? <Flex direction='column' align='center' justify='center' gap={theme.paddingL}>
                    <ThreeDot variant="brick-stack" color={theme.primary} size="medium" />
                    <Text color={theme.text} fontSize={theme.headingSize}>
                        {DISPLAY.TEXT.LOADING} {data}
                    </Text>
                    <Text color={theme.textSecondary} fontSize={theme.textSize} textAlign='center'>
                        {DISPLAY.TEXT.PLEASE_WAIT_LOADING}
                    </Text>
                </Flex> 
                : <Flex direction='column' align='center' justify='center' gap={theme.spacing}>
                    <WarningIcon boxSize={8} color={theme.error} />
                    <Text color={theme.text} fontSize={theme.headingSize}>
                        {DISPLAY.TEXT.FAILED_TO_LOAD} {data}
                    </Text>
                    <Text color={theme.textSecondary} fontSize={theme.textSize} textAlign='center'>
                        {DISPLAY.TEXT.ERROR}: {error}
                    </Text>
                </Flex>
            }
        </Flex>
    );
}
