import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import {Divider, Flex, Text, Box, Table, Thead, Tbody, Tr, Th, Td, ButtonGroup} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import ActionButton from '../form/ActionButton';
import TabGroup from '../navbar/TabGroup';
import CircleIconButton from '../form/CircleIconButton';


export default function ViewGoldPopup({isOpen, onClose, selectedGoldAsset, selectedAccount, refreshGoldAssets, setRefreshGoldAssets}) {
    if(!selectedAccount || !selectedGoldAsset) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, allowGoldAssetDeletion} = useAppContext();
    const country = BANKS.country[selectedAccount.countryCode];

    const [isLoading, setIsLoading] = useState(false);

    const currentDate = new Date().toLocaleDateString('en-CA');
    const [sellingDate, setSellingDate] = useState(currentDate);
    const [sellingPrice, setSellingPrice] = useState(0);

    const [showSellGoldPopup, setShowSellGoldPopup] = useState(false);
    const [showDeleteGoldPopup, setShowDeleteGoldPopup] = useState(false);

    const profitLoss = selectedGoldAsset.sellingPrice - selectedGoldAsset.totalPrice;

    useEffect(() =>{
        if(showSellGoldPopup){
            setSellingPrice(0);
            setSellingDate(currentDate);
        }
    }, [showSellGoldPopup]);

    const sellGoldAsset = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const { id, status, ...goldAssetData } = selectedGoldAsset;
            const soldGoldAsset = {
                ...goldAssetData,
                soldDate: sellingDate,
                sellingPrice
            };
            const {encryptedData: assetData, nonce} = await encryptData(JSON.stringify(soldGoldAsset), masterKey);
    
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/im/gold/sell',
                data: {
                    id: selectedGoldAsset.id,
                    assetData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshGoldAssets(!refreshGoldAssets);
                    setShowSellGoldPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowSellGoldPopup(false);
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
    
    const deleteGoldAsset = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/im/gold/${selectedGoldAsset.id}`,
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshGoldAssets(!refreshGoldAssets);
                    setShowDeleteGoldPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowDeleteGoldPopup(false);
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
        <>
            <Popup isOpen={isOpen} onClose={onClose} title={selectedGoldAsset.assetName} bg={theme.bg} borderColor={theme.info}>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                    {DISPLAY.LABELS.HOLDER_NAME}: {selectedGoldAsset.holderName}
                </Text>

                <Table variant='unstyled' size='sm' marginTop={theme.marginL}>
                    <Thead>
                        <Tr bgColor={theme.accent}>
                            <Th color={theme.text} textTransform='none'>
                                {DISPLAY.LABELS.WEIGHT_IN_GRAMS}
                            </Th>
                            <Th color={theme.text} textAlign='right' textTransform='none'>
                                {DISPLAY.LABELS.RATE_PER_GRAM}
                            </Th>
                            <Th color={theme.text} textAlign='right' textTransform='none'>
                                {DISPLAY.LABELS.TOTAL_AMOUNT}
                            </Th>
                            <Th color={theme.text} textAlign='right' textTransform='none'>
                                {DISPLAY.LABELS.PURCHASE_DATE}
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {selectedGoldAsset.status === 1 &&
                            <Tr borderTop={`1px solid ${theme.border}`} bgColor={theme.hoverBg}>
                                <Td color={theme.error} colSpan={2}>
                                    {DISPLAY.TEXT.SOLD}
                                </Td>

                                <Td color={theme.text} textAlign='right' fontWeight={500}>
                                    {country.currency.symbol}{selectedGoldAsset.sellingPrice.toLocaleString(country.locale)}
                                </Td>

                                <Td color={theme.text} textAlign='right'>
                                    {new Date(selectedGoldAsset.soldDate).toLocaleDateString(country.locale)}
                                </Td>
                            </Tr>
                        }

                        <Tr borderTop={`1px solid ${theme.border}`}>
                            <Td color={theme.text}>
                                {selectedGoldAsset.weight}g
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {country.currency.symbol}
                                {selectedGoldAsset.rate.toLocaleString(country.locale)}
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {country.currency.symbol}
                                {selectedGoldAsset.totalPrice.toLocaleString(country.locale)}
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {new Date(selectedGoldAsset.purchaseDate).toLocaleDateString(country.locale)}
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>

                {selectedGoldAsset.status === 1 &&
                    <>
                        <Divider borderColor={theme.border} borderWidth='1px' my={theme.marginS} />

                        <Text color={profitLoss >= 0 ? theme.success : theme.error} fontSize={theme.textSize} fontWeight={600} >
                            {profitLoss >= 0 ? DISPLAY.TEXT.PROFIT : DISPLAY.TEXT.LOSS}: {' '} {country.currency.symbol} {profitLoss.toLocaleString(country.locale)}
                        </Text>
                    </>
                }

                <ButtonGroup marginTop={theme.spacing} marginBottom={theme.marginL} width='full'>
                    {allowGoldAssetDeletion && <CircleIconButton icon={<DeleteIcon/>} onClick={()=>{ setShowDeleteGoldPopup(true) }} tooltip={DISPLAY.TOOLTIPS.DELETE} />}
                    <ActionButton name={DISPLAY.BUTTONS.SELL} onClick={()=>{ setShowSellGoldPopup(true) }} isLoading={isLoading} disabled={isLoading || selectedGoldAsset.status === 1}/>
                </ButtonGroup>
            </Popup>

            {/* Delete Gold Popup */}
            <Popup isOpen={showDeleteGoldPopup} onClose={()=> setShowDeleteGoldPopup(false)} title={DISPLAY.TEXT.DELETE} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_GOLD}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteGoldPopup(false)} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteGoldAsset} actionType='primary' disabled={isLoading || !allowGoldAssetDeletion} isLoading={isLoading} />
                </ButtonGroup>
            </Popup>

            {/* Sell Gold Popup */}
            <Popup isOpen={showSellGoldPopup} onClose={()=> setShowSellGoldPopup(false)} title={DISPLAY.TEXT.SELL_GOLD_ASSET} borderColor={theme.warning} bg={theme.bg}>
                <InputBox type='number' label={DISPLAY.LABELS.SELLING_PRICE} name='sellingPrice' value={sellingPrice} onChange={(e)=> setSellingPrice(Number(e.target.value))} required min={0} />
                <DateInput value={sellingDate} name='sellingDate' onChange={(e)=> setSellingDate(e.target.value)} label={DISPLAY.LABELS.SELLING_DATE} min={selectedGoldAsset?.purchaseDate} />
                <ActionButton name={DISPLAY.BUTTONS.MARK_AS_SOLD} actionType='primary' isLoading={isLoading} disabled={isLoading || sellingPrice <= 0} onClick={sellGoldAsset} customStyle={{marginBottom: theme.marginS, marginTop: '-20px'}} />
            </Popup> 
        </>
    );
}
