import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Tooltip } from '@chakra-ui/react';
import { theme } from '../../themes/theme';
import useLanguage from '../../hooks/useLanguage';


export default function Popup({isOpen, onClose, title, borderColor=theme.success, children, bg=theme.cardBg}) {
    const {DISPLAY} = useLanguage();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered autoFocus={false} returnFocusOnClose={false} trapFocus={false}>
            <ModalOverlay bg='rgba(0,0,0,0.6)'/>
            <ModalContent bg={bg} color={theme.text} border={`1px solid ${theme.border}`} borderTop={`10px solid ${borderColor}`} borderRadius={theme.radius} width={{base:'92%', sm:'85%', md:'70%', lg:'500px'}} maxWidth='500px'>
                <ModalHeader padding={theme.paddingL}>
                    {title}
                </ModalHeader>

                <Tooltip label={DISPLAY.TOOLTIPS.CLOSE} backgroundColor={theme.hoverBg} color={theme.textSecondary} hasArrow>
                    <ModalCloseButton/>
                </Tooltip>

                <ModalBody padding={theme.paddingL}>
                    {children}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
