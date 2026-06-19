import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, Grid, Divider, Badge, Checkbox } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import DateInput from "../form/DateInput";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Dropdown from "../form/Dropdown";
import Tickbox from "../form/Tickbox";


export default function EditTodoListPopup({isOpen, onClose, todoList, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [updatedTodoList, setUpdatedTodoList] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        priority: 'medium',
        due: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setUpdatedTodoList(JSON.parse(JSON.stringify(todoList)));
    }, [todoList]);

    const handleNewItemChange = e =>{
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value
        });
    }

    const addItem = e =>{
        e.preventDefault();
        if(!newItem.name.trim()) return;
        setUpdatedTodoList([
            ...updatedTodoList,
            {
                name: newItem.name,
                priority: newItem.priority,
                due: newItem.due,
                checked: false
            }
        ]);
        setNewItem({
            name: '',
            priority: 'medium',
            due: ''
        });
    }

    const toggleChecked = index =>{
        setUpdatedTodoList(
            updatedTodoList.map((item, i) =>
                i === index ? {...item, checked: !item.checked} : item
            )
        );
    }

    const deleteItem = index =>{
        setUpdatedTodoList(
            updatedTodoList.filter((_, i) => i !== index)
        );
    }

    const saveTodoList = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedTodoList), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'TODO',
                    collectionData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: () =>{
                    setRefreshCollections(!refreshCollections);
                    onClose(false);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id: toastId});
            setIsLoading(false);
        }
    }

    const getPriorityBadge = priority =>{
        return (
            <Badge
                borderRadius='6px'
                paddingX={theme.paddingL}
                color='#0F172A'
                textTransform='none'
                backgroundColor={
                    priority === 'high' ? theme.error
                        : priority === 'medium' ? theme.warning : theme.success
                }
            >
                {
                    priority === 'high' ? DISPLAY.TEXT.HIGH
                        : priority === 'medium' ? DISPLAY.TEXT.MEDIUM : DISPLAY.TEXT.LOW
                }
            </Badge>
        );
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.TODO} bg={theme.bg} borderColor={theme.success}>
            <Box maxHeight='350px' overflowY='auto'>
                {updatedTodoList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    updatedTodoList.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Tickbox isChecked={item.checked} onChange={() => toggleChecked(index)} marginTop={theme.marginL}/>

                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>

                                <Flex align='center' gap={theme.marginS} marginTop='2px'>
                                    {getPriorityBadge(item.priority)}
                                    {item.due &&
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                            {new Date(item.due).toLocaleDateString()}
                                        </Text>
                                    }
                                </Flex>
                            </Flex>

                            <CircleIconButton icon={<DeleteIcon/>} onClick={() => deleteItem(index)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                        </Flex>
                    )
                }
            </Box>

            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.spacing} />

            <form>
                <InputBox label={DISPLAY.TEXT.ITEM_NAME} type='text' name='name' value={newItem.name} onChange={handleNewItemChange} maxLen={60} />

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop='-10px' marginBottom='-25px'>
                    <Dropdown
                        label={DISPLAY.TEXT.PRIORITY}
                        value={newItem.priority}
                        onChange={e => setNewItem({...newItem, priority: e.target.value})}
                        options={[
                            {label: DISPLAY.TEXT.LOW, value: 'low'},
                            {label: DISPLAY.TEXT.MEDIUM, value: 'medium'},
                            {label: DISPLAY.TEXT.HIGH, value: 'high'}
                        ]}
                    />

                    <DateInput label={DISPLAY.TEXT.DUE_DATE} name='due' value={newItem.due} onChange={handleNewItemChange}/>
                </Grid>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveTodoList} isLoading={isLoading} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.ADD_ITEM} onClick={addItem} actionType='primary' disabled={isLoading} />
                </Grid>
            </form>
        </Popup>
    );
}