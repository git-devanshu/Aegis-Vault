import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import { Divider, Flex, Text, Box, Table, Thead, Tbody, Tr, Th, Td, ButtonGroup } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import ActionButton from '../form/ActionButton';
import CircleIconButton from '../form/CircleIconButton';


export default function ViewStockPopup({isOpen, onClose, selectedStock, selectedAccount, refreshStocks, setRefreshStocks}) {
    if(!selectedAccount || !selectedStock) return null;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey, allowStockDeletion} = useAppContext();
    const country = BANKS.country[selectedAccount.countryCode];

    const [isLoading, setIsLoading] = useState(false);

    const currentDate = new Date().toLocaleDateString('en-CA');
    const [sellingDate, setSellingDate] = useState(currentDate);
    const [sellingPrice, setSellingPrice] = useState(0);

    const [showSellStockPopup, setShowSellStockPopup] = useState(false);
    const [showDeleteStockPopup, setShowDeleteStockPopup] = useState(false);

    useEffect(() =>{
        if(showSellStockPopup){
            setSellingPrice(0);
            setSellingDate(currentDate);
        }
    }, [showSellStockPopup]);

    const profitLoss = selectedStock.sellingPrice - selectedStock.totalPrice;

    const sellStock = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const { id, status, ...stockData } = selectedStock;
            const soldStock = {
                ...stockData,
                soldDate: sellingDate,
                sellingPrice
            };
            const {encryptedData: stockDataEncrypted, nonce} = await encryptData(JSON.stringify(soldStock), masterKey);
    
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/im/stocks/sell',
                data: {
                    id: selectedStock.id,
                    stockData: stockDataEncrypted,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshStocks(!refreshStocks);
                    setShowSellStockPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowSellStockPopup(false);
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
    
    const deleteStock = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/im/stocks/${selectedStock.id}`,
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshStocks(!refreshStocks);
                    setShowDeleteStockPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowDeleteStockPopup(false);
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
            <Popup isOpen={isOpen} onClose={onClose} title={selectedStock.name} bg={theme.bg} borderColor={theme.info}>
                <Text color={theme.text} fontSize={theme.textSize}>
                    {selectedStock.symbol} • {selectedStock.exchange}
                </Text>
                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                    {DISPLAY.LABELS.BROKER}: {selectedStock.broker?.length > 0 ? selectedStock.broker : DISPLAY.LABELS.NONE}
                </Text>

                <Table variant='unstyled' size='sm' marginTop={theme.marginL}>
                    <Thead>
                        <Tr bgColor={theme.accent}>
                            <Th color={theme.text} textTransform='none'>
                                {DISPLAY.LABELS.UNITS}
                            </Th>
                            <Th color={theme.text} textAlign='right' textTransform='none'>
                                {DISPLAY.LABELS.UNIT_PRICE}
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
                        {selectedStock.status === 1 && <Tr borderTop={`1px solid ${theme.border}`} bgColor={theme.hoverBg}>
                            <Td color={theme.error} colSpan={2}>
                                {DISPLAY.TEXT.SOLD}
                            </Td>

                            <Td color={theme.text} textAlign='right' fontWeight={500}>
                                {country.currency.symbol}{selectedStock.sellingPrice.toLocaleString(country.locale)}
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {new Date(selectedStock.soldDate).toLocaleDateString(country.locale)}
                            </Td>
                        </Tr>}

                        <Tr borderTop={`1px solid ${theme.border}`}>
                            <Td color={theme.text}>
                                {selectedStock.units}
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {country.currency.symbol}{Number(selectedStock.unitPrice).toLocaleString(country.locale)}
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {country.currency.symbol}{selectedStock.totalPrice.toLocaleString(country.locale)}
                            </Td>

                            <Td color={theme.text} textAlign='right'>
                                {new Date(selectedStock.purchaseDate).toLocaleDateString(country.locale)}
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>

                {selectedStock.status === 1 && <>
                    <Divider borderColor={theme.border} borderWidth='1px' my={theme.marginS} />

                    <Text color={profitLoss >= 0 ? theme.success : theme.error} fontSize={theme.textSize} fontWeight={600}>
                        {profitLoss >= 0 ? DISPLAY.TEXT.PROFIT : DISPLAY.TEXT.LOSS}: {' '} {country.currency.symbol} {profitLoss.toLocaleString(country.locale)}
                    </Text>
                </>}

                <ButtonGroup marginTop={theme.spacing} marginBottom={theme.marginS} width='full'>
                    {allowStockDeletion && <CircleIconButton icon={<DeleteIcon/>} onClick={()=> setShowDeleteStockPopup(true)} tooltip={DISPLAY.TOOLTIPS.DELETE} />}
                    <ActionButton name={DISPLAY.BUTTONS.SELL} onClick={()=> setShowSellStockPopup(true)} isLoading={isLoading} disabled={isLoading || selectedStock.status === 1} />
                </ButtonGroup>
            </Popup>

            {/* Delete Stock Popup */}
            <Popup isOpen={showDeleteStockPopup} onClose={()=> setShowDeleteStockPopup(false)} title={DISPLAY.TEXT.DELETE} borderColor={theme.warning}>
                <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                    {DISPLAY.TEXT.CONFIRM_DELETE_STOCK}
                </Text>
                <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginS}>
                    <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteStockPopup(false)} disabled={isLoading} />
                    <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteStock} actionType='primary' disabled={isLoading || !allowStockDeletion} isLoading={isLoading} />
                </ButtonGroup>
            </Popup>

            {/* Sell Stock Popup */}
            <Popup isOpen={showSellStockPopup} onClose={()=> setShowSellStockPopup(false)} title={DISPLAY.TEXT.SELL_STOCK} borderColor={theme.warning} bg={theme.bg}>
                <InputBox type='number' label={DISPLAY.LABELS.SELLING_PRICE} name='sellingPrice' value={sellingPrice} onChange={(e)=> setSellingPrice(Number(e.target.value))} required min={0} />
                <DateInput value={sellingDate} name='sellingDate' onChange={(e)=> setSellingDate(e.target.value)} label={DISPLAY.LABELS.SELLING_DATE} min={selectedStock.purchaseDate} />
                <ActionButton name={DISPLAY.BUTTONS.MARK_AS_SOLD} actionType='primary' isLoading={isLoading} disabled={isLoading || sellingPrice <= 0} onClick={sellStock} customStyle={{marginBottom: theme.marginS, marginTop: '-20px'}} />
            </Popup>
        </>
    );
}
