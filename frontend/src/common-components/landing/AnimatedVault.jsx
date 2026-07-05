import React, {useEffect, useRef, useState} from "react";
import {motion, useInView} from "framer-motion";
import {Text} from "@chakra-ui/react";
import {TbWheel} from "react-icons/tb";
import {theme} from "../../themes/theme";


export default function AnimatedVault(){
    const ref = useRef(null);
    const isInView = useInView(ref, {once:false, amount:0.55});

    const [rotateWheel, setRotateWheel] = useState(false);
    const [openDoor, setOpenDoor] = useState(false);

    useEffect(()=>{
        if(isInView){
            setRotateWheel(true);
            const timer = setTimeout(()=>{
                setOpenDoor(true);
            }, 1000);
            return ()=> clearTimeout(timer);
        }
        setRotateWheel(false);
        setOpenDoor(false);
    }, [isInView]);

    return(
        <div ref={ref} style={{
                width:'260px',
                height:'300px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                perspective:'1800px'
            }}
        >
            {/* Glow */}
            <motion.div
                animate={{
                    opacity: openDoor ? 0.35 : 0,
                    scale: openDoor ? 1 : .7
                }}
                transition={{
                    duration:.8
                }}
                style={{
                    position:'absolute',
                    width:'260px',
                    height:'260px',
                    borderRadius:'50%',
                    background:theme.primary,
                    filter:'blur(90px)'
                }}
            />

            {/* Vault */}
            <div style={{
                    position:'relative',
                    width:'290px',
                    height:'290px'
                }}
            >
                {/* Inside */}
                <div style={{
                        position:'absolute',
                        inset:0,
                        borderRadius:'38px',
                        background:theme.bg,
                        border:`12px solid ${theme.border}`,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center'
                    }}
                >
                    <motion.div
                        animate={{
                            opacity: openDoor ? 1 : 0,
                            scale: openDoor ? 1 : .8
                        }}
                        transition={{
                            delay:.5,
                            duration:.5
                        }}
                        style={{
                            display:'flex',
                            flexDirection:'column',
                            alignItems:'center',
                            gap:'8px'
                        }}
                    >
                        <Text color={theme.primary} fontWeight={700} fontSize='4xl'>
                            ⛉
                        </Text>

                        <Text color={theme.primary} fontSize='xl' fontWeight={600}>
                            Aegis
                        </Text>
                    </motion.div>
                </div>

                {/* Door */}
                <motion.div
                    animate={{
                        rotateY: openDoor ? [-2, -8, -110] : 0
                    }}
                    transition={{
                        duration:1.3,
                        ease:[0.22,1,0.36,1]
                    }}
                    style={{
                        position:'absolute',
                        inset:0,
                        transformOrigin:'left center',
                        transformStyle:'preserve-3d',
                        borderRadius:'38px',
                        background:theme.border,
                        border:`12px solid ${theme.cardBg}`,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        boxShadow:`0 0 40px rgba(0,0,0,.25)`
                    }}
                >
                    {/* Hinges */}
                    <div style={{
                        position:'absolute',
                        left:'-8px',
                        top:'40px',
                        width:'14px',
                        height:'46px',
                        background:theme.cardBg,
                        border:`2px solid ${theme.border}`,
                        borderRadius:'8px'
                    }}/>
                    <div style={{
                        position:'absolute',
                        left:'-8px',
                        bottom:'40px',
                        width:'14px',
                        height:'46px',
                        background:theme.cardBg,
                        border:`2px solid ${theme.border}`,
                        borderRadius:'8px'
                    }}/>
                    <motion.div
                        animate={{
                            rotate: rotateWheel ? 180 : 0
                        }}
                        transition={{
                            duration:1,
                            ease:"easeInOut"
                        }}
                    >
                        <TbWheel size='130px' color={theme.cardBg}/>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
