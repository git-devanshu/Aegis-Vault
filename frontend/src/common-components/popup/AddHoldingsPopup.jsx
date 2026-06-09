import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import SYSTEM_DATA from '../../assets/system-data.json';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import ActionButton from '../form/ActionButton';
import TabGroup from '../navbar/TabGroup';
import Dropdown from '../form/Dropdown';


export default function AddHoldingsPopup({isOpen, onClose, selectedAccount, refreshGoldAssets, setRefreshGoldAssets, refreshStocks, setRefreshStocks}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    const tabs = [DISPLAY.LABELS.GOLD_ASSETS, DISPLAY.LABELS.STOCKS];
    const [selectedTab, setSelectedTab] = useState(0);

    const defaultGoldAssetObject = {
        holderName: '',
        assetType: 'PHYSICAL_GOLD',
        assetName: '',
        weight: '', // in grams, use parseFloat before calculations
        rate: '', // amount per gram, use parseFloat before calculations
        totalPrice: 0,
        purchaseDate: new Date().toLocaleDateString('en-CA'),
        broker: ''
    };
    const [goldAsset, setGoldAsset] = useState(defaultGoldAssetObject);
    
    const defaultStockObject = {
        name: '',
        symbol: '',
        units: '', // use parseFloat before calculations
        unitPrice: '', // use parseFloat before calculations
        totalPrice: 0,
        purchaseDate: new Date().toLocaleDateString('en-CA'),
        broker: ''
    };
    const [stock, setStock] = useState(defaultStockObject);

    const handleGoldAssetChange = e =>{
        setGoldAsset({
            ...goldAsset,
            [e.target.name]: e.target.name === 'totalPrice'
                ? Number(e.target.value) : e.target.value
        });
    }
    
    const handleStockChange = e =>{
        setStock({
            ...stock,
            [e.target.name]: e.target.name === 'totalPrice'
                ? Number(e.target.value) : e.target.value
        });
    }

    const addGoldAsset = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const assetPayload = {
                ...goldAsset,
                weight: parseFloat(goldAsset.weight) || 0,
                rate: parseFloat(goldAsset.rate) || 0
            };
            const {encryptedData: assetData, nonce} = await encryptData(JSON.stringify(assetPayload), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/im/gold',
                data: {
                    accountIndex: selectedAccount.accountIndex,
                    assetData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshGoldAssets(!refreshGoldAssets);
                    setGoldAsset(defaultGoldAssetObject);
                    onClose(false);
                },
                onError: (err) =>{
                    setGoldAsset(defaultGoldAssetObject);
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
    
    const addStock = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const stockPayload = {
                ...stock,
                units: parseFloat(stock.units) || 0,
                unitPrice: parseFloat(stock.unitPrice) || 0
            };
            const {encryptedData: stockData, nonce} = await encryptData(JSON.stringify(stockPayload), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/im/stocks',
                data: {
                    accountIndex: selectedAccount.accountIndex,
                    stockData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshStocks(!refreshStocks);
                    setStock(defaultStockObject);
                    onClose(false);
                },
                onError: (err) =>{
                    setStock(defaultStockObject);
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

    const goldAssetTypeOptions = SYSTEM_DATA.GOLD_ASSET_TYPES.map(type =>({
        label: DISPLAY.LABELS[type],
        value: type
    }));

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.ADD_HOLDINGS} bg={theme.bg} borderColor={theme.success}>
            <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>

            {/* Gold Assets */}
            {selectedTab === 0 &&
                <form style={{marginTop: theme.marginL, maxHeight: '400px', overflowY: "scroll"}}>
                    <InputBox type='text' label={DISPLAY.LABELS.HOLDER_NAME} name='holderName' value={goldAsset.holderName} onChange={handleGoldAssetChange} required maxLen={30} />
                    <Dropdown value={goldAsset.assetType} 
                        onChange={e => setGoldAsset({...goldAsset, assetType: e.target.value})}
                        options={goldAssetTypeOptions}
                    />

                    <InputBox type='text' label={DISPLAY.LABELS.ASSET_NAME} name='assetName' value={goldAsset.assetName} onChange={handleGoldAssetChange} required maxLen={50} />
                    <InputBox type='text' label={DISPLAY.LABELS.WEIGHT_IN_GRAMS} name='weight' value={goldAsset.weight} onChange={handleGoldAssetChange} required />
                    <InputBox type='text' label={DISPLAY.LABELS.RATE_PER_GRAM} name='rate' value={goldAsset.rate} onChange={handleGoldAssetChange} required />
                    <InputBox type='number' label={DISPLAY.LABELS.TOTAL_AMOUNT} name='totalPrice' value={goldAsset.totalPrice} onChange={handleGoldAssetChange} required min={0} />

                    {['DIGITAL_GOLD', 'GOLD_ETF', 'SOVEREIGN_GOLD_BOND'].includes(goldAsset.assetType) &&
                        <InputBox type='text' label={DISPLAY.LABELS.BROKER} name='broker' value={goldAsset.broker} onChange={handleGoldAssetChange} required maxLen={50} />
                    }

                    <DateInput value={goldAsset.purchaseDate} name='purchaseDate' onChange={handleGoldAssetChange} label={DISPLAY.LABELS.PURCHASE_DATE} />

                    <ActionButton
                        name={DISPLAY.BUTTONS.ADD_GOLD_ASSET}
                        actionType='primary'
                        isLoading={isLoading}
                        disabled={
                            isLoading ||
                            parseFloat(goldAsset.weight) <= 0 ||
                            parseFloat(goldAsset.rate) <= 0 ||
                            goldAsset.totalPrice < ((parseFloat(goldAsset.weight) || 0) * (parseFloat(goldAsset.rate) || 0))
                        }
                        onClick={addGoldAsset}
                        customStyle={{marginBottom: theme.marginL, marginTop: '-20px'}}
                    />
                </form>
            }

            {/* Stocks */}
            {selectedTab === 1 &&
                <form style={{marginTop: theme.marginL, maxHeight: '400px', overflowY: "scroll"}}>
                    <InputBox type='text' label={DISPLAY.LABELS.NAME} name='name' value={stock.name} onChange={handleStockChange} required maxLen={50} />
                    <InputBox type='text' label={DISPLAY.LABELS.SYMBOL} name='symbol' value={stock.symbol} onChange={handleStockChange} required maxLen={20} />
                    <InputBox type='text' label={DISPLAY.LABELS.UNITS} name='units' value={stock.units} onChange={handleStockChange} required />
                    <InputBox type='text' label={DISPLAY.LABELS.UNIT_PRICE} name='unitPrice' value={stock.unitPrice} onChange={handleStockChange} required />
                    <InputBox type='number' label={DISPLAY.LABELS.TOTAL_AMOUNT} name='totalPrice' value={stock.totalPrice} onChange={handleStockChange} required min={0} />
                    <InputBox type='text' label={DISPLAY.LABELS.BROKER} name='broker' value={stock.broker} onChange={handleStockChange} required maxLen={50} />
                    <DateInput value={stock.purchaseDate} name='purchaseDate' onChange={handleStockChange} label={DISPLAY.LABELS.PURCHASE_DATE} />

                    <ActionButton
                        name={DISPLAY.BUTTONS.ADD_STOCK}
                        actionType='primary'
                        isLoading={isLoading}
                        disabled={
                            isLoading ||
                            parseFloat(stock.units) <= 0 ||
                            parseFloat(stock.unitPrice) <= 0 ||
                            stock.totalPrice < ((parseFloat(stock.units) || 0) * (parseFloat(stock.unitPrice) || 0))
                        }
                        onClick={addStock}
                        customStyle={{marginBottom: theme.marginL, marginTop: '-20px'}}
                    />
                </form>
            }
        </Popup>
    )
}
