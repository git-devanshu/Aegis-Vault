import React from 'react'
import { theme } from '../../themes/theme';
import { IconButton, Tooltip } from '@chakra-ui/react'

export default function CircleIconButton({icon, onClick, actionType, tooltip, ttPlacement='bottom', customStyle, iconSize='16px'}) {
    return (
        <Tooltip label={tooltip} backgroundColor={theme.hoverBg} color={theme.textSecondary} placement={ttPlacement} hasArrow autoFocus={false}>
            <IconButton icon={icon} onClick={onClick} borderRadius='20px' fontSize={iconSize}
                backgroundColor={actionType === 'primary' ? theme.primary : theme.bg} 
                color={actionType === 'primary' ? '#0F172A' : theme.textSecondary}
                border={`2px solid ${actionType === 'primary' ? theme.primary : theme.border}`}
                _hover={actionType === 'primary' ? 
                    {backgroundColor: theme.accent, borderColor: theme.accent} : 
                    {backgroundColor: theme.cardBg}
                }
                style={customStyle}
            />
        </Tooltip>
    );
}
