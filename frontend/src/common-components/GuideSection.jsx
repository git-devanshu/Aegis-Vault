import { Flex } from "@chakra-ui/react";
import React from "react";
import { motion } from 'framer-motion';

export default function GuideSection({id, children, justify='center', align='center'}) {
    return (
        <motion.div 
            initial={{opacity: 0, y: 100}}
            whileInView={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            viewport={{once: false, amount: 0.5}}
            id={id}
        >
            <Flex direction='column' justify={justify} align={align} height='100vh' scrollSnapAlign='start'>
                {children}
            </Flex>
        </motion.div>
    );
}
