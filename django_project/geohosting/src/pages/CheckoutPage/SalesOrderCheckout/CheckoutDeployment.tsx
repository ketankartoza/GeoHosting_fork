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
          companyName={salesOrderDetail.company_name}
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
              You can close this browser window.
              <br/>
              Alternatively, you may view your application
              <Text
                as='a'
                ml={1}
                mr={1}
                href={`/#/dashboard?q=${salesOrderDetail.instance?.name}`}
                color='blue.500'
                target='_blank'>
                here
              </Text>
              or check your order
              <Text
                as='a'
                ml={1}
                href={`/#/dashboard/orders?q=${salesOrderDetail.erpnext_code}`}
                color='blue.500'
                target='_blank'>
                here
              </Text>.
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
