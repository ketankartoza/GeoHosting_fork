import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../../../redux/reducers/ordersSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import { Box, Spinner, Table, Thead, Tbody, Tr, Th, Td, Text, Flex } from '@chakra-ui/react';
import Pagination from '../../../components/Pagination/Pagination';
import SearchBar from '../../../components/SearchBar/SearchBar';

const OrdersList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const { token } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    if (token) {
      dispatch(fetchOrders(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    const filtered = orders.filter((order) =>
      order.id.toString().includes(searchTerm) ||
      order.package.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  const handleRowClick = (id: number) => {
    navigate(`/orders/${id}`);
  };

  // Pagination calculations
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

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

  return (
    <Box>
    <Box minHeight={{ base: 'auto', md: '80vh' }}> 
      <Box mb={4} >
        <Text fontSize="2xl" fontWeight="bold" mb={2} color={'#3e3e3e'}>Orders</Text>
        <Box height="2px" bg="blue.500" width="100%" mb={4} />
      </Box>

      {/* Search Bar */}
      <SearchBar
        onSearch={setSearchTerm}
        showDateFields={false}
        showClearButton={false}
        placeholder={'Search by Order ID'}
      />

      {/* Orders Table */}
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th>Erpnext_code</Th>
            <Th>Package</Th>
            <Th>Status</Th>
            <Th>Payment Method</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentOrders.map((order) => (
            <Tr
              key={order.id}
              onClick={() => handleRowClick(order.id)}
              style={{ cursor: 'pointer' }}
              _hover={{ bg: 'gray.100' }}
            >
              <Td>{order.erpnext_code}</Td>
              <Td>{order.package.name}</Td>
              <Td>{order.order_status}</Td>
              <Td>{order.payment_method}</Td>
              <Td>{new Date(order.date).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      
    </Box>
    {/* Pagination */}
    {filteredOrders.length > rowsPerPage && (
      <Flex justifyContent="center" mt={4}>
        <Pagination
          totalItems={filteredOrders.length}
          itemsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </Flex>
    )}
    </Box>
  );
};

export default OrdersList;
