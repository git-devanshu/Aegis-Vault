import React from "react";
import { Text, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../themes/theme';
import ActionButton from '../common-components/form/ActionButton';
import useLanguage from "../hooks/useLanguage";

export default function NotFound() {
    const {DISPLAY} = useLanguage();
    const navigate = useNavigate();

    return(
        <div className="common-page">
            <div className="common-container">
                <Heading color={theme.primary} size='xl' textAlign='center' marginBottom={theme.spacing} marginTop={`calc(3 * ${theme.spacing})`}>
                    404
                </Heading>

                <Text color={theme.text} fontSize={theme.headingSize} textAlign='center' marginBottom={theme.spacing}>{DISPLAY.TEXT.PAGE_NOT_FOUND}</Text>
                <Text fontSize={theme.textSize} color={theme.textSecondary} textAlign='center' marginTop={theme.marginL}>{DISPLAY.TEXT.NO_PAGE_EXIST}</Text>

                <ActionButton name={DISPLAY.BUTTONS.GO_TO_HOME} onClick={()=> navigate('/', {replace: true})} actionType='primary' customStyle={{marginTop: theme.spacing}}/>
            </div>
        </div>
    );
}