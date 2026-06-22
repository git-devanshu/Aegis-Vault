import React from "react";
import { theme } from '../../themes/theme';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useLanguage from "../../hooks/useLanguage";

import { Flex, Text, Box, ButtonGroup, Badge } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";


export default function ViewFoodListPopup({isOpen, onClose, foodList}) {
    const {DISPLAY} = useLanguage();

    const downloadFoodList = (e) =>{
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.FOOD, 14, 20);
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
            head: [[ DISPLAY.REPORT.TYPE, DISPLAY.TEXT.ITEM_NAME, DISPLAY.TEXT.LINK ]],
            body: foodList.map(item =>[
                item.type === 'recipe' ? DISPLAY.TEXT.RECIPE : DISPLAY.TEXT.PLACE,
                item.name,
                item.link
            ]),
            didParseCell: data =>{
                if(data.section === 'body' && data.row.raw?.[0] === DISPLAY.TEXT.RECIPE){
                    data.cell.styles.fillColor = [137, 214, 124];
                }
            }
        });

        doc.save(`${DISPLAY.TEXT.FOOD}_${Date.now()}.pdf`);
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.FOOD} bg={theme.bg} borderColor={theme.info}>
            <Box maxHeight='450px' overflowY='auto'>
                {
                    foodList.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }

                {
                    foodList.map((item, index) =>
                        <Box key={index} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                            <Flex justify='space-between' align='start' marginBottom={theme.marginS}>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>

                                <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none' backgroundColor={item.type === 'recipe' ? theme.warning : theme.info}>
                                    {item.type === 'recipe' ? DISPLAY.TEXT.RECIPE : DISPLAY.TEXT.PLACE}
                                </Badge>
                            </Flex>

                            <Flex align='center' gap={theme.marginS} cursor='pointer' width='fit-content' onClick={() => window.open(item.link, '_blank')}>
                                <ExternalLinkIcon color={theme.info}/>
                                <Text color={theme.info} fontSize={theme.smallTextSize}>
                                    {item.type === 'recipe' ? DISPLAY.TEXT.VIEW_RECIPE : DISPLAY.TEXT.VIEW_LOCATION}
                                </Text>
                            </Flex>
                        </Box>
                    )
                }
            </Box>

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_PDF} onClick={downloadFoodList} actionType='primary' disabled={foodList.length === 0}/>
            </ButtonGroup>
        </Popup>
    );
}
