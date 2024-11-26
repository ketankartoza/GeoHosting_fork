import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Link,
  Text,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';
import customTheme from "../../../theme/theme";
import Navbar from "../../../components/Navbar/Navbar";
import Background from "../../../components/Background/Background";
import { Package, Product } from "../../../redux/reducers/productsSlice";
import { FaCcStripe } from 'react-icons/fa6';
import { StripePaymentModal } from "./Stripe";
import { PaystackPaymentModal } from "./Paystack";
import CheckoutTracker
  from "../../../components/ProgressTracker/CheckoutTracker";
import { OrderSummary } from "../OrderSummary"
import { getUserLocation } from "../../../utils/helpers";
import { AgreementModal } from "./Agreement";

const PaymentMethods = {
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
}

interface CheckoutPageModalProps {
  product: Product;
  pkg: Package;
  stripeUrl: string;
  paystackUrl: string;
  appName: string;
  companyName?: string | null;
  activeStep?: number;
}

export const MainCheckoutPageComponent: React.FC<CheckoutPageModalProps> = (
  {
    product, pkg, stripeUrl, paystackUrl,
    appName, companyName
  }
) => {
  /** For the payment component **/
  const columns = useBreakpointValue({ base: 1, md: 2 });
  const [paymentMethods, setPaymentMethods] = useState<Array<string> | null>(null);
  const stripePaymentModalRef = useRef(null);
  const paystackPaymentModalRef = useRef(null);
  const agreementModalRef = useRef(null);
  const [currentMethod, setCurrentMethod] = useState<string | null>(null);
  const [agreementIds, setAgreementIds] = useState<number[]>([]);

  useEffect(() => {
    (
      async () => {
        const userLocation = await getUserLocation()
        if (userLocation === 'ZA') {
          setPaymentMethods([PaymentMethods.PAYSTACK])
        } else {
          setPaymentMethods([PaymentMethods.STRIPE])
        }
      }
    )();
  }, []);

  // Checkout function
  async function agreement(method: string) {
    setAgreementIds([])
    setCurrentMethod(method)
    // @ts-ignore
    agreementModalRef?.current.open()
  }

  function checkout() {
    switch (currentMethod) {
      case PaymentMethods.STRIPE: {
        if (stripePaymentModalRef?.current) {
          // @ts-ignore
          stripePaymentModalRef?.current?.open();
        }
        break
      }
      case PaymentMethods.PAYSTACK: {
        if (paystackPaymentModalRef?.current) {
          // @ts-ignore
          paystackPaymentModalRef?.current?.open();
        }
        break
      }
    }
  }

  console.log(agreementIds)

  return (
    <>
      <Grid gap={6} templateColumns={`repeat(${columns}, 1fr)`}>
        <OrderSummary
          product={product} pkg={pkg} appName={appName}
          companyName={companyName}
        />
        <GridItem>
          <Box>
            <Text fontSize={22} color={'black'}>
              Payment Method
            </Text>
          </Box>
          <Box padding={8} backgroundColor="gray.100" borderRadius={10}>
            <VStack spacing={4} align="stretch">
              <Box border="1px" borderColor="gray.300" borderRadius="md"
                   p="4">
                <Text mt={2}>
                  By purchasing this subscription and clicking
                  "Continue", you agree to the <Link href="#">terms of
                  service</Link>, <Link href="#">auto-renewal
                  terms</Link>, electronic document delivery, and
                  acknowledge the <Link href="#">privacy policy</Link>.
                </Text>
                <Box>
                  {
                    paymentMethods?.includes(PaymentMethods.STRIPE) ?
                      <Button
                        mt={4} leftIcon={<FaCcStripe/>} mr={1}
                        colorScheme='blue'
                        size="lg"
                        onClick={() => agreement(PaymentMethods.STRIPE)}
                      >
                        Pay with Stripe
                      </Button> : null
                  }
                  {
                    paymentMethods?.includes(PaymentMethods.PAYSTACK) ?
                      <Button
                        mt={4}
                        colorScheme='blue'
                        size="lg"
                        onClick={() => agreement(PaymentMethods.PAYSTACK)}
                      >
                        Pay with Paystack
                      </Button> : null
                  }
                  {
                    !paymentMethods ?
                      <Box paddingTop={5} fontStyle={"italic"} color={"gray"}>
                        Loading payment methods
                      </Box> : null
                  }
                </Box>
                <Divider mt={4}/>
                <Text mt={2} fontSize="sm">Payments are processed
                  in {pkg.currency}. Payment provider fees may
                  apply.</Text>
              </Box>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
      <StripePaymentModal
        ref={stripePaymentModalRef}
        url={stripeUrl}
        appName={appName}
        companyName={companyName}
        agreementIds={agreementIds}
      />
      <PaystackPaymentModal
        ref={paystackPaymentModalRef}
        url={paystackUrl}
        appName={appName}
        companyName={companyName}
        agreementIds={agreementIds}
      />
      <AgreementModal
        ref={agreementModalRef}
        isDone={(agreementIds) => {
          setAgreementIds(agreementIds)
          checkout()
        }}
      />
    </>
  )
}

const MainCheckoutPage: React.FC<CheckoutPageModalProps> = (
  {
    product, pkg, stripeUrl,
    paystackUrl, appName, companyName, activeStep = 0
  }
) => {
  return (
    <ChakraProvider theme={customTheme}>
      <Flex direction="column" minHeight="100vh">
        <Box flex="1">
          <Navbar/>
          <Background/>
          <Container maxW='container.xl' mt="80px" mb="80px" bg="transparent">
            <Box mb={10}>
              <CheckoutTracker activeStep={activeStep}/>
            </Box>
            <MainCheckoutPageComponent
              appName={appName}
              companyName={companyName}
              product={product}
              pkg={pkg}
              stripeUrl={stripeUrl}
              paystackUrl={paystackUrl}
            />
          </Container>
        </Box>
        <Box
          width="100%"
          backgroundColor="blue.500"
          py="4"
          textAlign="center"
        >
          <Text color="white">Powered by Kartoza</Text>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default MainCheckoutPage;
