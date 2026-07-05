import React from "react";
import { theme } from '../../themes/theme';
import { Heading, Spacer } from '@chakra-ui/react'


export default function TitleBar({children, style, titleSize='md'}) {
    return (
        <div style={{width: '100%', padding: theme.paddingL, paddingTop: 0, display: 'flex', alignItems: 'center', ...style}}>
            <Heading color={theme.primary} size={titleSize} textAlign='center'>
                ⛉Aegis
            </Heading>
            <Spacer/>
            {children}
        </div>
    );
}
