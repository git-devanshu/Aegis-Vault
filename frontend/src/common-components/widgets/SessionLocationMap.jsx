import { WorldMap, Box } from 'grommet';
import { theme } from '../../themes/theme';
import { Text, Flex, useMediaQuery, Tooltip } from '@chakra-ui/react';
import useLanguage from '../../hooks/useLanguage';


export default function SessionLocationMap({sessions}) {
    const {DISPLAY, TOASTS} = useLanguage();

    return (
        <div style={{
            width:'100%',
            backgroundColor:theme.bg,
            border:`1px solid ${theme.border}`,
            borderRadius:`calc(${theme.radius} * 2)`,
            padding:theme.paddingL
        }}>
            <Flex align='center' justify='space-between'>
                <Text color={theme.text} fontSize={theme.textSize} marginBottom={theme.marginL}>
                    {DISPLAY.TEXT.SESSION_LOCATION}
                </Text>
            </Flex>
            <WorldMap
                color={theme.border}
                fill={theme.hoverBg}
                places={
                    sessions.map(session => ({
                        name: session.device,
                        location: session.coordinates,
                        color: theme.primary
                    }))
                }
                selectColor={theme.primary}
            />
        </div>
    );
}
