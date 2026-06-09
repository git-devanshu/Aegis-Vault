import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { calculateFDMaturityAmount, calculateFDMaturityDate } from '../../utility/investmentCalculators';

import {Divider, Flex, Text, Box, Table, Thead, Tbody, Tr, Th, Td, ButtonGroup} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import ActionButton from '../form/ActionButton';
import TabGroup from '../navbar/TabGroup';
import CircleIconButton from '../form/CircleIconButton';


export default function ViewFDPopup({isOpen, onClose, selectedFDGroup, selectedAccount, refreshFDs, setRefreshFDs}) {
    if(!selectedAccount || !selectedFDGroup) return;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];
    const latestFD = selectedFDGroup?.[0];

    const [rolledFD, setRolledFD] = useState({
        holderName: '',
        nominee: '',
        principal: 0,
        rate: '',
        period: '',
        startDate: ''
    });

    const currentDate = new Date().toLocaleDateString('en-CA');
    const [closingDate, setClosingDate] = useState(currentDate);

    const [isLoading, setIsLoading] = useState(false);

    const [showRolloverFDPopup, setShowRolloverFDPopup] = useState(false);
    const [showCloseFDPopup, setShowCloseFDPopup] = useState(false);
    const [showDeleteFDPopup, setShowDeleteFDPopup] = useState(false);

    console.log(latestFD);

    useEffect(() =>{
        if(!selectedFDGroup?.length) return;
        setRolledFD({
            holderName: latestFD.holderName,
            nominee: latestFD.nominee,
            principal: latestFD.maturityAmount,
            rate: '',
            period: '',
            startDate: latestFD.maturityDate
        });
        setClosingDate(currentDate);
    }, [selectedFDGroup]);

    const handleRolloverFDChange = e =>{
        setRolledFD({
            ...rolledFD,
            [e.target.name]: ['principal', 'period'].includes(e.target.name)
                    ? Number(e.target.value) : e.target.value
        });
    }

    const rolloverFixedDeposit = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const maturityDate = calculateFDMaturityDate(rolledFD.startDate, rolledFD.period);
            const {maturityAmount} = calculateFDMaturityAmount(rolledFD.principal, rolledFD.rate, rolledFD.startDate, rolledFD.period);
            const fdPayload = {...rolledFD, maturityDate, maturityAmount};
            const {encryptedData: fdData, nonce} = await encryptData(JSON.stringify(fdPayload), masterKey);
    
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/im/fd/rollover',
                data: {
                    id: latestFD.id,
                    accountIndex: selectedAccount.accountIndex,
                    fdIndex: latestFD.fdIndex,
                    fdData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshFDs(!refreshFDs);
                    setShowRolloverFDPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowRolloverFDPopup(false);
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

    const closeFixedDeposit = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const closedFD = { ...latestFD, closingDate };
            const {encryptedData: fdData, nonce} = await encryptData(JSON.stringify(closedFD), masterKey);

            await apiRequest({
                method: 'PUT',
                endpoint: '/api/im/fd/close',
                data: {
                    id: latestFD.id,
                    fdData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshFDs(!refreshFDs);
                    setShowCloseFDPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowCloseFDPopup(false);
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

    const deleteFixedDeposit = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/im/fd/${latestFD.id}`,
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshFDs(!refreshFDs);
                    setShowDeleteFDPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowDeleteFDPopup(false);
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
        <Popup isOpen={isOpen} onClose={onClose} title={`${DISPLAY.LABELS.FD} #${selectedFDGroup[0].fdIndex}`} bg={theme.bg} borderColor={theme.info}>
            <Text color={theme.text} fontSize={theme.textSize} marginTop='-10px'>
                {DISPLAY.LABELS.HOLDER_NAME}: {selectedFDGroup[0].holderName}
            </Text>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginBottom={theme.marginL}>
                {DISPLAY.LABELS.NOMINEE}: {selectedFDGroup[0].nominee}
            </Text>
            <Text color={theme.primary} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.FD_HISTORY}
            </Text>

            <Box maxHeight='300px' overflowY='auto'>
                <Table variant='unstyled' size='sm'>
                    <Thead position='sticky' top='0' zIndex={1}>
                        <Tr>
                            <Th color={theme.textSecondary}>
                                {DISPLAY.LABELS.DATE}
                            </Th>
                            <Th color={theme.textSecondary} textAlign='right'>
                                {DISPLAY.LABELS.AMOUNT}
                            </Th>
                            <Th color={theme.textSecondary} textAlign='right'>
                                {DISPLAY.LABELS.RATE}
                            </Th>
                            <Th color={theme.textSecondary} textAlign='right'>
                                {DISPLAY.LABELS.INTEREST}
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {latestFD.status === 2 && <Tr bgColor={theme.hoverBg}>
                                <Td color={theme.error}>
                                    {new Date(latestFD.closingDate).toLocaleDateString(country.locale)}
                                </Td>
                                <Td color={theme.error} colSpan={3} textAlign='right'>
                                    {DISPLAY.TEXT.CLOSED}
                                </Td>
                            </Tr>
                        }
                        {selectedFDGroup.map(fd =>(
                            <Tr key={fd.id} borderTop={`1px solid ${theme.border}`}>
                                <Td color={theme.text}>
                                    {new Date(fd.startDate).toLocaleDateString(country.locale)}
                                </Td>
                                <Td color={theme.text} textAlign='right'>
                                    {country.currency.symbol}{fd.principal.toLocaleString(country.locale)}
                                </Td>
                                <Td color={theme.text} textAlign='right'>
                                    {fd.rate}%
                                </Td>
                                <Td color={theme.success} textAlign='right'>
                                    {country.currency.symbol}
                                    {(fd.maturityAmount - fd.principal).toLocaleString(country.locale, {
                                        maximumFractionDigits: 2
                                    })}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            <ButtonGroup marginTop={theme.spacing} marginBottom={theme.marginL} width='full'>
                <CircleIconButton icon={<DeleteIcon/>} onClick={()=>{ setShowDeleteFDPopup(true) }} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                <ActionButton name={DISPLAY.BUTTONS.CLOSE} onClick={()=>{ setShowCloseFDPopup(true) }} isLoading={isLoading} disabled={isLoading || latestFD.status === 2}/>
                <ActionButton name={DISPLAY.BUTTONS.ROLLOVER} onClick={()=>{ setShowRolloverFDPopup(true) }} isLoading={isLoading} disabled={isLoading || new Date(latestFD.maturityDate) > new Date() || latestFD.status === 2} actionType='primary'/>
            </ButtonGroup>
        </Popup>

        {/* Show Rollover FD Popup */}
        <Popup isOpen={showRolloverFDPopup} onClose={setShowRolloverFDPopup} title={`${DISPLAY.TEXT.ROLLOVER} ${DISPLAY.LABELS.FD} #${selectedFDGroup[0].fdIndex}`} bg={theme.bg} borderColor={theme.success}>
            <form style={{marginTop: theme.spacing}}>
                <InputBox type='number' label={DISPLAY.LABELS.PRINCIPAL_AMOUNT} name='principal' value={rolledFD.principal} onChange={handleRolloverFDChange} required min={0} />
                <InputBox type='text' label={DISPLAY.LABELS.INTEREST_RATE} name='rate' value={rolledFD.rate} onChange={handleRolloverFDChange} required />
                <InputBox type='number' label={DISPLAY.LABELS.PERIOD_IN_DAYS} name='period' value={rolledFD.period} onChange={handleRolloverFDChange} required min={1} />
                <DateInput value={rolledFD.startDate} name='startDate' onChange={handleRolloverFDChange} label={DISPLAY.LABELS.START_DATE} min={latestFD.maturityDate} />
                <ActionButton name={DISPLAY.BUTTONS.ROLLOVER} actionType='primary' isLoading={isLoading} disabled={isLoading || rolledFD.principal <= 0 || parseFloat(rolledFD.rate) <= 0 || rolledFD.period <= 0} onClick={rolloverFixedDeposit} customStyle={{marginBottom: theme.marginL}} />
            </form>
        </Popup>

        {/* Show Close FD Popup */}
        <Popup isOpen={showCloseFDPopup} onClose={setShowCloseFDPopup} title={`${DISPLAY.TEXT.CLOSE} ${DISPLAY.LABELS.FD} #${selectedFDGroup[0].fdIndex}`} bg={theme.bg} borderColor={theme.warning}>
            <DateInput value={closingDate} name='closingDate' onChange={(e)=> setClosingDate(e.target.value)} label={DISPLAY.LABELS.CLOSING_DATE} min={latestFD.startDate} />
            <ActionButton name={DISPLAY.BUTTONS.CLOSE} actionType='primary' isLoading={isLoading} disabled={isLoading} onClick={closeFixedDeposit} customStyle={{marginBottom: theme.marginL}} />
        </Popup>

        {/* Show Delete FD Popup */}
        <Popup isOpen={showDeleteFDPopup} onClose={setShowDeleteFDPopup} title={`${DISPLAY.TEXT.DELETE} ${DISPLAY.LABELS.FD} #${selectedFDGroup[0].fdIndex}`} bg={theme.bg} borderColor={theme.warning}>
            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                {DISPLAY.TEXT.CONFIRM_DELETE_FD}
            </Text>
            <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteFDPopup(false)} disabled={isLoading} />
                <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteFixedDeposit} isLoading={isLoading} disabled={isLoading} actionType='primary' />
            </ButtonGroup>
        </Popup>
        </>
    )
}
