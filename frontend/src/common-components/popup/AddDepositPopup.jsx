import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { calculateFDMaturityAmount, calculateFDMaturityDate, calculateRDMaturityAmount, calculateRDMaturityDate } from '../../utility/investmentCalculators';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import ActionButton from '../form/ActionButton';
import TabGroup from '../navbar/TabGroup';


export default function AddDepositPopup({isOpen, onClose, selectedAccount, refreshFDs, setRefreshFDs, refreshRDs, setRefreshRDs}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const [isLoading, setIsLoading] = useState(false);

    const tabs = [DISPLAY.LABELS.FD, DISPLAY.LABELS.RD];
    const [selectedTab, setSelectedTab] = useState(0);

    const defaultFDObject = {
        holderName: '',
        nominee: '',
        principal: 0,
        rate: '', // always use parseFloat for rate before use 
        period: 0, // in days
        startDate: new Date().toLocaleDateString('en-CA')
    };
    const [fd, setFD] = useState(defaultFDObject);

    const defaultRDObject = {
        holderName: '',
        nominee: '',
        installment: 0,
        rate: '', // always use parseFloat for rate before use 
        period: 0, // in months
        installmentDate: new Date().toLocaleDateString('en-CA')
    };
    const [rd, setRD] = useState(defaultRDObject);

    const handleFDChange = e =>{
        setFD({
            ...fd,
            [e.target.name]: ['principal', 'period'].includes(e.target.name)
                ? Number(e.target.value)
                : e.target.value
        });
    }

    const handleRDChange = e =>{
        setRD({
            ...rd,
            [e.target.name]: ['installment', 'period'].includes(e.target.name)
                ? Number(e.target.value)
                : e.target.value
        });
    }

    const addNewFD = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const maturityDate = calculateFDMaturityDate(fd.startDate, fd.period);
            const {maturityAmount} = calculateFDMaturityAmount(fd.principal, fd.rate, fd.startDate, fd.period);
            const fdPayload = {...fd, maturityDate, maturityAmount}
            const {encryptedData: fdData, nonce: nonce} = await encryptData(JSON.stringify(fdPayload), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/im/fd',
                data: {accountIndex: selectedAccount.accountIndex, fdData, nonce},
                toastId,
                setIsLoading,
                onSuccess: (res)=>{
                    setRefreshFDs(!refreshFDs);
                    setFD(defaultFDObject);
                    onClose(false);
                },
                onError: (err)=>{
                    setFD(defaultFDObject);
                    onClose(false);
                }
            })
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    const addNewRD = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const maturityDate = calculateRDMaturityDate(rd.installmentDate, rd.period);
            const {maturityAmount, investedAmount} = calculateRDMaturityAmount(rd.installment, rd.rate, rd.period);
            const rdPayload = {...rd, maturityDate, maturityAmount, investedAmount}
            const {encryptedData: rdData, nonce: nonce} = await encryptData(JSON.stringify(rdPayload), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/im/rd',
                data: {accountIndex: selectedAccount.accountIndex, rdData, nonce},
                toastId,
                setIsLoading,
                onSuccess: (res)=>{
                    setRefreshRDs(!refreshRDs);
                    setRD(defaultRDObject);
                    onClose(false);
                },
                onError: (err)=>{
                    setRD(defaultRDObject);
                    onClose(false);
                }
            })
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.ADD_DEPOSIT} bg={theme.bg} borderColor={theme.success}>
            <TabGroup tabs={tabs} value={selectedTab} onChange={setSelectedTab}/>

            {/* FD */}
            {selectedTab === 0 && <form style={{marginTop: theme.spacing}}>
                    <InputBox type='text' label={DISPLAY.LABELS.HOLDER_NAME} name='holderName' value={fd.holderName} onChange={handleFDChange} required maxLen={30} />
                    <InputBox type='text' label={DISPLAY.LABELS.NOMINEE} name='nominee' value={fd.nominee} onChange={handleFDChange} required maxLen={30} />
                    
                    <InputBox type='number' label={DISPLAY.LABELS.PRINCIPAL_AMOUNT} name='principal' value={fd.principal} onChange={handleFDChange} required min={0} />
                    <InputBox type='text' label={DISPLAY.LABELS.INTEREST_RATE} name='rate' value={fd.rate} onChange={handleFDChange} required />
                    <InputBox type='number' label={DISPLAY.LABELS.PERIOD_IN_DAYS} name='period' value={fd.period} onChange={handleFDChange} required min={1} />

                    <DateInput value={fd.startDate} name='startDate' onChange={handleFDChange} label={DISPLAY.LABELS.START_DATE} />

                    <ActionButton name={DISPLAY.BUTTONS.ADD_FIXED_DEPOSIT} actionType='primary' isLoading={isLoading} disabled={isLoading || fd.principal <= 0 || parseFloat(fd.rate) <= 0 || fd.period <= 0} onClick={addNewFD} customStyle={{marginBottom: theme.marginL, marginTop: '-20px'}} />
                </form>
            }

            {/* RD */}
            {selectedTab === 1 && <form style={{marginTop: theme.spacing}}>
                    <InputBox type='text' label={DISPLAY.LABELS.HOLDER_NAME} name='holderName' value={rd.holderName} onChange={handleRDChange} required maxLen={30} />
                    <InputBox type='text' label={DISPLAY.LABELS.NOMINEE} name='nominee' value={rd.nominee} onChange={handleRDChange} required maxLen={30} />
                    
                    <InputBox type='number' label={DISPLAY.LABELS.INSTALLMENT} name='installment' value={rd.installment} onChange={handleRDChange} required min={0} />
                    <InputBox type='text' label={DISPLAY.LABELS.INTEREST_RATE} name='rate' value={rd.rate} onChange={handleRDChange} required />
                    <InputBox type='number' label={DISPLAY.LABELS.PERIOD_IN_MONTHS} name='period' value={rd.period} onChange={handleRDChange} required min={1} />

                    <DateInput value={rd.installmentDate} name='installmentDate' onChange={handleRDChange} label={DISPLAY.LABELS.INSTALLMENT_DATE} />

                    <ActionButton name={DISPLAY.BUTTONS.ADD_RECURRING_DEPOSIT} actionType='primary' isLoading={isLoading} disabled={isLoading || rd.installment <= 0 || parseFloat(rd.rate) <= 0 || rd.period <= 0} onClick={addNewRD} customStyle={{marginBottom: theme.marginL, marginTop: '-20px'}} />
                </form>
            }
        </Popup>
    )
}
