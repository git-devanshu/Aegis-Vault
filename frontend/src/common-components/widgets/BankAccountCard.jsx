import React from 'react';
import { Flex, Text, Grid, Image, Box } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import BANKS from '../../assets/banks.json';
import { getContrastColor } from '../../utility/helpers';
import useLanguage from '../../hooks/useLanguage';
import { MdSwapHorizontalCircle } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { GiMoneyStack } from 'react-icons/gi';


export default function BankAccountCard({account, setShowManageAccountModal, showIncomeAndExpense=true, hideAccountBalanceInCard=false}) {
    if(!account) return null;
    const {DISPLAY} = useLanguage();
    
    const bank = BANKS.banks[account.bankId];
    const country = BANKS.country[account.countryCode];
    const maskedAccountNo = `**** **** **** ${account.accountNo.slice(-4)}`;
    const formattedBalance = `${country.currency.symbol} ${(account.totalIncome - account.totalExpense).toLocaleString(country.locale)}`;
    const textColor = getContrastColor(bank.color);

    return (
        <div>
            <div style={{ backgroundColor: bank.color, borderRadius: `calc(${theme.radius} * 2)`, padding:theme.paddingL, color: textColor, minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                <Flex gap={theme.paddingL} align='center'>
                    <Image src={bank.logo} alt={bank.bankName} width='48px' height='48px' borderRadius='4px' />
                    <div>
                        <Text fontSize={theme.text} fontWeight={500} opacity={0.85}>
                            {bank.bankName}
                        </Text>
                        <Text fontSize={theme.smallTextSize} opacity={0.9}>
                            {country.countryName}
                        </Text>
                    </div>
                </Flex>

                {!hideAccountBalanceInCard && <Text fontSize={`calc(${theme.headingSize} * 1.5)`} fontWeight={600}>
                    {formattedBalance}
                </Text>}
                <Text letterSpacing='1px' fontSize={theme.headingSize} fontFamily='math' fontWeight={600}>
                    {maskedAccountNo}
                </Text>

                <Flex justify='space-between' align='center' marginTop={theme.marginS}>
                    <Text fontSize={theme.textSize} fontWeight={500} opacity={0.9}>
                        {account.accountAlias}
                    </Text>
                    <Box onClick={()=> setShowManageAccountModal(true)} display='flex' alignItems='center' backgroundColor={theme.bg} borderRadius='25px' padding='6px 10px' gap='5px' cursor='pointer' _hover={{backgroundColor: theme.cardBg}}>
                        <MdSwapHorizontalCircle style={{fontSize:'20px', color:theme.text}}/>
                        <Text fontSize={theme.textSize} color={theme.text}>
                            {DISPLAY.BUTTONS.SWITCH}
                        </Text>
                    </Box>         
                </Flex>
            </div>

            {/* Income and Expense */}
            {showIncomeAndExpense &&
                <Grid templateColumns='1fr 1fr' gap={theme.paddingL} marginTop={theme.paddingL}>
                    <Flex direction='column' justify='space-between' style={{ backgroundColor:theme.cardBg, border:`1px solid ${theme.border}`, borderRadius: `calc(${theme.radius} * 2)`, padding:theme.paddingL }}>
                        <Flex align='center'>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px'}}>
                                <TbMoneybag size='22px' color={theme.text} />
                            </div>
                            <Text color={theme.textSecondary} fontSize={theme.textSize} marginLeft={theme.marginL}>{DISPLAY.TEXT.TOTAL_INCOME}</Text>
                        </Flex>
                        <Text color={theme.text} fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL} marginLeft={theme.marginS}>
                            {country.currency.symbol} {account.totalIncome?.toLocaleString(country.locale) || 0}
                        </Text>
                    </Flex>

                    <Flex direction='column' justify='space-between' style={{ backgroundColor:theme.primary, border:`1px solid ${theme.primary}`, borderRadius: `calc(${theme.radius} * 2)`, padding:theme.paddingL }}>
                        <Flex align='center'>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, borderRadius: '50%', padding: '6px'}}>
                                <GiMoneyStack size='22px' color={theme.text} />
                            </div>
                            <Text color='#0F172A' fontSize={theme.textSize} marginLeft={theme.marginL} fontWeight={500}>{DISPLAY.TEXT.TOTAL_EXPENSE}</Text>
                        </Flex>
                        <Text color='#0F172A' fontSize={theme.headingSize} fontWeight={600} marginTop={theme.marginL} marginLeft={theme.marginS}>
                            {country.currency.symbol} {account.totalExpense?.toLocaleString(country.locale) || 0}
                        </Text>
                    </Flex>
                </Grid>
            }
        </div>
    );
}
