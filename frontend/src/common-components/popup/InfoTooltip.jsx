import { Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody } from '@chakra-ui/react';
import { theme } from '../../themes/theme';


export default function InfoTooltip({label, children, placement='bottom'}) {
    return (
        <Popover trigger='click' placement={placement} autoFocus={false}>
            <PopoverTrigger>
                <div style={{display:'flex', alignItems:'center', width:'fit-content'}}>
                    {children}
                </div>
            </PopoverTrigger>

            <PopoverContent bg={theme.hoverBg} width='fit-content' maxWidth='250px'>
                <PopoverArrow bg={theme.hoverBg} />
                <PopoverBody color={theme.textSecondary} fontSize={theme.smallTextSize} padding={theme.paddingS}>
                    {label}
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
}
