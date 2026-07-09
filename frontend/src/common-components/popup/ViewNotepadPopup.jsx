import React from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";

import { ButtonGroup, Textarea } from '@chakra-ui/react';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";


export default function ViewNotepadPopup({isOpen, onClose, notepad}) {
    const {DISPLAY, TOASTS} = useLanguage();

    const copyData = async(e) =>{
        await navigator.clipboard.writeText(notepad?.data || '');
        toast.success(TOASTS.PLANNING_MANAGER.DATA_COPIED);
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.NOTEPAD} bg={theme.bg} borderColor={theme.info} takeFullHeight={true}>
            <Textarea
                value={notepad?.data}
                isReadOnly
                resize='vertical'
                height='calc(100% - 50px)'
                backgroundColor={theme.cardBg}
                border={`1px solid ${theme.border}`}
                borderRadius={`calc(2 * ${theme.radius})`}
                color={theme.text}
                _hover={{borderColor: theme.border, boxShadow: 'none'}}
                _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                overflowY='scroll'
            />

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.COPY_DATA} onClick={copyData} actionType='primary' disabled={!notepad?.data?.trim()} />
            </ButtonGroup>
        </Popup>
    );
}
