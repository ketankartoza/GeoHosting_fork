import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  keyframes,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaGear } from "react-icons/fa6";
import { SalesOrder } from "../../../redux/reducers/ordersSlice";
import OrderSummary from "../../CheckoutPage/OrderSummary";


const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg)
  }
`;
const spinAnimation = `${spin} infinite 2s linear`;

interface Props {
  salesOrderDetail: SalesOrder | null;
}

const CheckoutDeployment: React.FC<Props> = ({ salesOrderDetail }) => {
  const columns = useBreakpointValue({ base: 1, md: 2 });

  if (!salesOrderDetail) {
    return null
  }

  return (
    <>
      <Grid gap={6} templateColumns={`repeat(${columns}, 1fr)`}>
        <OrderSummary
          appName={salesOrderDetail.app_name}
          product={salesOrderDetail.product}
          pkg={salesOrderDetail.package}
          invoice_url={salesOrderDetail.invoice_url}
        />
        <GridItem>
          <Box>
            <Text fontSize={22} color={'white'}>Title</Text>
          </Box>
          <Box padding={8} backgroundColor="gray.100" borderRadius={10}>
            <Box>
              Sit tight, your service is being deployed. Please hold on
              as the deployment process is underway and we will
              notify you via email once it is complete.
              <br/>
              <br/>
              <Box animation={spinAnimation} width='fit-content'>
                <FaGear/>
              </Box>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};

export default CheckoutDeployment;
