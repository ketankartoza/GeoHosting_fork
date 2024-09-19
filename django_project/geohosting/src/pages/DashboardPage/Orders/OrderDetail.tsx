import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchOrderById } from '../../../redux/reducers/ordersSlice';
import { Box, Spinner, Text, Link } from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { orderDetail, loading, error } = useSelector((state: RootState) => state.orders);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id && token) {
      dispatch(fetchOrderById({ id, token }));
    }
  }, [dispatch, id, token]);

  if (loading) {
    return (
      <Box
        position='absolute'
        display='flex'
        justifyContent='center'
        width='100%'
        height='100%'
        alignItems='center'
      >
        <Spinner size='xl' />
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
          <Text mb={2}><b>Payment method</b>: {orderDetail.payment_method}</Text>
          <Text mb={4}><b>Spec</b>: {orderDetail.package.feature_list.spec.join(', ')}</Text>
          {orderDetail.invoice_url && (
            <Box mt={4}>
              <Link href={orderDetail.invoice_url} isExternal>
                Invoice <FaPrint style={{ display: "inline-block" }} />
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
