import React, { useState, useMemo } from "react";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { Text, Flex, Grid, Box, Badge, Spacer } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";

import { CgMenuRound } from "react-icons/cg";

import Dropdown from "../../common-components/form/Dropdown";
import InputBox from "../../common-components/form/InputBox";
import ViewGoldPopup from "../../common-components/popup/ViewGoldPopup";
import ViewStockPopup from "../../common-components/popup/ViewStockPopup";


export default function HoldingsTab({selectedAccount, goldAssetData, refreshGoldAssets, setRefreshGoldAssets, stockData, refreshStocks, setRefreshStocks}) {
    if(!selectedAccount || !goldAssetData || !stockData) return null;

    const {DISPLAY} = useLanguage();
    const {hideSoldGoldAssets, hideSoldStocks} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];

    const [selectedHolding, setSelectedHolding] = useState('gold');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedGoldAsset, setSelectedGoldAsset] = useState(null);
    const [showViewGoldPopup, setShowViewGoldPopup] = useState(false);

    const [selectedStock, setSelectedStock] = useState(null);
    const [showViewStockPopup, setShowViewStockPopup] = useState(false);

    const filteredGold = useMemo(()=>{
        if(selectedHolding !== 'gold') return [];
        const q = searchQuery.trim().toLowerCase();
        return [...goldAssetData].filter(goldAsset =>
                goldAsset.assetName.toLowerCase().includes(q)
            );
    }, [goldAssetData, searchQuery, selectedHolding]);

    const filteredStocks = useMemo(()=>{
        if(selectedHolding !== 'stocks') return [];
        const q = searchQuery.trim().toLowerCase();
        return [...stockData].filter(stock =>
                stock.name.toLowerCase().includes(q)
            );
    }, [stockData, searchQuery, selectedHolding]);


    const holdingTypeOptions = [{
            label: DISPLAY.LABELS.GOLD_ASSETS,
            value: 'gold'
        }, {
            label: DISPLAY.LABELS.STOCKS,
            value: 'stocks'
        }
    ];

    return (
        <>
            <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.spacing}>
                {/* Gold / Stocks dropdown */}
                <div style={{width:'100%', marginBottom:'-10px', marginTop: '-10px'}}>
                    <Dropdown value={selectedHolding} onChange={e => setSelectedHolding(e.target.value)} options={holdingTypeOptions} />
                </div>
                {/* Search Holding */}
                <div style={{width:'100%', marginBottom:'-10px', marginTop: '-10px'}}>
                    <InputBox placeholder={`🔎︎ ${DISPLAY.LABELS.SEARCH_HOLDINGS}`} type='text' name='searchQuery' value={searchQuery} onChange={(e)=> setSearchQuery(e.target.value)}/>
                </div>
            </Grid>

            {((selectedHolding === 'gold' && filteredGold.length === 0) || (selectedHolding === 'stocks' && filteredStocks.length === 0)) &&
                <div style={{width:'100%', display:'flex', marginTop:theme.spacing, justifyContent:'center'}}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                        {DISPLAY.TEXT.NO_DATA}
                    </Text>
                </div>
            }

            {selectedHolding === 'gold' && 
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}>
                    {filteredGold.map(gold =>{
                        if(hideSoldGoldAssets && gold.status === 1) return null;
                        return(
                            <Box key={gold.id} position='relative' overflow='hidden' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
                                <Box position='absolute' left='0' top='0' bottom='0' width='4px' bg='#D4AF37' />

                                <Flex justify='space-between' align='start'>
                                    <div>
                                        <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                                            {gold.assetName}
                                        </Text>
                                    </div>

                                    <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none' 
                                        backgroundColor={gold.status === 1 ? theme.error : theme.success}
                                    >
                                        {gold.status === 1 ? DISPLAY.TEXT.SOLD : DISPLAY.TEXT.ACTIVE}
                                    </Badge>
                                </Flex>
                    
                                <Text color='#D4AF37' fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL}>
                                    {country.currency.symbol} {gold.totalPrice.toLocaleString(country.locale)}
                                </Text>
                    
                                <Flex justifyContent='space-between' gap={theme.marginL} marginTop={theme.marginL}>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                                        {gold.weight}g
                                    </Text>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} textAlign='right'>
                                        {country.currency.symbol} {gold.rate.toLocaleString(country.locale)}/g
                                    </Text>
                                </Flex>
                    
                                <Flex borderTop={`1px solid ${theme.border}`} marginTop={theme.marginS} alignItems='end'>
                                    <Box>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                            {DISPLAY.LABELS.BROKER}: {' '}
                                            {gold.broker?.length > 0 ? gold.broker : DISPLAY.LABELS.NONE}
                                        </Text>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                            {DISPLAY.LABELS.PURCHASE_DATE}: {' '}
                                            {new Date(gold.purchaseDate).toLocaleDateString(country.locale)}
                                        </Text>
                                    </Box>
                                    <Spacer/>
                                    <Box onClick={() =>{ setSelectedGoldAsset(gold); setShowViewGoldPopup(true); }} display='flex' alignItems='center' backgroundColor={theme.bg} borderRadius='25px' padding='6px 10px' gap='5px' cursor='pointer' _hover={{backgroundColor: theme.cardBg}}>
                                        <CgMenuRound style={{fontSize:'20px', color:theme.text}}/>
                                        <Text fontSize={theme.textSize} color={theme.text}>
                                            {DISPLAY.BUTTONS.VIEW}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        )}
                    )}
                    
                    <div style={{height:'140px'}}></div>
                </Grid>
            }

            {selectedHolding === 'stocks' && 
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL}>
                    {filteredStocks.map(stock => {
                        if(hideSoldStocks && stock.status === 1) return null;
                        return(
                            <Box key={stock.id} position='relative' overflow='hidden' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
                                <Box position='absolute' left='0' top='0' bottom='0' width='4px' bg={theme.info} />

                                <Flex justify='space-between' align='start'>
                                    <Box>
                                        <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                                            {stock.name}
                                        </Text>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                            {stock.symbol} • {stock.exchange}
                                        </Text>
                                    </Box>

                                    <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none'
                                        backgroundColor={stock.status === 1 ? theme.error : theme.success}
                                    >
                                        {stock.status === 1 ? DISPLAY.TEXT.SOLD : DISPLAY.TEXT.ACTIVE}
                                    </Badge>
                                </Flex>

                                <Text color={theme.info} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL}>
                                    {country.currency.symbol} {stock.totalPrice.toLocaleString(country.locale)}
                                </Text>

                                <Flex justifyContent='space-between' gap={theme.marginL} marginTop={theme.marginL}>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                                        {stock.units} {DISPLAY.LABELS.UNITS}
                                    </Text>
                                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600} textAlign='right'>
                                        {country.currency.symbol} {Number(stock.unitPrice).toLocaleString(country.locale)}
                                    </Text>
                                </Flex>

                                <Flex borderTop={`1px solid ${theme.border}`} marginTop={theme.marginS} alignItems='end'>
                                    <Box>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                            {DISPLAY.LABELS.BROKER}:{' '}
                                            {stock.broker}
                                        </Text>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                            {DISPLAY.LABELS.PURCHASE_DATE}:{' '}
                                            {new Date(stock.purchaseDate).toLocaleDateString(country.locale)}
                                        </Text>
                                    </Box>
                                    <Spacer/>
                                    <Box onClick={() =>{ setSelectedStock(stock); setShowViewStockPopup(true); }} display='flex' alignItems='center' backgroundColor={theme.bg} borderRadius='25px' padding='6px 10px' gap='5px' cursor='pointer' _hover={{backgroundColor: theme.cardBg}}>
                                        <CgMenuRound style={{fontSize:'20px', color:theme.text}}/>
                                        <Text fontSize={theme.textSize} color={theme.text}>
                                            {DISPLAY.BUTTONS.VIEW}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        )}
                    )}

                    <div style={{height:'140px'}}></div>
                </Grid>
            }

            {/* View Gold Asset Popup */}
            <ViewGoldPopup isOpen={showViewGoldPopup} onClose={setShowViewGoldPopup} selectedGoldAsset={selectedGoldAsset} selectedAccount={selectedAccount} refreshGoldAssets={refreshGoldAssets} setRefreshGoldAssets={setRefreshGoldAssets} /> 
            
            {/* View Stock Popup */}
            <ViewStockPopup isOpen={showViewStockPopup} onClose={setShowViewStockPopup} selectedStock={selectedStock} selectedAccount={selectedAccount} refreshStocks={refreshStocks} setRefreshStocks={setRefreshStocks} />
        </>
    )
}
