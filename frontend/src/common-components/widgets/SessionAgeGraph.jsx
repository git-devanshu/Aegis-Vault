import React from 'react';
import { Text, Flex, useMediaQuery, Tooltip } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import InfoTooltip from '../popup/InfoTooltip';


export default function SessionAgeGraph({sessions}) {
    const {DISPLAY} = useLanguage();
    const [isLargeScreen] = useMediaQuery('(min-width: 910px)');

    const MAX_SESSIONS = 6;

    function getSessionAgePercent(createdAt){
        const diff = Date.now() - new Date(createdAt).getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return Math.min((days / 30) * 100, 100);
    }

    function getSessionAgeText(createdAt){
        const diff = Date.now() - new Date(createdAt).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if(days < 1){
            const hours = Math.floor(diff / (1000 * 60 * 60));
            return `${hours}h`;
        }
        return `${days}d`;
    }

    return (
        <Flex direction='column' border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} p={theme.paddingL} width={isLargeScreen ? 'fit-content' : '100%'}>
            <Flex align='start' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginS}>
                    {DISPLAY.TEXT.SESSION_AGE}
                </Text>
                <InfoTooltip label={DISPLAY.TOOLTIPS.SESSION_VALIDITY}>
                    <InfoOutlineIcon color={theme.text}/>
                </InfoTooltip>
            </Flex>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginBottom={theme.marginS}>
                {DISPLAY.TEXT.SESSION_AGE_INFO}
            </Text>

            <Flex align='flex-end' justify='space-between' height='190px' gap={theme.paddingL}>
                {
                    Array.from({length:MAX_SESSIONS}).map((_, index)=>{
                        const session = sessions[index];
                        if(!session){
                            return (
                                <Flex key={index} direction='column' align='center' gap={theme.paddingS} flex='1'>
                                    <InfoTooltip label={DISPLAY.TOOLTIPS.NO_ACTIVE_SESSION} placement='top'>
                                        <div style={{height:'150px', width:'40px', backgroundColor:theme.hoverBg, borderRadius:'10px'}} />
                                    </InfoTooltip>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>-</Text>
                                </Flex>
                            );
                        }

                        const height = getSessionAgePercent(session.createdAt);

                        return (
                            <Flex key={session._id} direction='column' align='center' gap={theme.paddingS} flex='1'>
                                <InfoTooltip label={session.device} placement='top'>
                                    <div style={{height:'150px', width:'40px', backgroundColor:theme.accent, borderRadius:'10px', position:'relative', overflow:'hidden'}}>
                                        <div style={{position:'absolute', bottom:'0', left:'0', width:'100%', height:`${height}%`, backgroundColor:theme.primary, borderRadius:'10px', transition:'0.5s'}} />
                                    </div>
                                </InfoTooltip>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {getSessionAgeText(session.createdAt)}
                                </Text>
                            </Flex>
                        );
                    })
                }
            </Flex>
        </Flex>
    );
}
