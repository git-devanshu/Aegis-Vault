import React from "react";
import { theme } from '../../themes/theme';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useLanguage from "../../hooks/useLanguage";

import { Flex, Text, Box, ButtonGroup, TableContainer, Table, Thead, Tr, Th, Td, Tbody, Checkbox, Badge } from '@chakra-ui/react';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";
import Tickbox from "../form/Tickbox";


export default function ViewWishlistPopup({isOpen, onClose, wishlist}) {
    const {DISPLAY} = useLanguage();

    const checkedItems = wishlist.filter(item => item.checked).length;
    const pendingItems = wishlist.length - checkedItems;

    const getPriorityBadge = priority =>{
        return (
            <Badge
                borderRadius='6px'
                paddingX={theme.paddingL}
                color='#0F172A'
                textTransform='none'
                width='fit-content'
                backgroundColor={
                    priority === 'high' ? theme.error
                        : priority === 'medium' ? theme.warning : theme.success
                }
            >
                {
                    priority === 'high' ? DISPLAY.TEXT.HIGH : priority === 'medium'
                            ? DISPLAY.TEXT.MEDIUM : DISPLAY.TEXT.LOW
                }
            </Badge>
        );
    }

    const downloadUnchecked = (e) =>{
        const uncheckedItems = wishlist.filter(item => !item.checked);

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.WISHLIST, 14, 20);
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
            head: [[
                DISPLAY.TEXT.ITEM_NAME,
                DISPLAY.TEXT.PRIORITY
            ]],
            body: uncheckedItems.map(item =>[
                item.name,
                item.priority === 'high' ? DISPLAY.TEXT.HIGH
                    : item.priority === 'medium' ? DISPLAY.TEXT.MEDIUM : DISPLAY.TEXT.LOW
            ])
        });

        doc.save(`${DISPLAY.TEXT.WISHLIST}_${DISPLAY.TEXT.PENDING_ITEMS}_${Date.now()}.pdf`);
    }

    const downloadAll = (e) =>{
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.WISHLIST, 14, 20);
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
            head: [[
                DISPLAY.TEXT.STATUS,
                DISPLAY.TEXT.ITEM_NAME,
                DISPLAY.TEXT.PRIORITY
            ]],
            body: wishlist.map(item =>[
                item.checked ? DISPLAY.TEXT.DONE : DISPLAY.TEXT.PENDING,
                item.name,
                item.priority === 'high' ? DISPLAY.TEXT.HIGH
                    : item.priority === 'medium' ? DISPLAY.TEXT.MEDIUM : DISPLAY.TEXT.LOW
            ]),
            didParseCell: data =>{
                if(data.section === 'body' && data.row.raw?.[0] === DISPLAY.TEXT.PENDING){
                    data.cell.styles.fillColor = [137, 214, 124];
                }
            }
        });

        doc.save(`${DISPLAY.TEXT.WISHLIST}_${Date.now()}.pdf`);
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.WISHLIST} bg={theme.bg} borderColor={theme.info}>
            <Flex gap={theme.marginL} marginBottom={theme.marginL}>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.TOTAL_ITEMS}
                    </Text>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                        {wishlist.length}
                    </Text>
                </Box>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.DONE}
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
                            <Th color={theme.text} width='60%' textAlign='left' textTransform='none'>
                                {DISPLAY.TEXT.ITEM_NAME}
                            </Th>
                            <Th color={theme.text} width='30%' textAlign='left' textTransform='none'>
                                {DISPLAY.TEXT.PRIORITY}
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {
                            wishlist.map((item, index) =>
                                <Tr key={index} bgColor={item.checked ? 'transparent' : theme.hoverBg} borderTop={`1px solid ${theme.border}`}>
                                    <Td width='10%' textAlign='center'>
                                        <Tickbox isChecked={item.checked} isReadOnly />
                                    </Td>
                                    <Td color={item.checked ? theme.textSecondary : theme.text} width='60%' textAlign='left'>
                                        {item.name}
                                    </Td>
                                    <Td width='30%' textAlign='left'>
                                        {getPriorityBadge(item.priority)}
                                    </Td>
                                </Tr>
                            )
                        }
                    </Tbody>
                </Table>
            </TableContainer>

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_PENDING} onClick={downloadUnchecked} disabled={pendingItems === 0} />
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_ALL} onClick={downloadAll} actionType='primary' disabled={wishlist.length === 0} />
            </ButtonGroup>
        </Popup>
    );
}