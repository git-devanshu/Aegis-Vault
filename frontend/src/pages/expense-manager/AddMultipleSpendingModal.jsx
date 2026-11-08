import React, { useState } from "react";
import toast from "react-hot-toast";
import { Flex, Text, Divider, Spacer } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { GiMoneyStack } from "react-icons/gi";

import { theme } from "../../themes/theme";
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import { encryptData } from "../../utility/crypto";
import { apiRequest, validateAndStartLoading } from "../../utility/api";
import { getCategoryDisplayName } from "../../utility/helpers";

import Dropdown from "../../common-components/form/Dropdown";
import ActionButton from "../../common-components/form/ActionButton";

export default function AddMultipleSpendingModal({onBack, selectedCreditCard, categoryData, refreshSpendings, setRefreshSpendings, quickSaveLogs, setQuickSaveLogs, selectedExpenseGroupIndex, isQuickSaveImport, setSavedExpenses}) {
    if (!selectedCreditCard) return null;

    const { DISPLAY, TOASTS } = useLanguage();
    const { masterKey } = useAppContext();

    const defaultCardUsed = selectedCreditCard.cardsData?.length ? `${selectedCreditCard.cardsData[0].cardName} - ${selectedCreditCard.cardsData[0].network}` : "";

    const [spendings, setSpendings] = useState(() =>
        quickSaveLogs.map(spending => ({
            ...spending,
            categoryIndex: spending.categoryIndex ?? 0,
            cardUsed: spending.cardUsed || defaultCardUsed
        }))
    );

    const [isLoading, setIsLoading] = useState(false);

    const handleCategoryChange = (index, value) => {
        setSpendings(prev => prev.map((spending, i) =>
            i === index ? { ...spending, categoryIndex: Number(value) } : spending
        ));
    };

    const handleCardChange = (index, value) => {
        setSpendings(prev => prev.map((spending, i) =>
            i === index ? { ...spending, cardUsed: value } : spending
        ));
    };

    const importSpendings = async () => {
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.COMMON.LOADING
        });
        try {
            const encryptedSpendings = await Promise.all(
                spendings.map(async spending => {
                    const spendingPayload = {
                        amount: Number(spending.amount),
                        spentAt: spending.spentAt,
                        spentDate: spending.spentDate,
                        cardUsed: spending.cardUsed
                    };
                    const { encryptedData: spendingData, nonce } = await encryptData(JSON.stringify(spendingPayload), masterKey);
                    return {
                        accountIndex: selectedCreditCard.accountIndex,
                        ccIndex: selectedCreditCard.ccIndex,
                        categoryIndex: Number(spending.categoryIndex),
                        spendingData,
                        nonce
                    };
                })
            );

            await apiRequest({
                method: "POST",
                endpoint: "/api/em/credit-card-spendings/multiple",
                data: {
                    spendings: encryptedSpendings
                },
                toastId,
                setIsLoading,
                onSuccess: () => {
                    if (isQuickSaveImport && selectedExpenseGroupIndex !== "") {
                        const savedExpenses = JSON.parse(localStorage.getItem("aegis-saved-expenses")) || {};
                        savedExpenses[selectedExpenseGroupIndex] = [];
                        localStorage.setItem("aegis-saved-expenses", JSON.stringify(savedExpenses));
                        setSavedExpenses?.(savedExpenses);
                    }

                    setQuickSaveLogs([]);
                    setRefreshSpendings(!refreshSpendings);
                    onBack();
                }
            });
        }
        catch (error) {
            console.log(error);
            toast.error(TOASTS.COMMON.UNKNOWN_ERROR, { id: toastId });
            setIsLoading(false);
        }
    };

    const cardOptions = selectedCreditCard.cardsData.map(card => ({
        label: `${card.cardName} - ${card.network}`,
        value: `${card.cardName} - ${card.network}`
    }));

    return (
        <div className="fullscreen-overlay">
            <div className="common-page">
                <Flex align="center" justify="space-between" paddingBottom={theme.paddingL}>
                    <GiMoneyStack color={theme.primary} style={{ marginLeft: theme.marginS, marginRight: theme.marginS }} />
                    <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                        {DISPLAY.LABELS.CARDS}
                    </Text>
                    <Spacer />
                    <ActionButton icon={<ArrowBackIcon />} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{ width: "fit-content" }} />
                </Flex>

                <Divider borderColor={theme.border} borderWidth="1px" />

                <div className="common-container">
                    <Text color={theme.text} fontSize={theme.text} fontWeight={500} textAlign="center" marginTop={theme.spacing} marginBottom={theme.spacing}>
                        {DISPLAY.TEXT.ASSIGN_CATEGORIES}
                    </Text>

                    <div style={{ display: "flex", flexDirection: "column", gap: theme.marginL }}>
                        {spendings.map((spending, index) => (
                            <div key={index} style={{ border: `1px solid ${theme.border}`, borderRadius: `calc(${theme.radius} * 2)`, padding: theme.paddingL, backgroundColor: theme.cardBg }}>
                                <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                                    {spending.amount}
                                </Text>

                                <Flex align="center" justify="space-between" marginTop={theme.marginS}>
                                    <Text color={theme.text} fontSize={theme.textSize}>
                                        {spending.spentAt}
                                    </Text>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} backgroundColor={theme.hoverBg} padding="0 4px" borderRadius="4px">
                                        {spending.spentDate}
                                    </Text>
                                </Flex>

                                <div style={{marginBottom: '-10px'}}>
                                    <Dropdown value={spending.cardUsed} onChange={e => handleCardChange(index, e.target.value)} options={cardOptions} />
                                </div>

                                <div style={{marginBottom: '-20px'}}>
                                    <Dropdown value={String(spending.categoryIndex)} 
                                        onChange={e => handleCategoryChange(index, e.target.value)}
                                        options={categoryData.map(category => ({
                                            label: getCategoryDisplayName(category, DISPLAY),
                                            value: String(category.categoryIndex)
                                        }))}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <ActionButton name={DISPLAY.BUTTONS.ADD_SPENDING} onClick={importSpendings} isLoading={isLoading} disabled={isLoading || spendings.length === 0} actionType="primary" customStyle={{ marginTop: theme.spacing }} />
                </div>
            </div>
        </div>
    );
}
