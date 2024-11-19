import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import SupportTicketForm from "./SupportTicketForm";

interface Props {
  onClose: () => void;
  ticket: any
}

export interface SupportTicketFormModalHandle {
  open: () => void;
}

export const SupportTicketFormModal = forwardRef(
  (props: Props, ref
  ) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Open
    useImperativeHandle(ref, () => ({
      open() {
        onOpen()
      }
    }));

    useEffect(() => {
      if (!isOpen) {
        props.onClose();
      }
    }, [isOpen]);

    return <Modal
      isOpen={isOpen}
      onClose={onClose}
      blockScrollOnMount={true}
      preserveScrollBarGap={true}>
      <ModalOverlay/>
      <ModalContent>
        <ModalCloseButton/>
        <ModalBody>
          <SupportTicketForm
            ticket={props.ticket}
            onClose={() => {
              onClose()
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  }
);
