import React from 'react';
import { SalesOrder } from "../../../redux/reducers/ordersSlice";
import { MainCheckoutPageComponent } from "../CheckoutPage";

interface Props {
  salesOrderDetail: SalesOrder | null;
}


const CheckoutPayment: React.FC<Props> = ({ salesOrderDetail }) => {
  if (!salesOrderDetail) {
    return null
  }
  return (
    <MainCheckoutPageComponent
      appName={salesOrderDetail.app_name}
      product={salesOrderDetail.product}
      pkg={salesOrderDetail.package}
      stripeUrl={`/api/orders/${salesOrderDetail.id}/payment/stripe`}
      paystackUrl={`/api/orders/${salesOrderDetail.id}/payment/paystack`}
    />
  )
};

export default CheckoutPayment;
