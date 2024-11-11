import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../../../redux/reducers/ordersSlice';
import { AppDispatch, RootState } from '../../../redux/store';
import {
  Box,
  Flex,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import Pagination from '../../../components/Pagination/Pagination';
import { checkCheckoutUrl } from "../../CheckoutPage/utils";
import DashboardTitle from "../../../components/DashboardPage/DashboardTitle";
import TopNavigation from "../../../components/DashboardPage/TopNavigation";

const OrdersList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    orders,
    loading,
    error
  } = useSelector((state: RootState) => state.orders);
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

  const handleRowClick = (salesOrderDetail: any) => {
    if (salesOrderDetail && salesOrderDetail.id + '') {
      checkCheckoutUrl(salesOrderDetail, navigate)
    }
  };

  // Pagination calculations
  const indexOfLastOrder = currentPage * rowsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - rowsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  if (loading) {
    return (
      <Box display={'flex'} justifyContent={'center'} width={'100%'}
           height={'100%'} alignItems={'center'}>
        <Spinner size='xl'/>
      </Box>
    );
  }

  if (error) {
    return <Box color='red'>{error}</Box>;
  }

  return (
    <Box>
      <Box minHeight={{ base: 'auto', md: '80vh' }}>

        {/* Dashboard title */}
        <DashboardTitle title={'Orders'}/>

        {/* Top navigation of dashboard */}
        <TopNavigation
          onSearch={setSearchTerm} placeholder='Search by Order ID'
        />

        {/* Orders Table */}
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Order ID</Th>
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
                onClick={() => handleRowClick(order)}
                style={{ cursor: 'pointer' }}
                background={"white"}
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
