import React, {useState} from 'react';
import { theme } from '../../themes/theme';

export default function ToggleSwitch({ value, onChange, disabled = false }) {
    return (
        <div
            onClick={() => {
                if (!disabled) {
                    onChange(!value);
                }
            }}
            style={{
                width: '34px',         /* Reduced from 48px */
                height: '20px',        /* Reduced from 28px */
                borderRadius: '999px',
                backgroundColor: value ? theme.primary : theme.hoverBg,
                padding: '3px',        /* Reduced from 4px for better symmetry */
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: '0.25s',
                display: 'flex',
                alignItems: 'center',
                opacity: disabled ? 0.5 : 1,
                boxSizing: 'border-box' /* Ensures padding doesn't affect size calculations */
            }}
        >
            <div
                style={{
                    width: '14px',     /* Reduced to exactly 14px */
                    height: '14px',    /* Reduced to exactly 14px */
                    borderRadius: '50%',
                    backgroundColor: theme.text,
                    /* 34px container - (2 * 3px padding) - 14px knob = 14px total travel distance */
                    transform: value ? 'translateX(14px)' : 'translateX(0px)',
                    transition: '0.23s'
                }}
            />
        </div>
    );
}
