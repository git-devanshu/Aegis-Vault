import React from 'react'
import {theme} from './theme';
import useTheme from '../hooks/useTheme';
import { Heading, Text } from '@chakra-ui/react'
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import CircleIconButton from '../common-components/form/CircleIconButton';

export default function ThemeTest() {
    const {aegisTheme, toggleAegisTheme} = useTheme();
    
    return (
        <div style={{padding: theme.paddingL, backgroundColor: theme.bg, height: '100vh'}}>
            <Heading color={theme.text}>{aegisTheme} Theme</Heading>
            <Text color={theme.text} fontSize={theme.textSize}>Normal Text with Text Size</Text>
            <Text color={theme.textSecondary} fontSize={theme.smallTextSize} marginBottom={theme.marginL}>Secondary Text with Small Text Size</Text>
            <CircleIconButton icon={aegisTheme === 'dark' ? <MdOutlineDarkMode/> : <MdOutlineLightMode/>} onClick={toggleAegisTheme}/>

            <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: theme.spacing}}>
                <div style={{height: '150px', width: '150px', borderRadius: theme.radius, backgroundColor: theme.primary, padding: theme.paddingL}}>
                    <Text color={theme.text}>Primary</Text>
                </div>
                <div style={{height: '150px', width: '150px', borderRadius: theme.radius, backgroundColor: theme.accent, padding: theme.paddingL}}>
                    <Text color={theme.text}>Accent</Text>
                </div>
                <div style={{height: '150px', width: '150px', borderRadius: theme.radius, backgroundColor: theme.cardBg, padding: theme.paddingL}}>
                    <Text color={theme.text}>Card BG</Text>
                </div>
                <div style={{height: '150px', width: '150px', borderRadius: theme.radius, backgroundColor: theme.hoverBg, padding: theme.paddingL}}>
                    <Text color={theme.text}>Hover BG</Text>
                </div>
                <div style={{height: '150px', width: '150px', borderRadius: theme.radius, backgroundColor: theme.border, padding: theme.paddingL}}>
                    <Text color={theme.text}>Border</Text>
                </div>
                <div 
                    style={{height: '150px', width: '150px', borderRadius: theme.radius, backgroundColor: theme.cardBg, padding: theme.paddingL, border: `1px solid ${theme.border}`}}
                    onMouseEnter={(e)=>{
                        e.currentTarget.style.backgroundColor = theme.hoverBg;
                    }}
                    onMouseLeave={(e)=>{
                        e.currentTarget.style.backgroundColor = theme.cardBg;
                    }}    
                >
                    <Text color={theme.text}>Card BG with Border and hover effect</Text>
                </div>
            </div>
        </div>
    );
}
