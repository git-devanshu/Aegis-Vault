import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Text, Flex, Grid } from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import { GiMoneyStack, GiGoldBar } from "react-icons/gi";
import { BsCalendar } from "react-icons/bs";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";


const VaultCard = ({ title, description, Icon, index }) => {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, amount: 0.4 });

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 24 }}
            transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
            style={{ perspective: "900px", width: "100%" }}
        >
            <motion.div
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                style={{
                    transformStyle: "preserve-3d",
                    padding: theme.spacing,
                    height: "100%",
                }}
            >
                <motion.div
                    style={{
                        transformStyle: "preserve-3d",
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.paddingL,
                    }}
                >
                    <Flex align='center' gap={theme.paddingL}>
                        <Flex align="center" justify="center" width="46px" height="46px" border={`1px solid ${theme.border}`} borderRadius={theme.radius} backgroundColor={theme.bg}>
                            <Icon color={theme.primary} size="20px" />
                        </Flex>
                        <Text color={theme.text} fontWeight={600} fontSize="lg">
                            {title}
                        </Text>
                    </Flex>
                    <Text color={theme.textSecondary} fontSize={theme.textSize} lineHeight="1.5">
                        {description}
                    </Text>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default function FeaturedVaults() {
    const { DISPLAY } = useLanguage();

    const vaults = [
        { title: DISPLAY.TEXT.PASSWORD_MANAGER, description: DISPLAY.TEXT.PASSWORD_MANAGER_DESC, Icon: LockIcon },
        { title: DISPLAY.TEXT.EXPENSE_MANAGER, description: DISPLAY.TEXT.EXPENSE_MANAGER_DESC, Icon: GiMoneyStack },
        { title: DISPLAY.TEXT.INVESTMENT_MANAGER, description: DISPLAY.TEXT.INVESTMENT_MANAGER_DESC, Icon: GiGoldBar },
        { title: DISPLAY.TEXT.PLANNING_MANAGER, description: DISPLAY.TEXT.PLANNING_MANAGER_DESC, Icon: BsCalendar },
    ];

    return (
        <Grid templateColumns={{base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr 1fr'}} backgroundColor={theme.border} gap='1px' width="100%">
            {vaults.map((vault, i) => (
                <Flex key={vault.title} backgroundColor={theme.bg} flex={{ base: "1 1 100%", sm: "1 1 calc(50% - 16px)", lg: "1 1 calc(25% - 16px)" }}>
                    <VaultCard {...vault} index={i} />
                </Flex>
            ))}
        </Grid>
    );
}
