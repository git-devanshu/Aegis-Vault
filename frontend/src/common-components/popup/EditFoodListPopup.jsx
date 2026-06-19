import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, ButtonGroup, Grid, Divider, Badge } from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Dropdown from "../form/Dropdown";


export default function EditFoodListPopup({isOpen, onClose, foodList, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [updatedFoodList, setUpdatedFoodList] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        type: 'recipe',
        link: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setUpdatedFoodList(JSON.parse(JSON.stringify(foodList)));
    }, [foodList, isOpen]);

    const handleNewItemChange = e =>{
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value
        });
    }

    const addItem = e =>{
        e.preventDefault();
        if(!newItem.name.trim()) return;
        setUpdatedFoodList([
            ...updatedFoodList,
            {
                name: newItem.name,
                type: newItem.type,
                link: newItem.link
            }
        ]);
        setNewItem({
            name: '',
            type: 'recipe',
            link: ''
        });
    }

    const deleteItem = index =>{
        setUpdatedFoodList(
            updatedFoodList.filter((_, i) => i !== index)
        );
    }

    const saveFoodList = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedFoodList), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'FOOD',
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
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.FOOD} bg={theme.bg} borderColor={theme.success}>
            <Box maxHeight='350px' overflowY='auto'>
                {updatedFoodList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    updatedFoodList.map((item, index) =>
                        <Box key={index} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Flex justify='space-between' align='start' marginBottom={theme.marginS}>
                                <Flex flex={1} direction='column'>
                                    <Text color={theme.text} fontSize={theme.textSize}>
                                        {item.name}
                                    </Text>
                                    <Flex align='center' gap={theme.marginS} cursor='pointer' width='fit-content' onClick={() => window.open(item.link, '_blank')}>
                                        <ExternalLinkIcon color={theme.info}/>
                                        <Text color={theme.info} fontSize={theme.smallTextSize}>
                                            {item.type === 'recipe' ? DISPLAY.TEXT.VIEW_RECIPE : DISPLAY.TEXT.VIEW_LOCATION}
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Flex align='start' gap={theme.marginL}>
                                    <Badge borderRadius='6px' paddingX={theme.paddingL} marginTop={theme.marginS} color='#0F172A' textTransform='none' backgroundColor={item.type === 'recipe' ? theme.warning : theme.info}>
                                        {item.type === 'recipe' ? DISPLAY.TEXT.RECIPE : DISPLAY.TEXT.PLACE}
                                    </Badge>
                                    <CircleIconButton icon={<DeleteIcon/>} onClick={() => deleteItem(index)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                                </Flex>
                            </Flex>
                        </Box>
                    )
                }
            </Box>

            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.marginL} />

            <form>
                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom={theme.marginL}>
                    <InputBox label={DISPLAY.TEXT.ITEM_NAME} type='text' name='name' value={newItem.name} onChange={handleNewItemChange} maxLen={50} />
                    <Dropdown label={DISPLAY.TEXT.TYPE} value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}
                        options={[
                            {
                                label: DISPLAY.TEXT.RECIPE,
                                value: 'recipe'
                            },
                            {
                                label: DISPLAY.TEXT.PLACE,
                                value: 'place'
                            }
                        ]}
                    />
                </Grid>

                <div style={{marginTop: '-10px', marginBottom: '-10px'}}>
                    <InputBox label={DISPLAY.TEXT.LINK} type='text' name='link' value={newItem.link} onChange={handleNewItemChange} maxLen={500} />
                </div>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.marginL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveFoodList} isLoading={isLoading} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.ADD_ITEM} onClick={addItem} actionType='primary' disabled={isLoading} />
                </Grid>
            </form>
        </Popup>
    );
}