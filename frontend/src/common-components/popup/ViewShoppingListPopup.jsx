import React from "react";
import { theme } from '../../themes/theme';
import toast from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useLanguage from "../../hooks/useLanguage";

import { Flex, Text, Box, ButtonGroup, TableContainer, Table, Thead, Tr, Th, Td, Tbody } from '@chakra-ui/react';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";
import Tickbox from "../form/Tickbox";


export default function ViewShoppingListPopup({isOpen, onClose, shoppingList}) {
    const {DISPLAY, TOASTS} = useLanguage();

    const checkedItems = shoppingList.filter(item => item.checked).length;
    const pendingItems = shoppingList.length - checkedItems;

    const copyPendingItems = async(e) =>{
        const pendingItemsText = shoppingList
            .filter(item => !item.checked)
            .map(item => `${item.name} - ${item.quantity}`)
            .join('\n');
    
        await navigator.clipboard.writeText(pendingItemsText);
        toast.success(TOASTS.PLANNING_MANAGER.PENDING_ITEMS_COPIED);
    }

    const downloadShoppingList = (e) =>{
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.SHOPPING_LIST, 14, 20);
        doc.setFontSize(10);
        doc.text(`${DISPLAY.LABELS.GENERATED_ON}: ${new Date().toLocaleString()}`, 14, 30);
    
        autoTable(doc, {
            startY: 40,
            theme: 'grid',
            headStyles: {
                fillColor: [32, 214, 0],
                textColor: [15, 23, 42],
                fontStyle: 'bold'
            },
            head: [[ DISPLAY.TEXT.STATUS, DISPLAY.TEXT.ITEM_NAME, DISPLAY.TEXT.QUANTITY ]],
            body: shoppingList.map(item =>[
                item.checked ? DISPLAY.TEXT.BOUGHT : DISPLAY.TEXT.PENDING,
                item.name,
                item.quantity
            ]),
            didParseCell: data =>{
                if(data.section === 'body' && data.row.raw?.[0] === DISPLAY.TEXT.PENDING){
                    data.cell.styles.fillColor = [137, 214, 124];
                }
            }
        });
    
        doc.save(`${DISPLAY.TEXT.SHOPPING_LIST}_${Date.now()}.pdf`);
    }


    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.SHOPPING_LIST} bg={theme.bg} borderColor={theme.info}>
            <Flex gap={theme.marginL} marginBottom={theme.marginL}>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.TOTAL_ITEMS}
                    </Text>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                        {shoppingList.length}
                    </Text>
                </Box>

                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.CHECKED_ITEMS}
                    </Text>
                    <Text color={theme.success} fontSize={theme.textSize} fontWeight={600}>
                        {checkedItems}
                    </Text>
                </Box>

                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.hoverBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.PENDING_ITEMS}
                    </Text>
                    <Text color={theme.warning} fontSize={theme.textSize} fontWeight={600}>
                        {pendingItems}
                    </Text>
                </Box>
            </Flex>

            <TableContainer maxHeight='400px' overflowY='auto'>
                <Table variant='unstyled' size='sm'>
                    <Thead position='sticky' top={0} zIndex={1} bgColor={theme.bg}>
                        <Tr bgColor={theme.accent}>
                            <Th color={theme.text} width='10%' textAlign='left' textTransform='none'>
                                {DISPLAY.TEXT.STATUS}
                            </Th>
                            <Th color={theme.text} width='55%' textAlign='left' textTransform='none'>
                                {DISPLAY.TEXT.ITEM_NAME}
                            </Th>
                            <Th color={theme.text} width='35%' textAlign='left' textTransform='none'>
                                {DISPLAY.TEXT.QUANTITY}
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            shoppingList.map((item, index) =>
                                <Tr key={index} bgColor={item.checked ? 'transparent' : theme.hoverBg } borderTop={`1px solid ${theme.border}`}>
                                    <Td width='10%' textAlign='center'>
                                        <Tickbox isChecked={item.checked} isReadOnly />
                                    </Td>
                                    <Td color={item.checked ? theme.textSecondary : theme.text} width='55%' textAlign='left'>
                                        {item.name}
                                    </Td>
                                    <Td color={theme.textSecondary} width='35%' textAlign='left'>
                                        {item.quantity}
                                    </Td>
                                </Tr>
                            )
                        }
                    </Tbody>
                </Table>
            </TableContainer>

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.COPY_PENDING} onClick={copyPendingItems} disabled={pendingItems === 0} />
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_PDF} onClick={downloadShoppingList} actionType='primary' disabled={shoppingList.length === 0} />
            </ButtonGroup>
        </Popup>
    );
}