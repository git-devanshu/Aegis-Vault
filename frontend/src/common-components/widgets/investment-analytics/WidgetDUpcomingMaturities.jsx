import React from "react";
import { Text, Box, Table, Thead, Tbody, Tr, Th, Td, Flex } from '@chakra-ui/react';
import { theme } from '../../../themes/theme';
import BANKS from '../../../assets/banks.json';
import useLanguage from "../../../hooks/useLanguage";

import { InfoOutlineIcon } from "@chakra-ui/icons";

import InfoTooltip from "../../popup/InfoTooltip";

export default function WidgetDUpcomingMaturities({country, analytics}){
    const {DISPLAY} = useLanguage();

    return (
        <Box padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.UPCOMING_MATURITIES}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.UPCOMING_MATURITIES_INFO}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>

            <Table variant='unstyled' size='sm'>
                <Thead>
                    <Tr bgColor={theme.accent}>
                        <Th color={theme.text} textTransform='none'>
                            {DISPLAY.LABELS.INVESTMENTS}
                        </Th>

                        <Th color={theme.text} textAlign='right' textTransform='none'>
                            {DISPLAY.LABELS.AMOUNT}
                        </Th>

                        <Th color={theme.text} textAlign='right' textTransform='none'>
                            {DISPLAY.LABELS.MATURITY_DATE}
                        </Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {
                        analytics.upcomingMaturities.map(item =>
                            <Tr key={`${item.type}-${item.id}`} borderTop={`1px solid ${theme.border}`} bgColor={new Date(item.maturityDate) < new Date() ? theme.hoverBg : 'transparent'}>
                                <Td color={theme.text}>
                                    #{item.type}{item.id}
                                </Td>

                                <Td color={theme.text} textAlign='right'>
                                    {country.currency.symbol}
                                    {item.amount.toLocaleString(country.locale)}
                                </Td>

                                <Td color={theme.text} textAlign='right'>
                                    {new Date(item.maturityDate).toLocaleDateString(country.locale)}
                                </Td>
                            </Tr>
                        )
                    }

                    {
                        analytics.upcomingMaturities.length === 0 &&
                        <Tr>
                            <Td colSpan={3} textAlign='center' color={theme.textSecondary}>
                                {DISPLAY.TEXT.NO_DATA}
                            </Td>
                        </Tr>
                    }
                </Tbody>
            </Table>
        </Box>
    );
}