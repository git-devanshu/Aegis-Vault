import React from 'react'
import { theme } from '../../themes/theme';
import { HStack, PinInput, PinInputField, Text } from '@chakra-ui/react'
import useLanguage from '../../hooks/useLanguage';

export default function PinInputBox({value, onChange, mask, autoFocus, onKeyDown, required}) {
    const { DISPLAY } = useLanguage();
    
    return (
        <div style={{display: 'grid', placeItems: 'center', marginTop: theme.marginL, marginBottom: theme.spacing, width:'100%', position:'relative', border:`1px solid ${theme.border}`, borderRadius:'16px'}}
            onFocus={(e)=>{
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.boxShadow = `0 0 0 0.5px ${theme.primary}`;
            }}
            onBlur={(e)=>{
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{position:'absolute', top:'-12px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1}}>
                {DISPLAY.LABELS.SECURITY_PIN}
            </Text>
            <HStack py={theme.paddingS} color={theme.text}>
                <PinInput type="number" value={value} onChange={onChange} mask={mask} autoFocus={autoFocus} required={required} variant='unstyled'>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField onKeyDown={onKeyDown}/>
                </PinInput>
            </HStack>
        </div>
    );
}
