import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  useDisclosure
} from "@chakra-ui/react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import axios from "axios";

// @ts-ignore
const stripePromise = loadStripe(stripePublishableKey);

interface EmbeddedCheckoutProviderProps {
  clientSecret?: string | null;
  fetchClientSecret?: (() => Promise<string>) | null;
  onComplete?: () => void;
}

interface StripePaymentModalProps {
  packageId: number;
}

export const StripePaymentModal = forwardRef(
  (props: StripePaymentModalProps, ref
  ) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [stripeOptions, setStripeOptions] = useState<EmbeddedCheckoutProviderProps | null>(null);

    useEffect(() => {
      setStripeOptions(null);
      if (isOpen) {
        (
          async () => {
            try {
              const response = await axios.post(`/api/package/${props.packageId}/checkout`, {}, {
                headers: { Authorization: `Token ${token}` }
              });
              setStripeOptions(
                { clientSecret: response.data }
              )
            } catch (error) {
              toast.error("There is error on checkout, please try it again.");
              onClose()
            }
          }
        )()


      }
    }, [isOpen]);

    // Open
    useImperativeHandle(ref, () => ({
      open() {
        onOpen()
      }
    }));

    return <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
      <ModalOverlay/>
      <ModalContent>
        <ModalCloseButton/>
        <ModalBody padding='0'>
          {
            stripeOptions ?
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={stripeOptions}
              >
                <EmbeddedCheckout/>
              </EmbeddedCheckoutProvider> :
              <Box
                position={'absolute'} display={'flex'}
                justifyContent={'center'} width={'100%'} height={'100%'}
                alignItems={'center'}>
                <Spinner size='xl'/>
              </Box>
          }
        </ModalBody>
      </ModalContent>
    </Modal>
  }
)