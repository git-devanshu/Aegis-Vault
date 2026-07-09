import React from 'react'
import { theme } from '../../themes/theme';
import { IconButton, Tooltip, useBreakpointValue } from '@chakra-ui/react'

export default function CircleIconButton({icon, onClick, actionType, tooltip, ttPlacement='bottom', customStyle, iconSize='16px', forSidebar=false, sidebarIconSize}) {
    const isMobileDevice = useBreakpointValue({ base: true, md: false });

    return (
        <Tooltip isDisabled={isMobileDevice} label={tooltip} backgroundColor={theme.hoverBg} color={theme.textSecondary} placement={ttPlacement} hasArrow autoFocus={false}>
            <IconButton icon={icon} onClick={onClick} borderRadius='20px' fontSize={(forSidebar && isMobileDevice) ? sidebarIconSize : iconSize}
                backgroundColor={actionType === 'primary' ? theme.primary : (forSidebar && isMobileDevice) ? theme.cardBg : theme.bg} 
                color={actionType === 'primary' ? '#0F172A' : theme.textSecondary}
                border={`1px solid ${actionType === 'primary' ? theme.primary : (forSidebar && isMobileDevice) ? theme.cardBg : theme.border}`}
                _hover={actionType === 'primary' ? 
                    {backgroundColor: theme.accent, borderColor: theme.accent} : 
                    {backgroundColor: theme.cardBg}
                }
                style={customStyle}
            />
        </Tooltip>
    );
}
