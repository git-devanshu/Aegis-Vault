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


export default function ViewRDPopup({isOpen, onClose, selectedRD, selectedAccount, refreshRDs, setRefreshRDs}) {
    if(!selectedAccount || !selectedRD) return;

    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const country = BANKS.country[selectedAccount.countryCode];
    const currentDate = new Date().toLocaleDateString('en-CA');
    const [closingDate, setClosingDate] = useState(currentDate);

    const [isLoading, setIsLoading] = useState(false);

    const [showCloseRDPopup, setShowCloseRDPopup] = useState(false);
    const [showDeleteRDPopup, setShowDeleteRDPopup] = useState(false);

    const getPaidInstallments = rd =>{
        const installments = [];
        const startDate = new Date(rd.installmentDate);
        const today = new Date();
        let count = 0;
        const current = new Date(startDate);
    
        while(current <= today && count < rd.period){
            installments.push({
                serialNo: count + 1,
                monthYear: current.toLocaleDateString(country.locale, {
                    month: '2-digit',
                    year: 'numeric'
                }),
                amount: rd.installment
            });
            current.setMonth(current.getMonth() + 1);
            count++;
        }
    
        return installments.reverse();
    }
    
    const paidInstallments = getPaidInstallments(selectedRD);
    const totalPaidAmount = paidInstallments.length * selectedRD.installment;

    const closeRecurringDeposit = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const {id, status, ...restRDData} = selectedRD;
            const closedRD = { ...restRDData, closingDate };
            const {encryptedData: rdData, nonce} = await encryptData(JSON.stringify(closedRD), masterKey);
            await apiRequest({
                method: 'PUT',
                endpoint: '/api/im/rd/close',
                data: {
                    id: selectedRD.id,
                    rdData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshRDs(!refreshRDs);
                    setShowCloseRDPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowCloseRDPopup(false);
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
    
    const deleteRecurringDeposit = async(e) =>{
        const toastId = validateAndStartLoading({
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            await apiRequest({
                method: 'DELETE',
                endpoint: `/api/im/rd/${selectedRD.id}`,
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshRDs(!refreshRDs);
                    setShowDeleteRDPopup(false);
                    onClose(false);
                },
                onError: (err) =>{
                    setShowDeleteRDPopup(false);
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
        <Popup isOpen={isOpen} onClose={onClose} title={`${DISPLAY.LABELS.RD} #${selectedRD.rdIndex}`} bg={theme.bg} borderColor={theme.info}>
            <Text color={theme.text} fontSize={theme.textSize} marginTop='-10px'>
                {DISPLAY.LABELS.HOLDER_NAME}: {selectedRD.holderName}
            </Text>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginBottom={theme.marginL}>
                {DISPLAY.LABELS.NOMINEE}: {selectedRD.nominee}
            </Text>
            <Text color={theme.primary} fontSize={theme.textSize} fontWeight={600} marginBottom={theme.marginL}>
                {DISPLAY.TEXT.INSTALLMENTS}
            </Text>

            <Box maxHeight='300px' overflowY='auto'>
                <Table variant='unstyled' size='sm'>
                    <Thead position='sticky' top='0' zIndex={1}>
                        <Tr>
                            <Th color={theme.textSecondary} textTransform='none'>
                                {DISPLAY.LABELS.SR_NO}
                            </Th>
                            <Th color={theme.textSecondary} textTransform='none'>
                                {DISPLAY.LABELS.MONTH}
                            </Th>
                            <Th color={theme.textSecondary} textAlign='right' textTransform='none'>
                                {DISPLAY.LABELS.AMOUNT}
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {selectedRD.status === 1 && <Tr bgColor={theme.hoverBg}>
                                <Td color={theme.error}>
                                    {new Date(selectedRD.closingDate).toLocaleDateString(country.locale)}
                                </Td>
                                <Td color={theme.error} colSpan={3} textAlign='right'>
                                    {DISPLAY.TEXT.CLOSED}
                                </Td>
                            </Tr>
                        }
                        {paidInstallments.map(installment =>(
                            <Tr key={installment.serialNo} borderTop={`1px solid ${theme.border}`}>
                                <Td color={theme.text}>
                                    {installment.serialNo}
                                </Td>
                                <Td color={theme.text}>
                                    {installment.monthYear}
                                </Td>
                                <Td color={theme.text} textAlign='right'>
                                    {country.currency.symbol}
                                    {installment.amount.toLocaleString(country.locale)}
                                </Td>
                            </Tr>
                        ))}

                        <Tr bgColor={theme.hoverBg}>
                            <Td colSpan={2} color={theme.primary} fontWeight={600}>
                                {DISPLAY.LABELS.TOTAL}
                            </Td>
                            <Td color={theme.primary} textAlign='right' fontWeight={600}>
                                {country.currency.symbol}
                                {totalPaidAmount.toLocaleString(country.locale)}
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>
            </Box>

            <ButtonGroup marginTop={theme.spacing} marginBottom={theme.marginL} width='full'>
                <CircleIconButton icon={<DeleteIcon/>} onClick={()=>{ setShowDeleteRDPopup(true) }} tooltip={DISPLAY.TOOLTIPS.DELETE}/>
                <ActionButton name={DISPLAY.BUTTONS.CLOSE} onClick={()=>{ setShowCloseRDPopup(true) }} isLoading={isLoading} disabled={isLoading || selectedRD.status === 1}/>
            </ButtonGroup>
        </Popup>

        {/* Show Close RD Popup */}
        <Popup isOpen={showCloseRDPopup} onClose={setShowCloseRDPopup} title={`${DISPLAY.TEXT.CLOSE} ${DISPLAY.LABELS.RD} #${selectedRD.rdIndex}`} bg={theme.bg} borderColor={theme.warning}>
            <DateInput value={closingDate} name='closingDate' onChange={(e)=> setClosingDate(e.target.value)} label={DISPLAY.LABELS.CLOSING_DATE} min={selectedRD.installmentDate} />
            <ActionButton name={DISPLAY.BUTTONS.CLOSE} actionType='primary' isLoading={isLoading} disabled={isLoading} onClick={closeRecurringDeposit} customStyle={{marginBottom: theme.marginL}} />
        </Popup>

        {/* Show Delete RD Popup */}
        <Popup isOpen={showDeleteRDPopup} onClose={setShowDeleteRDPopup} title={`${DISPLAY.TEXT.DELETE} ${DISPLAY.LABELS.RD} #${selectedRD.rdIndex}`} bg={theme.bg} borderColor={theme.warning}>
            <Text color={theme.text} fontSize={theme.textSize} textAlign='center'>
                {DISPLAY.TEXT.CONFIRM_DELETE_RD}
            </Text>
            <ButtonGroup width='full' marginTop={theme.spacing} marginBottom={theme.marginL}>
                <ActionButton name={DISPLAY.BUTTONS.CANCEL} onClick={()=> setShowDeleteRDPopup(false)} disabled={isLoading} />
                <ActionButton name={DISPLAY.BUTTONS.DELETE} onClick={deleteRecurringDeposit} isLoading={isLoading} disabled={isLoading} actionType='primary' />
            </ButtonGroup>
        </Popup>
        </>
    );
}
