import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, Text, Box } from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";


export default function FAQAccordion() {
    const { DISPLAY } = useLanguage();

    const faqs = [
        { q: DISPLAY.TEXT.FAQ_Q1, a: DISPLAY.TEXT.FAQ_A1 },
        { q: DISPLAY.TEXT.FAQ_Q2, a: DISPLAY.TEXT.FAQ_A2 },
        { q: DISPLAY.TEXT.FAQ_Q3, a: DISPLAY.TEXT.FAQ_A3 },
        { q: DISPLAY.TEXT.FAQ_Q4, a: DISPLAY.TEXT.FAQ_A4 },
        { q: DISPLAY.TEXT.FAQ_Q5, a: DISPLAY.TEXT.FAQ_A5 },
    ];

    return (
        <Box width="100%">
            <Accordion allowToggle>
                {faqs.map((item, i) => (
                    <AccordionItem key={item.q} padding={theme.paddingL} borderColor={theme.border} borderTop={`1px solid ${theme.border}`}>
                        {({ isExpanded }) => (
                            <>
                                <AccordionButton padding={theme.paddingL}>
                                    <Text flex="1" textAlign="left" color={isExpanded ? theme.primary : theme.text} fontSize='lg' fontWeight={500}>
                                        {item.q}
                                    </Text>
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25, ease: "easeOut" }}>
                                        <ChevronDownIcon boxSize='22px' color={theme.textSecondary} />
                                    </motion.div>
                                </AccordionButton>
                                <AccordionPanel color={theme.textSecondary} fontSize={theme.textSize} lineHeight="1.6" paddingBottom={theme.paddingL}>
                                    {item.a}
                                </AccordionPanel>
                            </>
                        )}
                    </AccordionItem>
                ))}
            </Accordion>
        </Box>
    );
}
