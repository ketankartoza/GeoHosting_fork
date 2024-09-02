import React, { useEffect } from 'react';
import {
  Box,
  ChakraProvider,
  Container,
  Flex,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import customTheme from "../../../theme/theme";
import Navbar from "../../../components/Navbar/Navbar";
import Background from "../../../components/Background/Background";
import CheckoutTracker
  from "../../../components/ProgressTracker/CheckoutTracker";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchSalesOrderDetail
} from "../../../redux/reducers/salesOrdersSlice";
import { checkCheckoutUrl } from "../utils";


interface Props {
  activeStep: number;
  children: JSX.Element;
}

const Index: React.FC<Props> = ({ activeStep, children }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { salesOrderDetail, detailError } = useSelector(
    (state: RootState) => state.salesOrders
  );

  useEffect(() => {
    if (detailError) {
      navigate('/');
    }
  }, [detailError]);

  useEffect(() => {
    if (id && salesOrderDetail?.id != id) {
      dispatch(fetchSalesOrderDetail(id));
    }
    // Check the url and redirect to correct page
    if (salesOrderDetail && salesOrderDetail.id + '' === id) {
      checkCheckoutUrl(salesOrderDetail, navigate)
    }
  }, [id, salesOrderDetail, dispatch]);


  if (!salesOrderDetail || salesOrderDetail?.id != id) {
    return (
      <Box
        position={'absolute'} display={'flex'}
        justifyContent={'center'} width={'100%'} height={'100%'}
        alignItems={'center'}>
        <Spinner size='xl'/>
      </Box>
    )
  }

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
            {
              salesOrderDetail ? React.Children.map(children, child => {
                return React.cloneElement(child, {
                  salesOrderDetail: salesOrderDetail
                })
              }) : null
            }
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

export default Index;
