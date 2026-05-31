import React from 'react'
import { theme } from '../../themes/theme';
import { Button } from '@chakra-ui/react'

export default function ActionButton({name, onClick, isLoading, disabled, actionType, icon, customStyle}) {
    return (
        <Button leftIcon={icon} onClick={onClick} isLoading={isLoading} disabled={disabled} width='full' borderRadius='20px'
            backgroundColor={actionType === 'primary' ? theme.primary : theme.bg} 
            color={actionType === 'primary' ? '#0F172A' : theme.textSecondary}
            border={`2px solid ${actionType === 'primary' ? theme.primary : theme.border}`}
            type={actionType === 'primary' ? 'submit' : 'button'}
            _hover={actionType === 'primary' ? 
                {backgroundColor: theme.accent, borderColor: theme.accent} : 
                {backgroundColor: theme.cardBg}
            }
            style={customStyle}
        >
            {name}
        </Button>
    );
}
