import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Text, Flex, Box, useBreakpointValue } from "@chakra-ui/react";
import { FiDatabase, FiLock, FiCloud, FiKey } from "react-icons/fi";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";

const FlowConnector = ({ active, vertical }) => (
    <Box
        position="relative"
        flex={vertical ? "none" : 1}
        width={vertical ? "2px" : "auto"}
        height={vertical ? "40px" : "2px"}
        minWidth={vertical ? "2px" : "40px"}
        backgroundColor={theme.border}
        overflow="hidden"
        margin={vertical ? `0 auto` : `0 ${theme.paddingL}`}
    >
        <motion.div
            animate={active ? (vertical ? { top: ["-20px", "60px"] } : { left: ["-20px", "100%"] }) : {}}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
                position: "absolute",
                width: vertical ? "100%" : "20px",
                height: vertical ? "20px" : "100%",
                backgroundColor: theme.primary,
            }}
        />
    </Box>
);

const FlowNode = ({ Icon, title, caption, index, isInView }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 16 }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
            style={{
                padding: theme.paddingL,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: theme.paddingL,
                minWidth: "150px",
                textAlign: "center",
            }}
        >
            <motion.div
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: theme.radius,
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon color={theme.primary} size="28px" />
            </motion.div>
            <Text color={theme.text} fontWeight={600} fontSize='lg'>
                {title}
            </Text>
            <Text color={theme.textSecondary} fontSize={theme.textSize}>
                {caption}
            </Text>
        </motion.div>
    );
};

export default function ZeroKnowledgeFlow() {
    const { DISPLAY } = useLanguage();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });
    const isVertical = useBreakpointValue({ base: true, md: false });

    const steps = [
        { Icon: FiDatabase, title: DISPLAY.TEXT.USER_DATA, caption: DISPLAY.TEXT.USER_DATA_DESC },
        { Icon: FiLock, title: DISPLAY.TEXT.ENCRYPTED_ON_DEVICE, caption: DISPLAY.TEXT.ENCRYPTED_ON_DEVICE_DESC },
        { Icon: FiCloud, title: DISPLAY.TEXT.CLOUD_STORAGE, caption: DISPLAY.TEXT.CLOUD_STORAGE_DESC },
        { Icon: FiKey, title: DISPLAY.TEXT.ONLY_YOU_CAN_DECRYPT, caption: DISPLAY.TEXT.ONLY_YOU_CAN_DECRYPT_DESC },
    ];

    return (
        <Flex ref={ref} direction={{ base: "column", md: "row" }} align="center" justify="center" width="100%" padding={theme.spacing} gap={0}>
            {steps.map((step, i) => (
                <React.Fragment key={step.title}>
                    <FlowNode {...step} index={i} isInView={isInView} />
                    {i < steps.length - 1 && (
                        <Box width={{ base: "100%", md: "auto" }}>
                            <FlowConnector active={isInView} vertical={isVertical} />
                        </Box>
                    )}
                </React.Fragment>
            ))}
        </Flex>
    );
}
