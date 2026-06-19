import { theme } from '../../themes/theme';
import { Checkbox } from "@chakra-ui/react";


export default function Tickbox(props){
    return (
        <Checkbox {...props}
            sx={{
                '.chakra-checkbox__control': {
                    borderColor: theme.textSecondary,
                    backgroundColor: theme.cardBg
                },
                '.chakra-checkbox__control[data-checked]': {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                    color: '#0F172A'
                },
                '.chakra-checkbox__control[data-checked]:hover': {
                    backgroundColor: theme.accent,
                    borderColor: theme.accent
                }
            }}
        />
    );
}