import React, { useMemo, useState } from "react";
import { Box, Flex, Text, Spacer, Divider, Grid, Checkbox, Table, Thead, Tbody, Tr, Th, Td, TableContainer, GridItem } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { RiFileTransferLine, RiArrowTurnForwardFill } from "react-icons/ri";
import { BiSolidDownload } from "react-icons/bi";
import { theme } from "../../themes/theme";
import useLanguage from "../../hooks/useLanguage";
import ActionButton from "../../common-components/form/ActionButton";
import Dropdown from "../../common-components/form/Dropdown";
import InputBox from "../../common-components/form/InputBox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiRequest, validateAndStartLoading } from "../../utility/api";


export default function ExpenseTransferModal({onBack, expenseData, trackerData, selectedTracker, country, refreshExpenses, setRefreshExpenses}){
    const {DISPLAY, TOASTS} = useLanguage();

    const [targetTrackerIndex, setTargetTrackerIndex] = useState('');
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    const trackerOptions = useMemo(
        ()=> trackerData
            .filter(tracker => tracker.trackerIndex !== selectedTracker.trackerIndex)
            .map(tracker => ({
                value: tracker.trackerIndex,
                label: `${tracker.name} (${country.currency.symbol} ${tracker.amount.toLocaleString(country.locale)})`
            })),
        [trackerData, selectedTracker, country]
    );

    const handleSelectAll = () =>{
        if(selectedRows.size === expenseData.length){
            setSelectedRows(new Set());
        }
        else{
            setSelectedRows(new Set(expenseData.map(expense => expense.id)));
        }
    };

    const handleRowSelect = (id) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if(newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleDownloadSelectedExpenses = () =>{
        const selectedExpenses = expenseData.filter(expense => selectedRows.has(expense.id));
        if(selectedExpenses.length === 0){
            return;
        }
        const doc = new jsPDF();
        const tableOptions = {
            theme: 'grid',
            headStyles: {
                fillColor: [32, 214, 0],
                textColor: [15, 23, 42],
                fontStyle: 'bold'
            }
        };
    
        const formatCurrency = amount => `${country.currency.code} ${amount.toLocaleString(country.locale)}`;
        const totalExpense = selectedExpenses.reduce((sum, expense)=> sum + expense.amount, 0);
        doc.setFontSize(18);
        doc.text(DISPLAY.TEXT.SELECTED_EXPENSES, 14, 20);
        doc.setFontSize(10);
        doc.text(`${DISPLAY.LABELS.GENERATED_ON}: ${new Date().toLocaleString(country.locale)}`, 14, 28);
    
        autoTable(doc, {
            startY: 38,
            head: [[
                DISPLAY.REPORT.AMOUNT,
                DISPLAY.LABELS.SPENT_AT,
                DISPLAY.REPORT.DATE
            ]],
            body: selectedExpenses.map(expense =>[
                formatCurrency(expense.amount),
                expense.spentAt,
                new Date(expense.spentDate).toLocaleDateString(country.locale)
            ]),
            ...tableOptions
        });
    
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [[DISPLAY.REPORT.METRIC, DISPLAY.REPORT.VALUE]],
            body: [
                [
                    DISPLAY.REPORT.TRANSACTIONS,
                    selectedExpenses.length
                ],
                [
                    DISPLAY.REPORT.TOTAL_EXPENSE,
                    formatCurrency(totalExpense)
                ]
            ],
            ...tableOptions
        });
    
        doc.save(`${selectedTracker.name}__${Date.now()}.pdf`);
    };


    const transferExpenses = async() =>{
        const toastId = validateAndStartLoading({
            setIsLoading,
            loadingMessage: TOASTS.EXPENSE_MANAGER.ADDING_ACCOUNT
        });
        await apiRequest({
            method: 'PUT',
            endpoint: '/api/em/expenses/transfer',
            data: {expenseIds: [...selectedRows], targetTrackerIndex},
            toastId,
            setIsLoading,
            onSuccess: (res) =>{
                setRefreshExpenses(!refreshExpenses);
                onBack();
            },
            onError: (err) =>{
                onBack();
            }
        });
    }


    return (
        <div className="fullscreen-overlay">
        <div className="common-page">
            <Flex align='center' justify='space-between' paddingBottom={theme.paddingL}>
                <RiFileTransferLine color={theme.primary} style={{marginLeft: theme.marginS, marginRight: theme.marginS}}/>
                <Text color={theme.primary} fontSize={theme.text} fontWeight={500}>
                    {DISPLAY.TEXT.TRANSFER_EXPENSES}
                </Text>
                <Spacer/>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={onBack} customStyle={{width:'fit-content'}}/>
            </Flex>
            <Divider borderColor={theme.border} borderWidth='1px'/>

            <Box marginTop={theme.marginL} padding={theme.paddingL}>
                <Grid templateColumns='90px 250px' gap={theme.marginL} alignItems='center'>
                    <Flex justify='center'>
                        <RiArrowTurnForwardFill
                            size='90px'
                            color={theme.primary}
                            style={{
                                transform:'rotate(90deg) scaleX(1.1)'
                            }}
                        />
                    </Flex>

                    <Flex direction='column' gap={theme.marginL}>
                        <InputBox label={DISPLAY.LABELS.TRANSFER_FROM} value={selectedTracker?.name} readOnly={true} />
                        <Dropdown value={targetTrackerIndex} onChange={e => setTargetTrackerIndex(e.target.value)} options={trackerOptions} />
                    </Flex>
                </Grid>
            </Box>

            <Box marginTop={theme.marginL} padding={theme.paddingL} backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius}>
                <Text color={theme.text} fontSize={theme.textSize}>
                    {DISPLAY.LABELS.EXPENSES_SELECTED}
                    {' : '}
                    <span style={{color: theme.primary}}>
                        {selectedRows.size}
                    </span>
                </Text>
            </Box>

            <TableContainer marginTop={theme.marginL} backgroundColor={theme.cardBg} border={`1px solid ${theme.border}`} borderRadius={theme.radius} maxHeight='450px' overflowY='auto'>
                <Table variant='unstyled' size='sm'>
                    <Thead bgColor={theme.hoverBg}>
                        <Tr>
                            <Th>
                                <Checkbox size='md' px="3" py="3"
                                    isChecked={
                                        expenseData.length > 0 &&
                                        selectedRows.size === expenseData.length
                                    }
                                    onChange={handleSelectAll}
                                />
                            </Th>
                            <Th color={theme.textSecondary} fontSize={theme.smallTextSize} px="2" py="3">
                                {DISPLAY.LABELS.AMOUNT}
                            </Th>
                            <Th color={theme.textSecondary} fontSize={theme.smallTextSize} px="2" py="3">
                                {DISPLAY.LABELS.SPENT_AT}
                            </Th>
                            <Th color={theme.textSecondary} fontSize={theme.smallTextSize} px="2" py="3">
                                {DISPLAY.LABELS.DATE}
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {
                            expenseData.map(expense =>(
                                <Tr key={expense.id} cursor='pointer' onClick={()=> handleRowSelect(expense.id)} _hover={{backgroundColor: theme.hoverBg}}>
                                    <Td>
                                        <Checkbox size='md' px="3" py="1"
                                            isChecked={selectedRows.has(expense.id)}
                                            pointerEvents='none'
                                        />
                                    </Td>
                                    <Td color={theme.text} fontSize={theme.textSize} px="1" py="1">
                                        {country.currency.symbol}
                                        {' '}
                                        {expense.amount.toLocaleString(country.locale)}
                                    </Td>
                                    <Td color={theme.text} fontSize={theme.textSize} px="1" py="1">
                                        {expense.spentAt}
                                    </Td>
                                    <Td color={theme.textSecondary} fontSize={theme.textSize} px="1" py="1">
                                        {expense.spentDate}
                                    </Td>
                                </Tr>
                            ))
                        }

                    </Tbody>

                </Table>
            </TableContainer>

            <Grid templateColumns={{base:'1fr', md:'1fr 1fr', lg:'1fr 1fr 1fr 1fr'}} gap={theme.marginL} marginTop={theme.marginL}>
                <GridItem colStart={{lg:3}}>
                    <ActionButton icon={<BiSolidDownload/>} name={DISPLAY.BUTTONS.DOWNLOAD_SELECTED} onClick={handleDownloadSelectedExpenses} disabled={isLoading} />
                </GridItem>
                <GridItem>
                    <ActionButton icon={<RiFileTransferLine/>} name={DISPLAY.BUTTONS.TRANSFER_EXPENSES} onClick={transferExpenses} isLoading={isLoading} disabled={isLoading} actionType='primary' />
                </GridItem>
            </Grid>
        </div>
        </div>
    );
}
