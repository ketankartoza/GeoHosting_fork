/*** ORDER DETAILS **/
import React, { useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { Box, Spinner } from "@chakra-ui/react";
import { FaPrint } from "react-icons/fa6";
import {
  fetchSalesOrderDetail
} from "../../../redux/reducers/salesOrdersSlice";

const OrderDetail: React.FC = () => {
  /** Order Detail Component */

  const dispatch: AppDispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const {
    salesOrderDetail,
    detailError
  } = useSelector((state: RootState) => state.salesOrders);

  useEffect(() => {
    if (id != null) {
      dispatch(fetchSalesOrderDetail(id));
    }
  }, [dispatch]);

  if (!salesOrderDetail && !detailError) {
    return (
      <Box
        position={'absolute'} display={'flex'}
        justifyContent={'center'} width={'100%'} height={'100%'}
        alignItems={'center'}>
        <Spinner size='xl'/>
      </Box>
    )
  }

  if (!salesOrderDetail && detailError) {
    return (
      <Box color='Red'>{detailError}</Box>
    )
  }

  if (!salesOrderDetail) {
    return (
      <Box></Box>
    )
  }

  return (
    <div>
      <Box>
        You ordered at : {salesOrderDetail.date}
        <Box><b>Package</b> : {salesOrderDetail.package.name}</Box>
        <Box><b>Status</b> : {salesOrderDetail.order_status}</Box>
        <Box><b>Payment method</b> : {salesOrderDetail.payment_method}
        </Box>
        <Box>
          <b>Spec</b> : {salesOrderDetail.package.feature_list['spec'].join(', ')}
        </Box>
        {
          salesOrderDetail.invoice_url ?
            <Box marginTop={5}>
              <a href={salesOrderDetail.invoice_url} target='_blank'>
                Invoice <FaPrint style={{ display: "inline-block" }}/>
              </a>
            </Box> : null
        }
      </Box>
    </div>
  )
}


export default OrderDetail;
