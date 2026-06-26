import React from 'react'
import { theme } from '../../themes/theme';
import { Input, Text } from '@chakra-ui/react'
import useTheme from '../../hooks/useTheme';

export default function InputBox({type, placeholder, label, name, value, onChange, required, readOnly, minLen, maxLen, min, max}) {
    const {aegisTheme} = useTheme();

    return (
        <div style={{width:'100%', position:'relative', marginTop:theme.marginL, marginBottom:theme.spacing}}>
            <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{position:'absolute', top:'-10px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1}}>
                {label}
            </Text>

            <Input variant='unstyled' size='sm' fontSize={theme.textSize}
                type={type} placeholder={placeholder} name={name} value={value} onChange={onChange} required={required} readOnly={readOnly} minLength={minLen} maxLength={maxLen} min={min} max={max}
                width='100%' border={`1px solid ${theme.border}`} borderRadius='12px' padding={theme.paddingS} paddingLeft='12px' color={theme.text}
                _focus={{
                    borderColor:theme.primary,
                    boxShadow:`0 0 0 0.1px ${theme.primary}`
                }}
                sx={{
                    '::-webkit-calendar-picker-indicator':{
                        filter: aegisTheme === 'dark' ? 'invert(1)' : '',
                        cursor:'pointer'
                    }
                }}
            />
        </div>
    );
}
