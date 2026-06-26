import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';

import { Badge, Button, Divider, Flex, Text } from '@chakra-ui/react';
import { IoDesktopOutline } from "react-icons/io5";
import { HiMiniDevicePhoneMobile } from "react-icons/hi2";
import { BiSolidExtension } from "react-icons/bi";
import { getSessionExpiry } from "../../utility/helpers";

import ActionButton from "../form/ActionButton";


export default function SessionCard({session, currentSessionId, onTerminate}) {
    const {DISPLAY, TOASTS} = useLanguage();

    function getLastSeenText() {
        const diff = Date.now() - new Date(session.lastSeenAt).getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if(minutes < 1) return DISPLAY.TEXT.MOMENT_AGO;
        if(minutes < 60) return `${minutes}m ${DISPLAY.TEXT.AGO}`;
        if(hours < 24) return `${hours}h ${DISPLAY.TEXT.AGO}`;
        return `${days}d ${DISPLAY.TEXT.AGO}`;
    }

    function isNewSession(createdAt){
        const diff = Date.now() - new Date(createdAt).getTime();
        return diff <= 60 * 60 * 1000;
    }

    return (
        <Flex direction='column' gap={theme.paddingL} bg={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={`calc(${theme.radius} * 2)`} p={theme.paddingL} width='100%'>
            <Flex align='center' gap={theme.paddingL}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.hoverBg, borderRadius: theme.radius, padding: theme.paddingL}}>
                    {
                        session.deviceType === 'desktop' ? <IoDesktopOutline size='25px' color={theme.textSecondary} /> 
                        : session.deviceType === 'extension' ? <BiSolidExtension size='25px' color={theme.textSecondary} /> : <HiMiniDevicePhoneMobile size='25px' color={theme.textSecondary} />
                    }
                </div>

                <Flex direction='column'>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                        {session.device}
                    </Text>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.LOCATION}: {session.deviceLocation}
                    </Text>
                </Flex>
            </Flex>

            <Divider borderColor={theme.border} borderWidth='1px' />

            <Flex direction='column' gap='2px'>
                <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginS} marginLeft={theme.marginS}>
                    {DISPLAY.TEXT.LAST_SEEN}: {getLastSeenText()}
                    {currentSessionId === session._id && 
                        <span style={{color: '#0F172A', fontSize: theme.smallTextSize, backgroundColor: theme.primary, borderRadius: '5px', padding: '1px 3px 2px 3px', marginLeft: theme.marginL, fontWeight: 500}}>{DISPLAY.TEXT.CURRENT_DEVICE}</span>
                    }
                </Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginS}>
                    {DISPLAY.TEXT.LOGGED_IN}: {new Date(session.createdAt).toLocaleString('en-GB')}
                    {isNewSession(session.createdAt) && 
                        <span style={{color: theme.text, fontSize: theme.smallTextSize, backgroundColor: theme.hoverBg, borderRadius: '5px', padding: '1px 5px 2px 5px', marginLeft: theme.marginL, fontWeight: 500}}>{DISPLAY.TEXT.NEW}</span>
                    }
                </Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginLeft={theme.marginS}>
                    {DISPLAY.TEXT.EXPIRY}: {getSessionExpiry(session.createdAt)}
                </Text>
            </Flex>
            
            <ActionButton name={DISPLAY.BUTTONS.TERMINATE} onClick={onTerminate} />
        </Flex>
    );
}
