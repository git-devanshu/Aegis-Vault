import React from "react";
import { theme } from '../../themes/theme';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useLanguage from "../../hooks/useLanguage";

import { Flex, Text, Box, ButtonGroup, Badge } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { MdLocalMovies, MdLiveTv } from "react-icons/md";
import { GiNinjaHead } from "react-icons/gi";
import { FaYoutube } from "react-icons/fa";

import Popup from "../popup/Popup";
import ActionButton from "../form/ActionButton";


export default function ViewWatchlistPopup({isOpen, onClose, watchlist}) {
    const {DISPLAY} = useLanguage();

    const watchedItems = watchlist.filter(item => item.checked).length;
    const pendingItems = watchlist.length - watchedItems;

    const getTypeIcon = type =>{
        switch(type){
            case 'movie': return <MdLocalMovies size='28px' color={theme.text}/>;
            case 'series': return <MdLiveTv size='28px' color={theme.text}/>;
            case 'anime': return <GiNinjaHead size='28px' color={theme.text}/>;
            case 'video': return <FaYoutube size='28px' color={theme.text}/>;
            default: return <MdLocalMovies size='28px' color={theme.text}/>;
        }
    }

    const downloadWatchlist = e =>{
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.WATCHLIST, 14, 20);
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
                DISPLAY.TEXT.RATING,
                DISPLAY.TEXT.CATEGORY,
                DISPLAY.TEXT.STATUS
            ]],
            body: watchlist.map(item =>[
                item.type === 'movie' ? DISPLAY.TEXT.MOVIE :
                item.type === 'series' ? DISPLAY.TEXT.SERIES :
                item.type === 'anime' ? DISPLAY.TEXT.ANIME :
                DISPLAY.TEXT.VIDEO,
                item.name,
                item.rating,
                item.category === 'personal' ? DISPLAY.TEXT.PERSONAL : DISPLAY.TEXT.GENERAL,
                item.checked ? DISPLAY.TEXT.WATCHED : DISPLAY.TEXT.PENDING
            ]),
            didParseCell: data =>{
                if(data.section === 'body' && data.row.raw?.[3] === DISPLAY.TEXT.PERSONAL){
                    data.cell.styles.fillColor = [137, 214, 124];
                }
            }
        });

        doc.save(`${DISPLAY.TEXT.WATCHLIST}_${Date.now()}.pdf`);
    }

    const downloadGeneralWatchlist = e =>{
        const doc = new jsPDF();
        const generalItems = watchlist.filter(item => item.category === 'general');
        doc.setFontSize(20);
        doc.text(DISPLAY.TEXT.WATCHLIST, 14, 20);
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
                DISPLAY.TEXT.RATING,
                DISPLAY.TEXT.STATUS
            ]],
            body: generalItems.map(item =>[
                item.type === 'movie' ? DISPLAY.TEXT.MOVIE :
                item.type === 'series' ? DISPLAY.TEXT.SERIES :
                item.type === 'anime' ? DISPLAY.TEXT.ANIME :
                DISPLAY.TEXT.VIDEO,
                item.name,
                item.rating,
                item.checked ? DISPLAY.TEXT.WATCHED : DISPLAY.TEXT.PENDING
            ])
        });

        doc.save(`${DISPLAY.TEXT.GENERAL}_${DISPLAY.TEXT.WATCHLIST}_${Date.now()}.pdf`);
    }

    return (
        <Popup isOpen={isOpen} onClose={onClose} title={DISPLAY.TEXT.WATCHLIST} bg={theme.bg} borderColor={theme.info}>
            <Flex gap={theme.marginL} marginBottom={theme.marginL}>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.TOTAL_ITEMS}
                    </Text>
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={600}>
                        {watchlist.length}
                    </Text>
                </Box>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.WATCHED}
                    </Text>
                    <Text color={theme.success} fontSize={theme.textSize} fontWeight={600}>
                        {watchedItems}
                    </Text>
                </Box>
                <Box flex={1} paddingX={theme.paddingL} paddingY={theme.paddingS} bgColor={theme.cardBg} borderRadius={theme.radius}>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                        {DISPLAY.TEXT.PENDING}
                    </Text>
                    <Text color={theme.warning} fontSize={theme.textSize} fontWeight={600}>
                        {pendingItems}
                    </Text>
                </Box>
            </Flex>

            <Box maxHeight='450px' overflowY='auto'>
                {watchlist.length === 0 &&
                    <div style={{width:'100%', display:'flex', marginTop:theme.marginL, marginBottom:theme.spacing, justifyContent:'center'}}>
                        <Text color={theme.textSecondary} fontSize={theme.smallTextSize} border={`1px solid ${theme.border}`} borderRadius={theme.radius} padding={`${theme.paddingS} ${theme.paddingL}`}>
                            {DISPLAY.TEXT.NO_DATA}
                        </Text>
                    </div>
                }

                {
                    watchlist.map((item, index) =>
                        <Flex key={index} align='start' gap={theme.paddingL} padding={theme.paddingL} marginBottom={theme.marginS} bgColor={item.category === 'personal' ? theme.accent : theme.cardBg} borderRadius={theme.radius}>
                            <Box marginTop='2px'>
                                {getTypeIcon(item.type)}
                            </Box>

                            <Flex flex={1} direction='column'>
                                <Text color={theme.text} fontSize={theme.textSize}>
                                    {item.name}
                                </Text>
                                <Flex align='center' gap={theme.marginS}>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginRight={theme.marginL}>
                                        {item.type}
                                    </Text>
                                    <StarIcon color='#EAB308'/>
                                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>
                                        {item.rating || '-'}
                                    </Text>
                                </Flex>
                            </Flex>

                            {item.checked &&
                                <Badge borderRadius='6px' paddingX={theme.paddingL} color='#0F172A' textTransform='none' backgroundColor={theme.success}>
                                    {DISPLAY.TEXT.WATCHED}
                                </Badge>
                            }
                        </Flex>
                    )
                }
            </Box>

            <ButtonGroup width='full' marginTop={theme.marginL} marginBottom={theme.marginS}>
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_ALL} onClick={downloadWatchlist} disabled={watchlist.length === 0}/>
                <ActionButton name={DISPLAY.BUTTONS.DOWNLOAD_GENERAL} onClick={downloadGeneralWatchlist} actionType='primary' disabled={watchlist.filter(item => item.category === 'general').length === 0}/>
            </ButtonGroup>
        </Popup>
    );
}