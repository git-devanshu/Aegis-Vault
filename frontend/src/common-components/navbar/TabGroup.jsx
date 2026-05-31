import { Tabs, TabList, Tab, TabIndicator } from '@chakra-ui/react';
import { theme } from '../../themes/theme';

export default function TabGroup({tabs, value, onChange}) {
    return (
        <Tabs index={value} onChange={onChange} position='relative' variant='unstyled' width={{base:'100%', md:'fit-content'}}>
            <TabList borderBottom={`1px solid ${theme.border}`} overflowX='auto' overflowY='hidden'>
                {
                    tabs.map(tab => (
                        <Tab
                            key={tab}
                            color={theme.textSecondary}
                            _selected={{
                                color:theme.text
                            }}
                            fontWeight='500'
                            whiteSpace='nowrap'
                            flex={{base:'1', md:'unset'}}
                        >
                            {tab}
                        </Tab>
                    ))
                }
            </TabList>
            <TabIndicator mt='-1px' height='2px' bg={theme.primary} borderRadius='999px' />
        </Tabs>
    );
}
