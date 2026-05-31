import React, { useState } from 'react';
import { Text } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import { TbWheel } from "react-icons/tb";

export default function VaultCard({title, onClick, icon}) {
    const [isOpening, setIsOpening] = useState(false);

    function handleClick() {
        setIsOpening(true);
        setTimeout(()=>{
            setIsOpening(false);
            onClick();
        }, 1000);
    }

    return (
        <div onClick={handleClick} style={{border: `1px solid ${theme.border}`, borderRadius:'21px', height:'141.5px', width:'141.5px', cursor: 'pointer'}}>
            <div style={{height:'140px', width:'140px', backgroundColor:theme.border, border:`15px solid ${theme.cardBg}`, borderRadius:'20px', position:'relative', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <div style={{position:'absolute', left:'-6px', top:'16px', width:'12px', height:'26px', backgroundColor:theme.cardBg, borderRadius:'6px', border: `2px solid ${theme.border}` }} />
                <div style={{position:'absolute', left:'-6px', bottom:'16px', width:'12px', height:'26px', backgroundColor:theme.cardBg, borderRadius:'6px', border: `2px solid ${theme.border}`}} />
                
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection: 'column', gap: '5px'}}>
                    <div style={{height:'70px', width:'70px', marginTop:'5px', color:theme.cardBg, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {
                            isOpening ? (
                                <TbWheel style={{height:'70px', width:'70px', color:theme.cardBg, animation:'spin 1s linear'}} />
                            ) : (
                                icon
                            )
                        }
                    </div>
                    <Text color={theme.textSecondary} fontSize={theme.smallTextSize}>{title}</Text>
                </div>
            </div>
        </div>
    );
}

    

