import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../../../redux/reducers/ordersSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { Box, Spinner, Table, Thead, Tbody, Tr, Th, Td, Input, FormControl, FormLabel, Button } from '@chakra-ui/react';

const OrdersList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { token } = useSelector((state: RootState) => state.auth);

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    if (token) {
      dispatch(fetchOrders(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    // Filter orders based on search term
    const filtered = orders.filter((order) => 
      order.erpnext_code.toString().includes(searchTerm) || 
      order.package.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  if (loading) {
    return (
      <Box display={'flex'} justifyContent={'center'} width={'100%'} height={'100%'} alignItems={'center'}>
        <Spinner size='xl' />
      </Box>
    );
  }

  if (error) {
    return <Box color='red'>{error}</Box>;
  }

  const handleRowClick = (id: number) => {
    navigate(`/orders/${id}/finish`);
  };

  return (
    <Box p={4}>
      <FormControl mb={4}>
        <Input
          id='search'
          type='text'
          placeholder='Search by erpnext_code, Package, or Status'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </FormControl>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Date</Th>
            <Th>Package</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredOrders.map((order) => (
            <Tr 
              key={order.id}
              onClick={() => handleRowClick(order.id)}
              style={{ cursor: 'pointer' }}
              _hover={{ bg: 'gray.100' }}
            >
              <Td>{order.erpnext_code}</Td>
              <Td>{new Date(order.date).toLocaleDateString()}</Td>
              <Td>{order.package.name}</Td>
              <Td>{order.order_status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default OrdersList;
