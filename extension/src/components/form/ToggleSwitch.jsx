import React, {useState} from 'react';
import { theme } from '../../themes/theme';

export default function ToggleSwitch({value, onChange, disabled = false}) {
    return (
        <div
            onClick={()=>{
                if(!disabled){
                    onChange(!value);
                }
            }}
            style={{
                width:'48px',
                height:'28px',
                borderRadius:'999px',
                backgroundColor:value ? theme.primary : theme.hoverBg,
                padding:'4px',
                cursor:disabled ? 'not-allowed' : 'pointer',
                transition:'0.25s',
                display:'flex',
                alignItems:'center',
                opacity:disabled ? 0.5 : 1
            }}
        >
            <div
                style={{
                    width:'20px',
                    height:'20px',
                    borderRadius:'50%',
                    backgroundColor:theme.text,
                    transform:value ? 'translateX(20px)' : 'translateX(0px)',
                    transition:'0.23s'
                }}
            />
        </div>
    );
}
