import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';
import useAppContext from '../../hooks/useAppContext';
import { encryptData } from '../../utility/crypto';
import { apiRequest, validateAndStartLoading } from '../../utility/api';
import { getCategoryDisplayName } from '../../utility/helpers';

import Popup from '../popup/Popup';
import InputBox from '../form/InputBox';
import DateInput from '../form/DateInput';
import Dropdown from '../form/Dropdown';
import ActionButton from '../form/ActionButton';


export default function AddSpendingPopup({showAddSpendingPopup, setShowAddSpendingPopup, selectedCreditCard, refreshSpendings, setRefreshSpendings, categoryData}) {
    const {DISPLAY, TOASTS} = useLanguage();
    const {masterKey} = useAppContext();

    const defaultSpendingPayload = {
        amount: 0,
        spentAt: '',
        spentDate: new Date().toLocaleDateString('en-CA'),
        cardUsed: `${selectedCreditCard.cardsData[0].cardName} - ${selectedCreditCard.cardsData[0].network}`
    };
    const [spending, setSpending] = useState(defaultSpendingPayload);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>{
        setSpending({
            ...spending,
            [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
        });
    }

    const addSpending = async(e) =>{
        const toastId = validateAndStartLoading({
            e,
            loadingMessage: TOASTS.COMMON.LOADING,
            setIsLoading
        });
        if(!toastId) return;
        try{
            const {encryptedData: spendingData, nonce} = await encryptData(JSON.stringify(spending), masterKey);
            await apiRequest({
                method: 'POST',
                endpoint: '/api/em/credit-card-spendings',
                data: {
                    accountIndex: selectedCreditCard.accountIndex,
                    ccIndex: selectedCreditCard.ccIndex,
                    categoryIndex: selectedCategoryIndex,
                    spendingData,
                    nonce
                },
                toastId,
                setIsLoading,
                onSuccess: (res) =>{
                    setRefreshSpendings(!refreshSpendings);
                    setSelectedCategoryIndex(0);
                    setShowAddSpendingPopup(false);
                    setSpending(defaultSpendingPayload);
                }
            });
        }
        catch(error){
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, {id : toastId});
            setIsLoading(false);
        }
    }

    return (
        <Popup isOpen={showAddSpendingPopup} onClose={()=> { setSpending(defaultSpendingPayload); setShowAddSpendingPopup(false); }} title={DISPLAY.TEXT.ADD_SPENDING} bg={theme.bg} borderColor={theme.success}>
            <form style={{marginTop: theme.spacing}}>
                <div style={{marginTop: '-20px'}}>
                    <Dropdown value={spending.cardUsed} onChange={(e)=> setSpending({...spending, cardUsed: e.target.value})}
                        options={selectedCreditCard.cardsData.map(
                            (card)=>({
                                label: `${card.cardName} - ${card.network}`,
                                value: `${card.cardName} - ${card.network}`
                            })
                        )}
                    />
                </div>

                <DateInput value={spending.spentDate} name='spentDate' onChange={handleChange} label={DISPLAY.LABELS.SPENT_DATE} />

                <div style={{marginTop: '-20px'}}>
                    <Dropdown value={selectedCategoryIndex} onChange={(e)=> setSelectedCategoryIndex(Number(e.target.value))}
                        options={categoryData.map(
                            (category)=>({
                                label: getCategoryDisplayName(category, DISPLAY),
                                value: category.categoryIndex
                            })
                        )}
                    />
                </div>

                <InputBox type='text' label={DISPLAY.LABELS.SPENT_AT} name='spentAt' value={spending.spentAt} onChange={handleChange} required maxLen={50} />
                <InputBox type='number' label={DISPLAY.LABELS.AMOUNT} name='amount' value={spending.amount} onChange={handleChange} required min={0} />

                <ActionButton name={DISPLAY.BUTTONS.ADD_SPENDING} actionType='primary' isLoading={isLoading} disabled={isLoading || spending.amount <= 0} onClick={addSpending} customStyle={{marginBottom: theme.marginS}} />
            </form>
        </Popup>
    );
}
