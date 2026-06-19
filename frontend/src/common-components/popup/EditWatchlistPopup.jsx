import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Flex, Text, Box, ButtonGroup, Grid, Divider, Badge } from '@chakra-ui/react';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { MdLocalMovies, MdLiveTv } from "react-icons/md";
import { GiNinjaHead } from "react-icons/gi";
import { FaYoutube } from "react-icons/fa";

import Popup from "../popup/Popup";
import InputBox from "../form/InputBox";
import ActionButton from "../form/ActionButton";
import CircleIconButton from "../form/CircleIconButton";
import Dropdown from "../form/Dropdown";
import Tickbox from "../form/Tickbox";


export default function EditWatchlistPopup({isOpen, onClose, watchlist, refreshCollections, setRefreshCollections}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [updatedWatchlist, setUpdatedWatchlist] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        type: 'movie',
        rating: '',
        category: 'general'
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() =>{
        setUpdatedWatchlist(JSON.parse(JSON.stringify(watchlist)));
    }, [watchlist]);

    const handleNewItemChange = e =>{
        setNewItem({
            ...newItem,
            [e.target.name]: e.target.value
        });
    }

    const addItem = e =>{
        e.preventDefault();

        if(!newItem.name.trim()) return;

        setUpdatedWatchlist([
            ...updatedWatchlist,
            {
                name: newItem.name,
                type: newItem.type,
                rating: newItem.rating,
                category: newItem.category,
                checked: false
            }
        ]);

        setNewItem({
            name: '',
            type: 'movie',
            rating: '',
            category: 'general'
        });
    }

    const toggleChecked = index =>{
        setUpdatedWatchlist(
            updatedWatchlist.map((item, i) =>
                i === index ? {...item, checked: !item.checked} : item
            )
        );
    }

    const deleteItem = index =>{
        setUpdatedWatchlist(
            updatedWatchlist.filter((_, i) => i !== index)
        );
    }

    const getTypeIcon = type =>{
        switch(type){
            case 'movie': return <MdLocalMovies size='28px' color={theme.text}/>;
            case 'series': return <MdLiveTv size='28px' color={theme.text}/>;
            case 'anime': return <GiNinjaHead size='28px' color={theme.text}/>;
            case 'video': return <FaYoutube size='28px' color={theme.text}/>;
            default: return <MdLocalMovies size='28px' color={theme.text}/>;
        }
    }

    const saveWatchlist = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        if(!toastId) return;
        try{
            const {encryptedData: collectionData, nonce} = await encryptData(JSON.stringify(updatedWatchlist), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/pl/collections',
                data: {
                    type: 'WATCHLIST',
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
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.WATCHLIST} bg={theme.bg} borderColor={theme.success}>
            <Box maxHeight='350px' overflowY='auto'>
                {updatedWatchlist.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    updatedWatchlist.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={item.category === 'personal' ? theme.accent : theme.cardBg} borderRadius={theme.radius}>
                            <Box marginTop='2px'>
                                {getTypeIcon(item.type)}
                            </Box>

                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>
                                <Flex align='center' gap={theme.marginS}>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginRight={theme.marginL}>
                                        {item.type}
                                    </Text>
                                    <StarIcon color='#EAB308'/>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                        {item.rating || '-'}
                                    </Text>
                                </Flex>
                            </Flex>

                            <Flex align='start' gap={theme.marginL}>
                                <Tickbox isChecked={item.checked} marginTop={theme.marginL} onChange={() => toggleChecked(index)}/>
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
                            {label: DISPLAY.TEXT.MOVIE, value: 'movie'},
                            {label: DISPLAY.TEXT.SERIES, value: 'series'},
                            {label: DISPLAY.TEXT.ANIME, value: 'anime'},
                            {label: DISPLAY.TEXT.VIDEO, value: 'video'}
                        ]}
                    />
                </Grid>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom='-10px'>
                    <InputBox label={DISPLAY.TEXT.RATING} type='text' name='rating' value={newItem.rating} onChange={handleNewItemChange} maxLen={10} />
                    <Dropdown
                        label={DISPLAY.TEXT.CATEGORY}
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                        options={[
                            {label: DISPLAY.TEXT.GENERAL, value: 'general'},
                            {label: DISPLAY.TEXT.PERSONAL, value: 'personal'}
                        ]}
                    />
                </Grid>

                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.SAVE_CHANGES} onClick={saveWatchlist} isLoading={isLoading} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.ADD_ITEM} onClick={addItem} actionType='primary' disabled={isLoading} />
                </Grid>
            </form>
        </Popup>
    );
}