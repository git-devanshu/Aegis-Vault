import { Input } from '@chakra-ui/react';
import { theme } from '../../themes/theme';

export default function DateInput({value, onChange, name='date', min=null, max=null}) {
    return (
        <Input type='date'
            name={name}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            backgroundColor={theme.bg}
            color={theme.text}
            height='45.4px'
            marginTop={theme.marginL}
            marginBottom={theme.spacing}
            border={`1px solid ${theme.border}`}
            borderRadius='16px'
            focusBorderColor={theme.primary}
            _hover={{backgroundColor: theme.hoverBg}}
            _focus={{
                borderColor: theme.primary,
                boxShadow:`0 0 0 0.1px ${theme.primary}`
            }}
            sx={{
                '::-webkit-calendar-picker-indicator':{
                    filter:'invert(1)',
                    cursor:'pointer'
                }
            }}
        />
    );
}
