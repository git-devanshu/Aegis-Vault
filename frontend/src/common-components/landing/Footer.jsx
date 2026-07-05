import React from "react";
import { Text, Flex, Box } from "@chakra-ui/react";
import useLanguage from "../../hooks/useLanguage";
import { theme } from "../../themes/theme";


export default function Footer({setShowPasswordGuide, setShowExpenseGuide, setShowInvestmentGuide, setShowPlanningGuide}) {
    const { DISPLAY } = useLanguage();

    const groups = [
        {
            title: DISPLAY.TEXT.FOOTER_PRODUCT,
            links: [
                {label: DISPLAY.TEXT.PASSWORD_MANAGER, onClick: ()=> setShowPasswordGuide(true)},
                {label: DISPLAY.TEXT.EXPENSE_MANAGER, onClick: ()=> setShowExpenseGuide(true)},
                {label: DISPLAY.TEXT.INVESTMENT_MANAGER, onClick: ()=> setShowInvestmentGuide(true)},
                {label: DISPLAY.TEXT.PLANNING_MANAGER, onClick: ()=> setShowPlanningGuide(true)}
            ]
        },
        {
            title: DISPLAY.TEXT.FOOTER_RESOURCES,
            links: [
                {label: DISPLAY.TEXT.FOOTER_ABOUT, onClick: ()=> {}},
                {label: DISPLAY.TEXT.FOOTER_SUPPORT, onClick: ()=> {}}
            ]
        }
    ];

    return (
        <Box width={{ base: "90%", md: "94%" }} margin="0 auto" border={`1px solid ${theme.border}`} backgroundColor={theme.bg}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" gap={theme.spacing} padding={theme.spacing} borderBottom={`1px solid ${theme.border}`}>
                <Flex direction="column" gap={theme.paddingL} maxWidth="260px">
                    <Text color={theme.primary} fontSize='lg' fontWeight={600}>⛉Aegis</Text>
                    <Text color={theme.textSecondary} fontSize="sm" lineHeight="1.6">
                        {DISPLAY.TEXT.FOOTER_TAGLINE}
                    </Text>
                </Flex>

                <Flex gap={{base: theme.spacing, md: "60px"}} wrap="wrap">
                    {groups.map(group =>
                        <Flex key={group.title} direction="column" gap="10px">
                            <Text fontSize="xs" fontWeight={700} letterSpacing="0.1em" textTransform="uppercase" color={theme.text}>
                                {group.title}
                            </Text>

                            {group.links.map(link =>
                                <Text
                                    key={link.label}
                                    fontSize="sm"
                                    color={theme.textSecondary}
                                    _hover={{color: theme.primary}}
                                    cursor="pointer"
                                    onClick={link.onClick}
                                >
                                    {link.label}
                                </Text>
                            )}
                        </Flex>
                    )}
                </Flex>
            </Flex>

            <Flex justify="space-between" align="center" gap="12px" padding={theme.spacing}>
                <Text fontSize="xs" color={theme.textSecondary}>
                    {DISPLAY.TEXT.FOOTER_RIGHTS_RESERVED}
                </Text>
                <Flex gap={theme.spacing} fontSize="xs" color={theme.textSecondary}>
                    <Text as="a" href="" _hover={{ color: theme.primary }} cursor="pointer">{DISPLAY.TEXT.FOOTER_PRIVACY}</Text>
                </Flex>
            </Flex>
        </Box>
    );
}
