import React, { useMemo } from 'react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import { Box, Flex, Spacer, Text } from '@chakra-ui/react';

import { MdCalendarMonth } from 'react-icons/md';

import InfoTooltip from '../popup/InfoTooltip';

export default function BillingDatePicker({label, value, onChange}) {
    const {DISPLAY} = useLanguage();

    const days = useMemo(() => 
        Array.from({length: 31}, (_, index) => `${index + 1}D`)
    , []);

    const selectedDay = value?.replace('D', '');

    return (
        <Box marginTop={theme.marginL} marginBottom={theme.spacing} padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} position='relative'>
            <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{position:'absolute', top:'-12px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1}}>
                {label}
            </Text>

            <Flex gap={theme.paddingS} align='center'>
                <InfoTooltip
                    placement='bottom' maxWidth='255px'
                    label={
                        <Flex gap={theme.paddingS} wrap='wrap'>
                            {
                                days.map(day => {
                                    const dayNumber = day.replace('D', '');
                                    return (
                                        <Box
                                            key={day}
                                            width='30px'
                                            height='30px'
                                            display='flex'
                                            alignItems='center'
                                            justifyContent='center'
                                            borderRadius={theme.radius}
                                            cursor='pointer'
                                            color={theme.text}
                                            border={value === day ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`}
                                            backgroundColor={value === day ? theme.hoverBg : 'transparent'}
                                            onClick={() => onChange(day)}
                                        >
                                            <Text fontSize={theme.smallTextSize}>{dayNumber}</Text>
                                        </Box>
                                    );
                                })
                            }
                        </Flex>
                    }
                >
                    <Box width='24px' height='24px' flexShrink={0} cursor='pointer'>
                        <MdCalendarMonth fontSize='22px' color={theme.textSecondary} />
                    </Box>
                </InfoTooltip>
                <Box flex={1}>
                    <Text fontSize={theme.textSize} color={theme.text}>
                        {selectedDay || '-'}
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}
