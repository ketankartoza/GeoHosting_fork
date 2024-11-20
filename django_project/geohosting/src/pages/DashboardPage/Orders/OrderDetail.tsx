import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchSalesOrderDetail } from '../../../redux/reducers/ordersSlice';
import { Box, Link, Spinner, Text } from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: orderDetail,
    loading,
    error
  } = useSelector((state: RootState) => state.orders.detail);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id && token) {
      dispatch(fetchSalesOrderDetail(id));
    }
  }, [dispatch, id, token]);

  if (loading) {
    return (
      <Box
        top={0}
        left={0}
        position='absolute'
        display='flex'
        justifyContent='center'
        width='100%'
        height='100%'
        alignItems='center'
      >
        <Spinner size='xl'/>
      </Box>
    );
  }

  if (error) {
    return <Box color='red'>{error}</Box>;
  }

  return (
    <Box p={4}>
      {orderDetail ? (
        <Box>
          <Text mb={2}>You ordered at: {orderDetail.date}</Text>
          <Text mb={2}><b>Package</b>: {orderDetail.package.name}</Text>
          <Text mb={2}><b>Status</b>: {orderDetail.order_status}</Text>
          <Text mb={2}><b>Payment method</b>: {orderDetail.payment_method}
          </Text>
          <Text
            mb={4}><b>Spec</b>: {orderDetail.package.feature_list['spec'].join(', ')}
          </Text>
          {orderDetail.invoice_url && (
            <Box mt={4}>
              <Link href={orderDetail.invoice_url} isExternal>
                <b>Invoice <FaPrint style={{ display: "inline-block" }}/></b>
              </Link>
            </Box>
          )}
        </Box>
      ) : (
        <Box>No order details found</Box>
      )}
    </Box>
  );
};

export default OrderDetail;
