import React, { useMemo } from 'react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';

import { Box, Flex, Input, Text } from '@chakra-ui/react';

import InfoTooltip from '../popup/InfoTooltip';

export default function ColorPicker({label, value, onChange, colors}) {
    const {DISPLAY} = useLanguage();

    const basicColors = useMemo(() => colors || [
        '#ff0000',
        '#ffff00',
        '#ffa500',
        '#0000ff',
        '#00ffff',
        '#008000',
        '#00ff00',
        '#808080',
        '#a52a2a',
        '#000000',
        '#ffffff'
    ], [colors]);

    const handleChange = e =>{
        onChange(e.target.value.toUpperCase());
    }

    return (
        <Box marginTop={theme.marginL} marginBottom={theme.spacing} padding={theme.paddingL} border={`1px solid ${theme.border}`} borderRadius={`calc(2 * ${theme.radius})`} position='relative'>
            <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{ position:'absolute', top:'-12px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1 }}>
                {label}
            </Text>

            <Flex gap={theme.paddingL} align='center'>
                <InfoTooltip placement='bottom' 
                    label={
                        <Flex gap={theme.paddingS} wrap='wrap' maxWidth='195px'>
                            {
                                basicColors.map(color =>
                                    <Box key={color}
                                        width='20px'
                                        height='20px'
                                        borderRadius='8px'
                                        cursor='pointer'
                                        backgroundColor={color}
                                        border={value === color ? `3px solid ${theme.primary}` : `1px solid ${theme.border}`}
                                        onClick={()=> onChange(color)}
                                    />
                                )
                            }
                        </Flex>
                    }
                >
                    <Box width='24px' height='24px' flexShrink={0} cursor='pointer'
                        borderRadius={theme.radius} border={`1px solid ${theme.border}`}
                        backgroundColor={value}
                    />
                </InfoTooltip>

                <Box flex={1}>
                    <Input variant='unstyled' type='text' value={value} onChange={handleChange} maxLength={7} color={theme.text} />
                </Box>
            </Flex>
        </Box>
    );
}