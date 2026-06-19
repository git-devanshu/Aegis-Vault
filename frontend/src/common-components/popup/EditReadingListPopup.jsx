import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, Grid, Divider, Badge, Checkbox, Textarea } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { SiMdbook } from "react-icons/si";
import { RiArticleLine } from "react-icons/ri";
import { FaRegFileAlt } from "react-icons/fa";

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Dropdown from "../form/Dropdown";


export default function EditReadingListPopup({isOpen, onClose, readingList, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [updatedReadingList, setUpdatedReadingList] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        type: 'book',
        notes: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setUpdatedReadingList(JSON.parse(JSON.stringify(readingList)));
    }, [readingList]);

    const handleNewItemChange = e =>{
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value
        });
    }

    const addItem = e =>{
        e.preventDefault();
        if(!newItem.name.trim()) return;
        setUpdatedReadingList([
            ...updatedReadingList,
            {
                name: newItem.name,
                type: newItem.type,
                notes: newItem.notes,
                checked: false
            }
        ]);
        setNewItem({
            name: '',
            type: 'book',
            notes: ''
        });
    }

    const toggleChecked = index =>{
        setUpdatedReadingList(
            updatedReadingList.map((item, i) =>
                i === index ? {...item, checked: !item.checked} : item
            )
        );
    }

    const deleteItem = index =>{
        setUpdatedReadingList(
            updatedReadingList.filter((_, i) => i !== index)
        );
    }

    const getTypeIcon = type =>{
        switch(type){
            case 'book': return <SiMdbook size='26px' color={theme.text}/>;
            case 'article': return <RiArticleLine size='26px' color={theme.text}/>;
            case 'other': return <FaRegFileAlt size='24px' color={theme.text}/>;
            default: return <SiMdbook size='26px' color={theme.text}/>;
        }
    }

    const saveReadingList = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedReadingList), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'READING',
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
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.READING_LIST} bg={theme.bg} borderColor={theme.success}>
            <Box maxHeight='350px' overflowY='auto'>
                {updatedReadingList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    updatedReadingList.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Box marginTop='2px'>
                                {getTypeIcon(item.type)}
                            </Box>

                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} noOfLines={2}>
                                    {item.notes}
                                </Text>
                            </Flex>

                            <Flex align='start' gap={theme.marginL}>
                                <Checkbox isChecked={item.checked} onChange={() => toggleChecked(index)} marginTop={theme.marginL}/>
                                <CircleIconButton icon={<DeleteIcon/>} onClick={() => deleteItem(index)} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                            </Flex>
                        </Flex>
                    )
                }
            </Box>

            <Divider borderColor={theme.border} borderWidth='1px' marginBottom={theme.marginL} />

            <form>
                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom='-10px'>
                    <InputBox label={DISPLAY.TEXT.ITEM_NAME} type='text' name='name' value={newItem.name} onChange={handleNewItemChange} maxLen={60} />
                    <Dropdown
                        label={DISPLAY.TEXT.TYPE}
                        value={newItem.type}
                        onChange={e => setNewItem({...newItem, type: e.target.value})}
                        options={[
                            {label: DISPLAY.TEXT.BOOK, value: 'book'},
                            {label: DISPLAY.TEXT.ARTICLE, value: 'article'},
                            {label: DISPLAY.TEXT.OTHER, value: 'other'}
                        ]}
                    />
                </Grid>

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
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveReadingList} isLoading={isLoading} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.ADD_ITEM} onClick={addItem} actionType='primary' disabled={isLoading} />
                </Grid>
            </form>
        </Popup>
    );
}