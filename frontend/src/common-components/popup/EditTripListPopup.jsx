import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, Grid, Divider, Checkbox, Textarea } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Tickbox from "../form/Tickbox";


export default function EditTripListPopup({isOpen, onClose, tripList, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [updatedTripList, setUpdatedTripList] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        notes: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setUpdatedTripList(JSON.parse(JSON.stringify(tripList)));
    }, [tripList, isOpen]);

    const handleNewItemChange = e =>{
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value
        });
    }

    const addItem = e =>{
        e.preventDefault();
        if(!newItem.name.trim()) return;
        setUpdatedTripList([
            ...updatedTripList,
            {
                name: newItem.name,
                notes: newItem.notes,
                checked: false
            }
        ]);
        setNewItem({
            name: '',
            notes: ''
        });
    }

    const toggleChecked = index =>{
        setUpdatedTripList(
            updatedTripList.map((item, i) =>
                i === index ? {...item, checked: !item.checked} : item
            )
        );
    }

    const deleteItem = index =>{
        setUpdatedTripList(
            updatedTripList.filter((_, i) => i !== index)
        );
    }

    const saveTripList = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedTripList), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'TRIP',
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
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.TRIP} bg={theme.bg} borderColor={theme.success}>
            <Box maxHeight='350px' overflowY='auto'>
                {updatedTripList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    updatedTripList.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Tickbox isChecked={item.checked} onChange={() => toggleChecked(index)} marginTop={theme.marginL}/>

                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} noOfLines={2}>
                                    {item.notes}
                                </Text>
                            </Flex>

                            <CircleIconButton icon={<DeleteIcon/>} onClick={() => deleteItem(index)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                        </Flex>
                    )
                }
            </Box>

            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.spacing} />

            <form>
                <div style={{marginBottom: '-10px'}}>
                    <InputBox label={DISPLAY.TEXT.DESTINATION} type='text' name='name' value={newItem.name} onChange={handleNewItemChange} maxLen={60} />
                </div>

                <Textarea
                    name='notes'
                    value={newItem.notes}
                    placeholder={DISPLAY.TEXT.NOTES}
                    onChange={handleNewItemChange}
                    resize='none'
                    height='70px'
                    maxLength={250}
                    backgroundColor={theme.bg}
                    border={`1px solid ${theme.border}`}
                    borderRadius={`calc(2 * ${theme.radius})`}
                    color={theme.text}
                    _hover={{borderColor: theme.border, boxShadow: 'none'}}
                    _focus={{borderColor: theme.primary, boxShadow: 'none'}}
                />

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.marginL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveTripList} isLoading={isLoading} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.ADD_ITEM} onClick={addItem} actionType='primary' disabled={isLoading} />
                </Grid>
            </form>
        </Popup>
    );
}