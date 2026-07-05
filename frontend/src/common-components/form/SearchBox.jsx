import React from 'react';
import { Input, Box } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { theme } from '../../themes/theme';
import useTheme from '../../hooks/useTheme';

export default function SearchBox({placeholder, name, value, onChange, maxLen}) {
    const {aegisTheme} = useTheme();

    return (
        <Box width='100%' position='relative' marginTop={theme.marginL} marginBottom={theme.spacing}>
            <SearchIcon
                color={theme.textSecondary}
                position='absolute'
                left='16px'
                top='50%'
                transform='translateY(-50%)'
                zIndex={1}
                pointerEvents='none'
            />

            <Input
                variant='unstyled'
                type='text'
                placeholder={placeholder}
                name={name}
                value={value}
                onChange={onChange}
                maxLength={maxLen}
                width='100%'
                border={`1px solid ${theme.border}`}
                borderRadius='16px'
                padding={theme.paddingL}
                paddingLeft='44px'
                color={theme.text}
                _focus={{
                    borderColor: theme.primary,
                    boxShadow: `0 0 0 0.1px ${theme.primary}`
                }}
                sx={{
                    '::-webkit-calendar-picker-indicator':{
                        filter: aegisTheme === 'dark' ? 'invert(1)' : '',
                        cursor:'pointer'
                    }
                }}
            />
        </Box>
    );
}
