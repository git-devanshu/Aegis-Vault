import React from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";

import { Text, ButtonGroup, Box } from '@chakra-ui/react';

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
            <Box height='calc(100% - 50px)' overflowY='auto' backgroundColor={theme.cardBg} borderRadius={theme.radius} padding={theme.paddingL}>
                {
                    notepad?.data?.trim() ? 
                        <Text color={theme.text} whiteSpace='pre-wrap'>
                            {notepad.data}
                        </Text>
                        : <div style={{width:'100%', display:'flex', justifyContent:'center'}}>
                            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                                {DISPLAY.TEXT.NO_DATA}
                            </Text>
                        </div>
                }
            </Box>

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.COPY_DATA} onClick={copyData} actionType='primary' disabled={!notepad?.data?.trim()} />
            </ButtonGroup>
        </Popup>
    );
}
