import React from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { SalesOrder } from "../../../redux/reducers/salesOrdersSlice";
import { MainCheckoutPageComponent } from "../CheckoutPage";

interface Props {
  salesOrderDetail: SalesOrder | null;
}


const CheckoutPayment: React.FC<Props> = ({ salesOrderDetail }) => {
  if (!salesOrderDetail) {
    return null
  }

  if (!salesOrderDetail) {
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
    <MainCheckoutPageComponent
      product={salesOrderDetail.product}
      pkg={salesOrderDetail.package}
      stripeUrl={`/api/orders/${salesOrderDetail.id}/payment/stripe`}
      paystackUrl={`/api/orders/${salesOrderDetail.id}/payment/paystack`}
    />
  )
};

export default CheckoutPayment;
