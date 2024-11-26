import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure
} from "@chakra-ui/react";
import axios from "axios";
import { toast } from "react-toastify";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { headerWithToken } from "../../../utils/helpers";

import '../../../assets/styles/Markdown.css';

interface Agreement {
  id: number,
  name: string;
  template: string;
  signed?: boolean;
}

interface Props {
  isDone: (agreementsIds: number[]) => void;
}

export const AgreementModal = forwardRef(
  ({ isDone }: Props, ref
  ) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [agreements, setAgreements] = useState<Agreement[] | null>(null);

    useEffect(() => {
      if (isOpen) {
        setAgreements(null);
        (
          async () => {
            try {
              const response = await axios.get(
                '/api/agreements/',
                {
                  headers: headerWithToken()
                }
              );
              setAgreements(response.data.results)
            } catch (error) {
              toast.error("There is error on loading term and condition.");
              onClose()
            }
          }
        )()
      }
    }, [isOpen]);

    /**
     * Get unassigned agreement
     */
    let unassignAgreement: Agreement | null | undefined = null
    if (agreements) {
      unassignAgreement = agreements.find(agreement => !agreement.signed)
    }

    useEffect(() => {
      if (isOpen && agreements) {
        if (!unassignAgreement) {
          onClose()
          isDone(agreements.map(agreement => agreement.id))
        }
      }
    }, [agreements]);

    // Open
    useImperativeHandle(ref, () => ({
      open() {
        onOpen()
      }
    }));

    return <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
      <ModalOverlay/>
      <ModalContent maxWidth={{ md: '100%', xl: '80%', '2xl': '50%' }}>
        <ModalCloseButton/>
        <ModalHeader>{unassignAgreement?.name}</ModalHeader>
        <ModalBody padding='0' minHeight={300}>
          {
            !agreements ?
              <Box
                position={'absolute'} display={'flex'}
                justifyContent={'center'} width={'100%'} height={'100%'}
                alignItems={'center'}>
                <Spinner size='xl'/>
              </Box> : unassignAgreement ? <Box padding={8}>
                <Box className='Markdown'>
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {unassignAgreement.template}
                  </Markdown>
                </Box>
                <HStack justifyContent='space-between'>
                  <Button
                    mt={4}
                    colorScheme='red'
                    size="lg"
                    onClick={() => onClose()}
                  >
                    Decline
                  </Button>
                  <Button
                    mt={4}
                    colorScheme='blue'
                    size="lg"
                    onClick={() => {
                      setAgreements(agreements.map(agreement => {
                        if (agreement.id === unassignAgreement?.id) {
                          agreement.signed = true
                        }
                        return agreement
                      }))
                    }}
                  >
                    Accept
                  </Button>
                </HStack>
              </Box> : null
          }
        </ModalBody>
      </ModalContent>
    </Modal>
  }
)