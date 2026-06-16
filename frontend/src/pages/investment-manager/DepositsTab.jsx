import React, { useState, useMemo } from "react";
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { Text, Flex, Grid, Box, Badge } from '@chakra-ui/react'
import useLanguage from "../../hooks/useLanguage";

import { CgMenuRound } from "react-icons/cg";
import { BsSortDown } from "react-icons/bs";
import { BsSortUp } from "react-icons/bs";

import CircleIconButton from "../../common-components/form/CircleIconButton";
import Dropdown from "../../common-components/form/Dropdown";
import ViewFDPopup from "../../common-components/popup/ViewFDPopup";
import ViewRDPopup from "../../common-components/popup/ViewRDPopup";


export default function DepositsTab({selectedAccount, groupedFDData, refreshFDs, setRefreshFDs, rdData, refreshRDs, setRefreshRDs}) {
    if(!selectedAccount || !groupedFDData || !rdData) return null;

    const {DISPLAY, TOASTS} = useLanguage();

    const country = BANKS.country[selectedAccount.countryCode];
    const bank = BANKS.banks[selectedAccount.bankId];

    const [selectedDepositType, setSelectedDepositType] = useState('fd');
    const [sortBy, setSortBy] = useState('amount');
    const [sortDesc, setSortDesc] = useState(true); // false means sort asc 

    const [showViewFDPopup, setShowViewFDPopup] = useState(false);
    const [selectedFDGroup, setSelectedFDGroup] = useState(null);

    const [showViewRDPopup, setShowViewRDPopup] = useState(false);
    const [selectedRD, setSelectedRD] = useState(null);

    const sortFDGroups = (groupedFDs, sortBy, sortDesc) =>{
        return [...groupedFDs].sort((a, b) =>{
            const fdA = a[0];
            const fdB = b[0];
            let result = 0;

            switch(sortBy){
                case 'amount':
                    result = fdA.principal - fdB.principal;
                    break;
                case 'date':
                    result = new Date(fdA.startDate) - new Date(fdB.startDate);
                    break;
                case 'rate':
                    result = fdA.rate - fdB.rate;
                    break;
                case 'period':
                    result = fdA.period - fdB.period;
                    break;
                default:
                    return 0;
            }
    
            return sortDesc ? -result : result;
        });
    }

    const sortRDData = (rdData, sortBy, sortDesc) =>{
        return [...rdData].sort((a, b) =>{
            let result = 0;
    
            switch(sortBy){
                case 'amount':
                    result = a.installment - b.installment;
                    break;
                case 'date':
                    result = new Date(a.installmentDate) - new Date(b.installmentDate);
                    break;
                case 'rate':
                    result = a.rate - b.rate;
                    break;
                case 'period':
                    result = a.period - b.period;
                    break;
                default:
                    return 0;
            }
    
            return sortDesc ? -result : result;
        });
    }

    const sortedFDData = useMemo(() =>{
        return sortFDGroups(groupedFDData, sortBy, sortDesc);
    }, [groupedFDData, sortBy, sortDesc]);

    const sortedRDData = useMemo(() =>{
        return sortRDData(rdData || [], sortBy, sortDesc);
    }, [rdData, sortBy, sortDesc]);

    const depositTypeOptions = [{
            label: DISPLAY.TEXT.FIXED_DEPOSITS,
            value: 'fd'
        }, {
            label: DISPLAY.TEXT.RECURRING_DEPOSITS,
            value: 'rd'
        }
    ];

    const sortOptions = [{
            label: DISPLAY.TEXT.SORT_BY_AMOUNT,
            value: 'amount'
        }, {
            label: DISPLAY.TEXT.SORT_BY_DATE,
            value: 'date'
        }, {
            label: DISPLAY.TEXT.SORT_BY_RATE,
            value: 'rate'
        }, {
            label: DISPLAY.TEXT.SORT_BY_PERIOD,
            value: 'period'
        }
    ];

    
    return (
        <>
            <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                {/* FD / RD dropdown */}
                <div style={{width:'100%', marginBottom:'-10px', marginTop: '-10px'}}>
                    <Dropdown value={selectedDepositType} onChange={e => setSelectedDepositType(e.target.value)} options={depositTypeOptions} />
                </div>
                {/* Sort by amount / sort by start date / sort by rate / sort by period */}
                <Flex align='center' gap={theme.marginL}>
                    <div style={{width:'100%', marginBottom:'-10px', marginTop: '-10px'}}>
                        <Dropdown value={sortBy} onChange={e => setSortBy(e.target.value)} options={sortOptions} />
                    </div>
                    <div style={{marginBottom: '8px'}}>
                        <CircleIconButton icon={sortDesc ? <BsSortUp/> : <BsSortDown/>}
                            iconSize='18px'
                            onClick={()=> setSortDesc(!sortDesc)}
                            tooltip={sortDesc ? DISPLAY.TOOLTIPS.SORT_ASC : DISPLAY.TOOLTIPS.SORT_DESC}
                        />
                    </div>
                </Flex>
            </Grid>

            {((selectedDepositType === 'fd' && sortedFDData.length === 0) || (selectedDepositType === 'rd' && sortedRDData.length === 0)) &&
                <div style={{width:'100%', display:'flex', marginTop:theme.spacing, justifyContent:'center'}}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                        {DISPLAY.TEXT.NO_DATA}
                    </Text>
                </div>
            }

            {selectedDepositType === 'fd' && 
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                    {sortedFDData.map(fdGroup =>{
                        const fd = fdGroup[0];

                        return (
                            <Box key={fd.id} position='relative' overflow='hidden' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
                                <Box position='absolute' left='0' top='0' bottom='0' width='4px' bg={theme.primary}/>

                                <img src={bank.logo} alt=''
                                    style={{ position:'absolute', right:'15%', top:'50%', transform:'translateY(-50%)', width:'140px', height:'140px', objectFit:'contain', opacity:0.05, pointerEvents:'none', borderRadius: '14px' }}
                                />

                                <Flex justify='space-between' align='center' position='relative' zIndex={1}>
                                    <Text color={theme.primary} fontSize={theme.smallTextSize} fontWeight={600}>
                                        {DISPLAY.LABELS.FD} #{fd.fdIndex}
                                    </Text>

                                    <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none'
                                        backgroundColor={ fd.status === 2
                                            ? theme.error : new Date(fd.maturityDate) < new Date() ? theme.warning : theme.success
                                        }
                                    >
                                        {
                                            fd.status === 2 ? 
                                                DISPLAY.TEXT.CLOSED : new Date(fd.maturityDate) < new Date() ? 
                                                    DISPLAY.TEXT.MATURED : DISPLAY.TEXT.ACTIVE
                                        }
                                    </Badge>
                                </Flex>

                                <Text color={theme.text} fontSize={theme.headingSize} fontWeight={500} marginTop={theme.marginL} position='relative' zIndex={1}>
                                    {country.currency.symbol} {fd.principal.toLocaleString(country.locale)}
                                </Text>

                                <Grid templateColumns='1fr 1fr' gap={theme.marginL} marginTop={theme.marginL} position='relative' zIndex={1}>
                                    <Text color={theme.text} fontWeight={500}>
                                        {fd.rate}%
                                    </Text>
                                    <Text color={theme.text} fontWeight={500} textAlign='right'>
                                        {fd.period} {DISPLAY.LABELS.DAYS}
                                    </Text>
                                </Grid>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {DISPLAY.LABELS.MATURITY_DATE}: {new Date(fd.maturityDate).toLocaleDateString(country.locale)}
                                </Text>

                                <Flex borderTop={`1px solid ${theme.border}`} marginTop={theme.marginS} justify='space-between' alignItems='end' position='relative' zIndex={1}>
                                    <Box>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='left'>
                                            {DISPLAY.LABELS.MATURITY_AMOUNT}
                                        </Text>
                                        <Text color={theme.primary} fontSize={theme.headingSize} fontWeight={500}>
                                            {country.currency.symbol} {fd.maturityAmount.toLocaleString(country.locale)}
                                        </Text>
                                    </Box>
                                    <Box onClick={() =>{ setSelectedFDGroup(fdGroup); setShowViewFDPopup(true); }} display='flex' alignItems='center' backgroundColor={theme.bg} borderRadius='25px' padding='6px 10px' gap='5px' cursor='pointer' _hover={{backgroundColor: theme.cardBg}}>
                                        <CgMenuRound style={{fontSize:'20px', color:theme.text}}/>
                                        <Text fontSize={theme.textSize} color={theme.text}>
                                            {DISPLAY.BUTTONS.VIEW}
                                        </Text>
                                    </Box>  
                                </Flex>
                            </Box>
                        );
                    })}
                    <div style={{height: '140px'}}></div>
                </Grid>
            }

            {selectedDepositType === 'rd' && 
                <Grid templateColumns={{base:'1fr', md:'1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                    {
                        sortedRDData.map(rd =>
                            <Box key={rd.id} position='relative' overflow='hidden' backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={theme.paddingL}>
                                <Box position='absolute' left='0' right='0' top='0' height='4px' bg={theme.primary}/>
                                <img src={bank.logo} alt=''
                                    style={{ position:'absolute', right:'15%', top:'50%', transform:'translateY(-50%)', width:'140px', height:'140px', objectFit:'contain', opacity:0.05, pointerEvents:'none', borderRadius:'14px' }}
                                />

                                <Flex justify='space-between' align='center' position='relative' zIndex={1}>
                                    <Text color={theme.primary} fontSize={theme.smallTextSize} fontWeight={600}>
                                        {DISPLAY.LABELS.RD} #{rd.rdIndex}
                                    </Text>
                                    <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none'
                                        backgroundColor={ rd.status === 1
                                            ? theme.error : new Date(rd.maturityDate) < new Date() ? theme.warning : theme.success
                                        }
                                    >
                                        {
                                            rd.status === 1
                                                ? DISPLAY.TEXT.CLOSED : new Date(rd.maturityDate) < new Date() ? DISPLAY.TEXT.MATURED : DISPLAY.TEXT.ACTIVE
                                        }
                                    </Badge>
                                </Flex>

                                <Flex alignItems='center' marginTop={theme.marginL} position='relative' zIndex={1} gap={theme.paddingL}>
                                    <Text color={theme.text} fontSize={theme.headingSize} fontWeight={500}>
                                        {country.currency.symbol} {rd.investedAmount.toLocaleString(country.locale)}
                                    </Text>
                                    <Text color={theme.textSecondary} fontSize={theme.text} fontWeight={500}>
                                        ({country.currency.symbol} {rd.installment.toLocaleString(country.locale)} {DISPLAY.LABELS.INSTALLMENT})
                                    </Text>
                                </Flex>
                                
                                <Grid templateColumns='1fr 1fr' gap={theme.marginL} marginTop={theme.marginL} position='relative' zIndex={1}>
                                    <Text color={theme.text} fontWeight={500} textAlign='left'>
                                        {rd.rate}%
                                    </Text>
                                    <Text color={theme.text} fontWeight={500} textAlign='right'>
                                        {rd.period} {DISPLAY.LABELS.MONTHS}
                                    </Text>
                                </Grid>

                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                    {DISPLAY.LABELS.MATURITY_DATE}: {new Date(rd.maturityDate).toLocaleDateString(country.locale)}
                                </Text>

                                <Flex justify='space-between' marginTop={theme.marginS} align='end' borderTop={`1px solid ${theme.border}`} position='relative' zIndex={1}>
                                    <Box>
                                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} textAlign='left'>
                                            {DISPLAY.LABELS.MATURITY_AMOUNT}
                                        </Text>
                                        <Text color={theme.primary} fontSize={theme.headingSize} fontWeight={500}>
                                            {country.currency.symbol} {rd.maturityAmount.toLocaleString(country.locale)}
                                        </Text>
                                    </Box>
                                    <Box onClick={() =>{ setSelectedRD(rd); setShowViewRDPopup(true); }} display='flex' alignItems='center' backgroundColor={theme.bg} borderRadius='25px' padding='6px 10px' gap='5px' cursor='pointer' _hover={{backgroundColor: theme.cardBg}}>
                                        <CgMenuRound style={{fontSize:'20px', color:theme.text}}/>
                                        <Text fontSize={theme.textSize} color={theme.text}>
                                            {DISPLAY.BUTTONS.VIEW}
                                        </Text>
                                    </Box>
                                </Flex>
                            </Box>
                        )
                    }
                    <div style={{height: '140px'}}></div>
                </Grid>
            }

            {/* View FD Popup */}
            <ViewFDPopup isOpen={showViewFDPopup} onClose={setShowViewFDPopup} selectedFDGroup={selectedFDGroup} selectedAccount={selectedAccount} refreshFDs={refreshFDs} setRefreshFDs={setRefreshFDs} />
            
            {/* View RD Popup */}
            <ViewRDPopup isOpen={showViewRDPopup} onClose={setShowViewRDPopup} selectedRD={selectedRD} selectedAccount={selectedAccount} refreshRDs={refreshRDs} setRefreshRDs={setRefreshRDs} />
        </>
    );
}
