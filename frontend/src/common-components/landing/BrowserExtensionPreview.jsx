import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Text, Flex, Box } from "@chakra-ui/react";
import { LockIcon, CheckIcon } from "@chakra-ui/icons";
import { IoSettingsOutline } from "react-icons/io5";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";

export default function BrowserExtensionPreview() {
    const { DISPLAY } = useLanguage();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });
    const [filled, setFilled] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setFilled(true), 700);
            return () => clearTimeout(timer);
        }
        setFilled(false);
    }, [isInView]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: py * -4, y: px * 4 });
    };

    return (
        <Flex ref={ref} width="100%" justify="center" padding={theme.spacing} style={{ perspective: "1400px" }}>
            <motion.div
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTilt({ x: 0, y: 0 })}
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
                style={{
                    width: "100%",
                    maxWidth: "620px",
                    border: `1px solid ${theme.border}`,
                    borderRadius: theme.radius,
                    backgroundColor: theme.cardBg,
                    overflow: "hidden",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Browser chrome */}
                <Flex align="center" gap={theme.paddingL} padding={theme.paddingL} borderBottom={`1px solid ${theme.border}`}>
                    <Flex gap="6px">
                        <Box width="8px" height="8px" borderRadius="50%" border={`1px solid ${theme.border}`} backgroundColor={theme.error} opacity={0.7} />
                        <Box width="8px" height="8px" borderRadius="50%" border={`1px solid ${theme.border}`} backgroundColor={theme.warning} opacity={0.7} />
                        <Box width="8px" height="8px" borderRadius="50%" border={`1px solid ${theme.border}`} backgroundColor={theme.success} opacity={0.7} />
                    </Flex>
                    <Flex
                        flex={1}
                        align="center"
                        border={`1px solid ${theme.border}`}
                        borderRadius={theme.radius}
                        backgroundColor={theme.bg}
                        padding="4px 10px"
                        maxWidth="280px"
                    >
                        <Text fontSize="xs" color={theme.textSecondary}>app.yourcompany.com/login</Text>
                    </Flex>
                    <Box marginLeft="auto">
                        <Flex align="center" justify="center" width="26px" color={theme.primary} fontSize='12px' height="26px" border={`1px solid ${theme.border}`} borderRadius={theme.radius} backgroundColor={theme.bg}>
                            ⛉
                        </Flex>
                    </Box>
                </Flex>

                {/* Page body */}
                <Box position="relative" padding={theme.spacing} minHeight="240px">
                    <Flex direction="column" gap={theme.paddingL} maxWidth="260px" margin="0 auto">
                        <Text textAlign="center" color={theme.text} fontWeight={600} marginBottom={theme.paddingL}>
                            {DISPLAY.TEXT.WELCOME_BACK}
                        </Text>
                        {[DISPLAY.TEXT.EMAIL_ADDRESS, DISPLAY.TEXT.PASSWORD].map((label, i) => (
                            <Box key={label}>
                                <Text fontSize="xs" color={theme.textSecondary} marginBottom="4px">{label}</Text>
                                <Box position="relative" border={`1px solid ${theme.border}`} borderRadius={theme.radius} backgroundColor={theme.bg} height="38px" overflow="hidden">
                                    <motion.div
                                        animate={{ width: filled ? "100%" : "0%" }}
                                        transition={{ duration: 0.6, delay: i * 0.3, ease: "easeOut" }}
                                        style={{ position: "absolute", inset: 0, backgroundColor: theme.hoverBg || theme.border }}
                                    />
                                    <Flex position="relative" height="100%" align="center" paddingX="10px">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: filled ? 1 : 0 }}
                                            transition={{ delay: 0.6 + i * 0.3 }}
                                        >
                                            <Text fontSize="sm" color={theme.text} fontFamily="mono">
                                                {i === 0 ? "you@company.com" : "••••••••••••"}
                                            </Text>
                                        </motion.div>
                                    </Flex>
                                </Box>
                            </Box>
                        ))}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: filled ? 1 : 0 }}
                            transition={{ delay: 1.2 }}
                            style={{
                                textAlign: "center",
                                backgroundColor: theme.primary,
                                color: theme.bg,
                                borderRadius: theme.radius,
                                padding: "8px",
                                fontWeight: 600,
                                fontSize: theme.textSize,
                                marginTop: theme.marginL
                            }}
                        >
                            {DISPLAY.TEXT.SIGN_IN}
                        </motion.div>
                    </Flex>

                    {/* Extension popup */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : -10 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        style={{
                            position: "absolute",
                            top: theme.spacing,
                            right: theme.spacing,
                            width: "200px",
                            border: `1px solid ${theme.border}`,
                            borderRadius: theme.radius,
                            backgroundColor: theme.bg,
                            boxShadow: `0 12px 24px rgba(0,0,0,0.15)`,
                            overflow: "hidden",
                        }}
                    >
                        <Flex align="center" gap="6px" paddingX={theme.paddingL} paddingY={theme.paddingS} borderBottom={`1px solid ${theme.border}`}>
                            <Text fontSize="xs" fontWeight={600} color={theme.primary}>⛉Aegis</Text>
                            <Box marginLeft="auto">
                                <IoSettingsOutline color={theme.textSecondary} size='14px' />
                            </Box>
                        </Flex>
                        <Flex align="center" gap="8px" padding={theme.paddingL}>
                            <Flex align="center" justify="center" width="22px" height="22px" borderRadius={theme.radius} backgroundColor={theme.bg} fontSize="xs" fontWeight={700} color={theme.accent}>
                                Y
                            </Flex>
                            <Text fontSize="xs" color={theme.text} flex={1}>you@company.com</Text>
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: filled ? 1 : 0, opacity: filled ? 1 : 0 }}
                                transition={{ delay: 1.4 }}
                            >
                                <CheckIcon boxSize="12px" color={theme.success} />
                            </motion.div>
                        </Flex>
                    </motion.div>
                </Box>
            </motion.div>
        </Flex>
    );
}
