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
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";
import axios from "axios";

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
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

    useEffect(() => {
      setStripeOptions(null);
      if (isOpen) {
        (
          async () => {
            try {
              // Get the stripe key
              if (!stripePromise) {
                const setting = await axios.get(`/api/settings?key=STRIPE_PUBLISHABLE_KEY`, {
                  headers: { Authorization: `Token ${token}` }
                })
                setStripePromise(loadStripe(setting.data))
              }
              const response = await axios.post(`/api/package/${props.packageId}/checkout/stripe`, {}, {
                headers: { Authorization: `Token ${token}` }
              });
              setStripeOptions(
                { clientSecret: response.data.key }
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
            stripeOptions && stripePromise ?
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