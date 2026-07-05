import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Text, Flex, Box } from "@chakra-ui/react";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";

export default function HowItWorksSteps() {
    const { DISPLAY } = useLanguage();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.4 });

    const steps = [
        { number: "01", title: DISPLAY.TEXT.CREATE_ACCOUNT, desc: DISPLAY.TEXT.CREATE_ACCOUNT_DESC },
        { number: "02", title: DISPLAY.TEXT.CHOOSE_VAULT, desc: DISPLAY.TEXT.CHOOSE_VAULT_DESC },
        { number: "03", title: DISPLAY.TEXT.SAVE_DATA, desc: DISPLAY.TEXT.SAVE_DATA_DESC },
        { number: "04", title: DISPLAY.TEXT.ENCRYPTED_FOREVER, desc: DISPLAY.TEXT.ENCRYPTED_FOREVER_DESC },
    ];

    return (
        <Box ref={ref} position="relative" width="100%" padding={theme.spacing}>
            <Box
                position="absolute"
                top={{ base: "0", md: "50px" }}
                left={{ base: "24px", md: "12%" }}
                right={{ base: "auto", md: "12%" }}
                bottom={{ base: "0", md: "auto" }}
                width={{ base: "2px", md: "auto" }}
                height={{ base: "auto", md: "2px" }}
                backgroundColor={theme.border}
                overflow="hidden"
                display={{ base: "none", md: "block" }}
                zIndex={0}
            >
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: isInView ? "100%" : "0%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{ height: "100%", backgroundColor: theme.primary }}
                />
            </Box>

            <Flex direction={{ base: "column", md: "row" }} gap={theme.spacing} justify="space-between" padding={theme.paddingL}>
                {steps.map((step, i) => (
                    <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
                        transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                        style={{ flex: 1 }}
                    >
                        <Flex direction="column" gap={theme.paddingL} maxWidth="220px">
                            <Flex
                                align="center"
                                justify="center"
                                width="44px"
                                height="44px"
                                borderRadius="50%"
                                border={`1px solid ${theme.border}`}
                                backgroundColor={theme.cardBg}
                                color={theme.primary}
                                fontWeight={700}
                                fontSize="sm"
                                boxShadow={`0 0 0 6px ${theme.bg}`}
                                zIndex={1}
                            >
                                {step.number}
                            </Flex>
                            <Text color={theme.text} fontWeight={600} fontSize='lg'>
                                {step.title}
                            </Text>
                            <Text color={theme.textSecondary} fontSize={theme.textSize} lineHeight="1.5">
                                {step.desc}
                            </Text>
                        </Flex>
                    </motion.div>
                ))}
            </Flex>
        </Box>
    );
}
