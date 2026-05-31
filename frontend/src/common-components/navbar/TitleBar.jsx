import React from "react";
import { theme } from '../../themes/theme';
import { Heading, Spacer } from '@chakra-ui/react'


export default function TitleBar({children}) {
    return (
        <div style={{width: '100%', padding: theme.paddingL, paddingTop: 0, display: 'flex', alignItems: 'center'}}>
            <Heading color={theme.primary} size='md' textAlign='center'>
                ⛉Aegis
            </Heading>
            <Spacer/>
            {children}
        </div>
    );
}
