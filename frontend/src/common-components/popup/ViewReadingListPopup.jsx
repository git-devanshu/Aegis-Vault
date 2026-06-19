import React from "react";
import { theme } from '../../themes/theme';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useLanguage from "../../hooks/useLanguage";

import { Flex, Text, Box, Grid, Divider, Badge, ButtonGroup } from '@chakra-ui/react';
import { SiMdbook } from "react-icons/si";
import { RiArticleLine } from "react-icons/ri";
import { FaRegFileAlt } from "react-icons/fa";

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";


export default function ViewReadingListPopup({isOpen, onClose, readingList}) {
    const {DISPLAY} = useLanguage();

    const completedItems = readingList.filter(item => item.checked).length;
    const pendingItems = readingList.length - completedItems;

    const getTypeIcon = type =>{
        switch(type){
            case 'book': return <SiMdbook size='26px' color={theme.text}/>;
            case 'article': return <RiArticleLine size='26px' color={theme.text}/>;
            case 'other': return <FaRegFileAlt size='24px' color={theme.text}/>;
            default: return <SiMdbook size='26px' color={theme.text}/>;
        }
    }

    const downloadPending = e =>{
        const pendingReadingList = readingList.filter(item => !item.checked);
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.READING_LIST, 14, 20);
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
                DISPLAY.TEXT.TYPE,
                DISPLAY.TEXT.ITEM_NAME,
                DISPLAY.TEXT.NOTES
            ]],
            body: pendingReadingList.map(item =>[
                item.type === 'book'
                    ? DISPLAY.TEXT.BOOK
                    : item.type === 'article' ? DISPLAY.TEXT.ARTICLE : DISPLAY.TEXT.OTHER,
                item.name,
                item.notes
            ])
        });

        doc.save(`${DISPLAY.TEXT.READING_LIST}_${DISPLAY.TEXT.PENDING_ITEMS}_${Date.now()}.pdf`);
    }

    const downloadAll = e =>{
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.READING_LIST, 14, 20);
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
                DISPLAY.TEXT.TYPE,
                DISPLAY.TEXT.ITEM_NAME,
                DISPLAY.TEXT.NOTES,
                DISPLAY.TEXT.STATUS
            ]],
            body: readingList.map(item =>[
                item.type === 'book' ? DISPLAY.TEXT.BOOK
                    : item.type === 'article' ? DISPLAY.TEXT.ARTICLE : DISPLAY.TEXT.OTHER,
                item.name,
                item.notes,
                item.checked ? DISPLAY.TEXT.COMPLETED : DISPLAY.TEXT.PENDING
            ]),
            didParseCell: data =>{
                if(data.section === 'body' && data.row.raw?.[3] === DISPLAY.TEXT.COMPLETED){
                    data.cell.styles.fillColor = [137, 214, 124];
                }
            }
        });

        doc.save(`${DISPLAY.TEXT.READING_LIST}_${Date.now()}.pdf`);
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.READING_LIST} bg={theme.bg} borderColor={theme.info}>
            <Flex gap={theme.marginL} marginBottom={theme.marginL}>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.TOTAL_ITEMS}
                    </Text>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                        {readingList.length}
                    </Text>
                </Box>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.COMPLETED}
                    </Text>
                    <Text color={theme.success} fontSize={theme.textSize} fontWeight={600}>
                        {completedItems}
                    </Text>
                </Box>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.PENDING_ITEMS}
                    </Text>
                    <Text color={theme.warning} fontSize={theme.textSize} fontWeight={600}>
                        {pendingItems}
                    </Text>
                </Box>
            </Flex>

            <Box maxHeight='450px' overflowY='auto'>
                {readingList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }
                {
                    readingList.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Box marginTop='2px'>
                                {getTypeIcon(item.type)}
                            </Box>

                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>
                                <Text color={theme.textSecondary} fontSize={theme.smallTextSize} noOfLines={2}>
                                    {item.notes}
                                </Text>
                            </Flex>

                            {item.checked &&
                                <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none' backgroundColor={theme.success}>
                                    {DISPLAY.TEXT.COMPLETED}
                                </Badge>
                            }
                        </Flex>
                    )
                }
            </Box>

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_PENDING} onClick={downloadPending} disabled={pendingItems === 0} />
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_ALL} onClick={downloadAll} actionType='primary' disabled={readingList.length === 0} />
            </ButtonGroup>
        </Popup>
    );
}