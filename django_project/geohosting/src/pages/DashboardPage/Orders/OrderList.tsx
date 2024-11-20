import React from 'react';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { PaginationPage } from "../PaginationPage";
import {
  fetchSalesOrders,
  SalesOrder
} from "../../../redux/reducers/ordersSlice";
import { checkCheckoutUrl } from "../../CheckoutPage/utils";
import { useNavigate } from "react-router-dom";


interface CardProps {
  order: SalesOrder;
}

/** Card for order **/
const Card: React.FC<CardProps> = ({ order }) => {
  const navigate = useNavigate();
  const handleRowClick = (salesOrderDetail: any) => {
    if (salesOrderDetail && salesOrderDetail.id + '') {
      checkCheckoutUrl(salesOrderDetail, navigate)
    }
  };
  return <Tr
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
}

const renderCards = (orders: SalesOrder[]) => {
  return <Table variant='simple'>
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
      {orders.map((order) => (
        <Card key={order.id} order={order}/>
      ))}
    </Tbody>
  </Table>
}
/** Support List Page in pagination */
const OrderList: React.FC = () => {
  return (
    <>
      <PaginationPage
        title='Orders'
        url='/api/orders/'
        action={fetchSalesOrders}
        stateKey='orders'
        searchPlaceholder='Search by order id'
        renderCards={renderCards}
      />
    </>
  );
};

export default OrderList;
