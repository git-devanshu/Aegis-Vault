import { Select } from '@chakra-ui/react';
import { theme } from '../../themes/theme';

export default function Dropdown({value, onChange, options, placeholder=null}) {
    return (
        <Select value={value} onChange={onChange} backgroundColor={theme.bg} color={theme.text} size='md' marginTop={theme.marginL} marginBottom={theme.spacing} 
            border={`1px solid ${theme.border}`} borderRadius='16px' focusBorderColor={theme.primary} 
            _hover={{ backgroundColor: theme.hoverBg}}
            _focus={{ borderColor:theme.primary, boxShadow:`0 0 0 0.1px ${theme.primary}` }}
        >
            {placeholder && 
                <option value='' style={{ backgroundColor:theme.bg, color:theme.text }}>
                    {placeholder}
                </option>
            }
            {
                options.map(option => (
                    <option key={option.value} value={option.value} style={{ backgroundColor:theme.bg, color:theme.text }}>
                        {option.label}
                    </option>
                ))
            }
        </Select>
    );
}
