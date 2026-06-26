import React from "react";
import { theme } from '../themes/theme';
import { Heading, Spacer } from '@chakra-ui/react'


export default function TitleBar({children}) {
    return (
        <div style={{width: '100%', paddingBottom: theme.paddingL, display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Heading color={theme.primary} size='sm' textAlign='center'>
                ⛉Aegis
            </Heading>
            <Spacer/>
            {children}
        </div>
    );
}
