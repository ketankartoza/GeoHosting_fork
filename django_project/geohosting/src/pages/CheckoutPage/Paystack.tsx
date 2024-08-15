import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
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
import axios from "axios";
import { useSelector } from "react-redux";
import PaystackPop from '@paystack/inline-js';
import { RootState } from "../../redux/store";
import { toast } from "react-toastify";

interface StripePaymentModalProps {
  packageId: number;
}


const handleVerification = async (reference) => {
  try {
    const response = await fetch('/payments/verify_payment/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reference }),
    });

    const data = await response.json();
    if (data.status) {
      alert('Payment verified successfully!');
    } else {
      toast.error('Payment verification failed: ' + data.message);
    }
  } catch (error) {
    toast.error('Payment verification failed: ' + error);
  }
};
export const PaystackPaymentModal = forwardRef(
  (props: StripePaymentModalProps, ref
  ) => {
    const { token } = useSelector((state: RootState) => state.auth);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
      if (isOpen) {
        (
          async () => {
            try {
              const response = await axios.post(`/api/package/${props.packageId}/checkout/paystack`, {}, {
                headers: { Authorization: `Token ${token}` }
              });
              onClose()
              const paystackInstance = new PaystackPop();
              const transaction = paystackInstance.resumeTransaction(response.data.key);
              transaction.callbacks.onSuccess = (_) => {
                window.location.replace(response.data.success_url);
              }
            } catch (error) {
              console.log(error)
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

    return <Modal isOpen={isOpen} onClose={onClose} size={'sm'}>
      <ModalOverlay/>
      <ModalContent>
        <ModalCloseButton/>
        <ModalBody padding='0' minHeight={300}>
          <Box
            position={'absolute'} display={'flex'}
            justifyContent={'center'} width={'100%'} height={'100%'}
            alignItems={'center'}>
            <Spinner size='xl'/>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  }
)