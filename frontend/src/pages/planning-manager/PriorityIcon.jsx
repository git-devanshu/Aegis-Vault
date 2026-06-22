import React from "react";
import { theme } from '../../themes/theme';

export default function PriorityIcon({priority}) {
    const levels = {
        low: 1,
        medium: 2,
        high: 3
    };

    const color = {
        low: theme.success,
        medium: theme.warning,
        high: theme.error
    };

    return (
        <div style={{display:'flex', flexDirection:'column', lineHeight:0}}>
            {
                [...Array(levels[priority] || 1)].map((_, index) =>
                    <svg key={index} width={15} height={9} viewBox='0 0 24 14'>
                        <path
                            d='M2 12 L12 2 L22 12'
                            stroke={color[priority]}
                            strokeWidth={4}
                            fill='none'
                        />
                    </svg>
                )
            }
        </div>
    );
}