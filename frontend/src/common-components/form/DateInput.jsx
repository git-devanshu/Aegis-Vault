import { Input, Text } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useTheme from '../../hooks/useTheme';

export default function DateInput({value, onChange, name='date', min=null, max=null, label=''}) {
    const {aegisTheme} = useTheme();

    return (
        <div style={{width:'100%', position:'relative', marginTop:theme.marginL, marginBottom:theme.spacing}}>
            <Text fontSize={theme.smallTextSize} color={theme.textSecondary} style={{position:'absolute', top:'-12px', left:'12px', background:theme.bg, padding:'0px 6px', zIndex:1}}>
                {label}
            </Text>

            <Input variant='unstyled' type='date' name={name} value={value} onChange={onChange} min={min} max={max}
                backgroundColor={theme.bg} color={theme.text} marginBottom={theme.spacing} padding={theme.paddingL} paddingLeft='15px'
                border={`1px solid ${theme.border}`} borderRadius='16px' focusBorderColor={theme.primary}
                _focus={{
                    borderColor: theme.primary,
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
