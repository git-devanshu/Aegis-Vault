import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Text, Flex, Box, useBreakpointValue } from "@chakra-ui/react";
import { WiSunrise, WiDaySunny } from "react-icons/wi";
import { GiMoneyStack } from "react-icons/gi";
import { LockIcon } from "@chakra-ui/icons";
import { RiStickyNoteLine } from "react-icons/ri";
import { BsCalendar } from "react-icons/bs";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";

const TimelineCard = ({ time, label, Icon, side }) => (
    <Flex justify={{ base: "flex-start", md: side === "left" ? "flex-end" : "flex-start" }} width="100%">
        <motion.div
            initial={{ opacity: 0, x: side === "left" ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius,
                backgroundColor: theme.cardBg,
                padding: theme.paddingL,
                minWidth: "200px",
                maxWidth: "260px",
            }}
        >
            <Flex align="center" gap={theme.paddingL}>
                <Flex
                    align="center"
                    justify="center"
                    width="36px"
                    height="36px"
                    border={`1px solid ${theme.border}`}
                    borderRadius={theme.radius}
                    backgroundColor={theme.bg}
                    flexShrink={0}
                >
                    <Icon color={theme.primary} size="18px" />
                </Flex>
                <Box>
                    {time && (
                        <Text color={theme.accent} fontSize="xs" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase">
                            {time}
                        </Text>
                    )}
                    <Text color={theme.text} fontSize={theme.textSize} fontWeight={500}>
                        {label}
                    </Text>
                </Box>
            </Flex>
        </motion.div>
    </Flex>
);

export default function DayTimeline() {
    const { DISPLAY } = useLanguage();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.85", "end 0.6"] });
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
    const trackLeft = useBreakpointValue({ base: "18px", md: "50%" });
    const trackTransform = useBreakpointValue({ base: "none", md: "translateX(-50%)" });

    const moments = [
        { time: DISPLAY.TEXT.MORNING, label: DISPLAY.TEXT.CHECK_SCHEDULE, Icon: WiSunrise, side: "left" },
        { time: "", label: DISPLAY.TEXT.LUNCH, Icon: WiDaySunny, side: "right" },
        { time: "", label: DISPLAY.TEXT.SAVE_PASSWORD, Icon: LockIcon, side: "left" },
        { time: DISPLAY.TEXT.EVENING, label: DISPLAY.TEXT.LOG_EXPENSE, Icon: GiMoneyStack, side: "right" },
        { time: DISPLAY.TEXT.NIGHT, label: DISPLAY.TEXT.WRITE_JOURNAL, Icon: RiStickyNoteLine, side: "left" },
    ];

    return (
        <Box ref={containerRef} position="relative" width="100%" padding={theme.spacing}>
            <Box position="absolute"
                left={{ base: "18px", md: "50%" }}
                top={0}
                bottom={0}
                width="2px"
                backgroundColor={theme.border}
                transform={{ base: "none", md: "translateX(-50%)" }}
            />
            <motion.div
                style={{
                    position: "absolute",
                    left: trackLeft,
                    top: 0,
                    width: "2px",
                    backgroundColor: theme.primary,
                    height: lineHeight,
                    transform: trackTransform,
                }}
            />

            <Flex direction="column" gap={theme.spacing} position="relative">
                {moments.map((moment, i) => (
                    <Box key={moment.label} paddingLeft={{ base: "48px", md: 0 }}>
                        <TimelineCard {...moment} />
                    </Box>
                ))}
            </Flex>
        </Box>
    );
}
