import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { theme } from '../../themes/theme';
import { Divider, Text, Flex, Stack, useMediaQuery, ButtonGroup, Spacer } from '@chakra-ui/react'
import { createHash, createPassKey } from '../../utility/crypto';
import { validateAndStartLoading, apiRequest } from "../../utility/api";
import { decodeToken, downloadPassKeyFile, getAuthToken } from '../../utility/helpers';
import useLanguage from "../../hooks/useLanguage";
import useAppContext from "../../hooks/useAppContext";
import useClearOnUnmount from '../../hooks/useClearOnUnmount';

import { ArrowBackIcon } from '@chakra-ui/icons';
import { MdRefresh, MdDevices } from "react-icons/md";
import { FaInfo } from "react-icons/fa";
import { TbDeviceDesktopOff } from 'react-icons/tb';

import InputBox from "../../common-components/form/InputBox";
import ActionButton from "../../common-components/form/ActionButton";
import TitleBar from "../../common-components/navbar/TitleBar";


export default function ContactUs() {
    return (
        <div className="common-page">
            <TitleBar>
                <ActionButton icon={<ArrowBackIcon/>} name={DISPLAY.BUTTONS.BACK} onClick={()=> navigate('/')} disabled={isLoading} customStyle={{width: 'fit-content'}}/>
            </TitleBar>
            <Divider borderColor={theme.border} borderWidth='1px' />

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={theme.paddingL} marginTop={theme.marginL} alignItems='start'>
                {/* Left Side */}
                <Box>

                </Box>

                {/* Right Side */}
                <Box>

                </Box>
            </Grid>
        </div>
    );
}
