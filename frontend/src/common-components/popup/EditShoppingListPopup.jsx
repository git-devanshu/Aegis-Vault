import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, ButtonGroup, Grid, Divider } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Tickbox from "../form/Tickbox";


export default function EditShoppingListPopup({isOpen, onClose, shoppingList, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [updatedShoppingList, setUpdatedShoppingList] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setUpdatedShoppingList(JSON.parse(JSON.stringify(shoppingList)));
    }, [shoppingList, isOpen]);

    const handleNewItemChange = e =>{
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value
        });
    }

    const addItem = e =>{
        e.preventDefault();
        if(!newItem.name.trim()) return;
        setUpdatedShoppingList([
            ...updatedShoppingList,
            {
                name: newItem.name,
                quantity: newItem.quantity,
                checked: false
            }
        ]);
        setNewItem({
            name: '',
            quantity: ''
        });
    }

    const toggleChecked = index =>{
        setUpdatedShoppingList(
            updatedShoppingList.map((item, i) =>
                i === index ? {...item, checked: !item.checked} : item
            )
        );
    }

    const deleteItem = index =>{
        setUpdatedShoppingList(
            updatedShoppingList.filter((_, i) => i !== index)
        );
    }

    const saveShoppingList = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedShoppingList), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'SHOPPING',
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

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.SHOPPING_LIST} bg={theme.bg} borderColor={theme.success}>
            <Box maxHeight='350px' overflowY='auto'>
                {updatedShoppingList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom: theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    updatedShoppingList.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Tickbox isChecked={item.checked} onChange={() => toggleChecked(index)} marginTop={theme.marginS}/>
                            <Flex flex={1} direction='column'>
                                <Text color={item.checked ? theme.textSecondary : theme.text} fontSize={theme.textSize} textDecoration={item.checked ? 'line-through' : 'none'}>
                                    {item.name}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {item.quantity}
                                </Text>
                            </Flex>

                            <CircleIconButton icon={<DeleteIcon/>} onClick={() => deleteItem(index)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                        </Flex>
                    )
                }
            </Box>

            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.marginL} />

            <form style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.paddingL, marginBottom: theme.marginS}}>
                <div style={{marginBottom: '-20px'}}>
                    <InputBox label={DISPLAY.TEXT.ITEM_NAME} type='text' name='name' value={newItem.name} onChange={handleNewItemChange} maxLen={30} />
                </div>
                <div style={{marginBottom: '-20px'}}>
                    <InputBox label={DISPLAY.TEXT.QUANTITY} type='text' name='quantity' value={newItem.quantity} onChange={handleNewItemChange} maxLen={20} />
                </div>

                <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveShoppingList} isLoading={isLoading} disabled={isLoading} />
                <ActionButton name={DISPLAY.BUTTONS.ADD_ITEM} onClick={addItem} actionType='primary' disabled={isLoading} />
            </form>
        </Popup>
    );
}
