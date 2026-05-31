import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Flex, Text, InputGroup, InputLeftElement, InputRightElement, Input, IconButton, ButtonGroup, Divider } from '@chakra-ui/react';
import { AtSignIcon, LockIcon, CopyIcon, ViewIcon, ViewOffIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import ActionButton from '../form/ActionButton';


export default function PasswordCard({labels, item, hideShowPasswordButton, disablePasswordModifications, setPasswordToBeUpdated, setPasswordIdToRemove, setShowUpdatePasswordPopup, setShowDeletePasswordPopup}) {
    const {TOASTS, DISPLAY} = useLanguage();
    const [showPassword, setShowPassword] = useState(false);

    const copyUsername = () =>{
        navigator.clipboard.writeText(item.username);
        toast.success(TOASTS.PASSWORD_MANAGER.USERNAME_COPIED);
    }

    const copyPassword = () =>{
        navigator.clipboard.writeText(item.password);
        toast.success(TOASTS.PASSWORD_MANAGER.PASSWORD_COPIED);
    }

    return (
        <div style={{ border:`1px solid ${theme.border}`, borderRadius:`calc(${theme.radius} * 2)`, backgroundColor:theme.cardBg, overflow:'hidden', padding: theme.paddingL }}>
            <Flex justify='space-between' align='center'>
                <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                    {item.platform}
                </Text>

                <Text backgroundColor={theme.hoverBg} fontSize={theme.smallTextSize} fontWeight={500} color={theme.text} borderRadius='5px' padding='0 5px'>
                    {DISPLAY.PASSWORD_LABELS[labels[item.labelIndex]] || labels[item.labelIndex]}
                </Text>
            </Flex>

            <InputGroup>
                <InputLeftElement pointerEvents='none'>
                    <AtSignIcon color={theme.textSecondary} />
                </InputLeftElement>
                <Input type='text' value={item.username} color={theme.textSecondary} border='none' readOnly/>
                <InputRightElement>
                    <IconButton onClick={copyUsername} icon={<CopyIcon/>} backgroundColor='transparent' color={theme.textSecondary} _hover={{backgroundColor: 'transparent', color: theme.text}}/>
                </InputRightElement>
            </InputGroup>

            <InputGroup>
                <InputLeftElement pointerEvents='none'>
                    <LockIcon color={theme.textSecondary} />
                </InputLeftElement>
                <Input type={showPassword ? "text" : "password"} value={item.password} color={theme.textSecondary} border='none' readOnly/>
                <InputRightElement width='fit-content'>
                    {!hideShowPasswordButton && <IconButton onClick={() => setShowPassword(!showPassword)} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} backgroundColor="transparent" color={theme.textSecondary} _hover={{ backgroundColor: "transparent", color: theme.text }} /> }
                    <IconButton onClick={copyPassword} icon={<CopyIcon/>} backgroundColor='transparent' color={theme.textSecondary} _hover={{backgroundColor: 'transparent', color: theme.text}}/>
                </InputRightElement>
            </InputGroup>

            {!disablePasswordModifications && <>
                <Divider borderColor={theme.border} borderWidth='1px' />
                <ButtonGroup width='100%' marginTop={theme.marginL}>
                    <ActionButton name='Delete' icon={<DeleteIcon />} onClick={()=> {setPasswordIdToRemove(item.id); setShowDeletePasswordPopup(true);}} customStyle={{flex:1}} />
                    <ActionButton name='Edit' icon={<EditIcon />} actionType='primary' onClick={()=> {setPasswordToBeUpdated(item); setShowUpdatePasswordPopup(true);}} customStyle={{flex:1}}/>
                </ButtonGroup>
            </>}
        </div>
    );
}
