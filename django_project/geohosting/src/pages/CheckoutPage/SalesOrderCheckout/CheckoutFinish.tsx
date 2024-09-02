import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { SalesOrder } from "../../../redux/reducers/salesOrdersSlice";
import OrderSummary from "../../CheckoutPage/OrderSummary";


interface Props {
  salesOrderDetail: SalesOrder | null;
}

const CheckoutFinish: React.FC<Props> = ({ salesOrderDetail }) => {

  const columns = useBreakpointValue({ base: 1, md: 2 });
  if (!salesOrderDetail) {
    return null
  }

  return (
    <Grid gap={6} templateColumns={`repeat(${columns}, 1fr)`}>
      <OrderSummary
        product={salesOrderDetail.product}
        pkg={salesOrderDetail.package}
        invoice_url={salesOrderDetail.invoice_url}
      />
      <GridItem>
        <Box>
          <Text fontSize={22} color={'white'}>Title</Text>
        </Box>
        <Box padding={8} backgroundColor="gray.100" borderRadius={10}>
          Your service is ready! You can check it out here:
          [link or location].
        </Box>
      </GridItem>
    </Grid>
  );
};

export default CheckoutFinish;
