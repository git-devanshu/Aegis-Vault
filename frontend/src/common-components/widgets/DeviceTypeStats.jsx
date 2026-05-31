import React from 'react';
import { Text, Flex } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import { IoDesktopOutline } from "react-icons/io5";
import { HiMiniDevicePhoneMobile } from "react-icons/hi2";
import useLanguage from '../../hooks/useLanguage';


export default function DeviceTypeStats({sessions}) {
    const {DISPLAY} = useLanguage();

    function getDesktopSessions(){
        return sessions.filter(session =>
            session.deviceType === 'desktop'
        ).length;
    }
    
    function getMobileSessions(){
        return sessions.filter(session =>
            session.deviceType === 'mobile'
        ).length;
    }

    return (
        <Flex gap={theme.paddingL} wrap='wrap' width='100%'>
            <Flex flex='1' bg={theme.primary} minWidth='130px' border={`1px solid ${theme.primary}`} borderRadius={`calc(${theme.radius} * 2)`} p={theme.paddingL} direction='column' justify='space-between'>
                <Flex alignItems='center'>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px'}}>
                        <HiMiniDevicePhoneMobile size='22px' color={theme.text} />
                    </div>
                    <Text color='#0F172A' fontSize={theme.textSize} fontWeight={500} marginLeft={theme.marginL}>
                        {DISPLAY.TEXT.MOBILE_SESSIONS}
                    </Text>
                </Flex>
                
                <Text color='#0F172A' fontSize='36px' fontWeight={600} marginLeft={theme.marginS}>
                    {getMobileSessions()}
                </Text>
            </Flex>

            <Flex flex='1' bg={theme.cardBg} minWidth='130px' border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} p={theme.paddingL} direction='column' justify='space-between'>
                <Flex alignItems='center'>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '8px'}}>
                        <IoDesktopOutline size='20px' color={theme.text} />
                    </div>
                    <Text color={theme.text} fontSize={theme.textSize} marginLeft={theme.marginL}>
                        {DISPLAY.TEXT.DESKTOP_SESSIONS}
                    </Text>
                </Flex>
                <Text color={theme.text} fontSize='36px' fontWeight={600} marginLeft={theme.marginS}>
                    {getDesktopSessions()}
                </Text>
            </Flex>
        </Flex>
    );
}
