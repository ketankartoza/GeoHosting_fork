import React, { useState } from 'react';
import {
  Box,
  Link,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { PaginationPage } from "../PaginationPage";
import {
  fetchSalesOrders,
  SalesOrder
} from "../../../redux/reducers/ordersSlice";
import { checkCheckoutUrl } from "../../CheckoutPage/utils";
import { FaPrint } from "react-icons/fa";


interface CardProps {
  order: SalesOrder;
}

/** Card for order **/
const Card: React.FC<CardProps> = ({ order }) => {
  return <Tr
    key={order.id}
    background={"white"}
    _hover={{ bg: 'gray.100' }}
  >
    <Td>
      <Link
        href={`/#${checkCheckoutUrl(order)}`}
        target='_blank'
        as="a"
        color='blue.500'
      >
        {order.erpnext_code}
      </Link>
    </Td>
    <Td>
      {order.package.name}
    </Td>
    <Td>
      {order.app_name}
    </Td>
    <Td>
      {order.order_status}
    </Td>
    <Td>
      {order.company_name}
    </Td>
    <Td>
      {new Date(order.date).toLocaleDateString()}</Td>
    <Td>
      {
        order.invoice_url && <Box color='orange.500'>
          <a
            href={order.invoice_url} target='_blank'
            style={{ display: "flex", alignItems: "center" }}
          >
            <FaPrint style={{ display: "inline-block" }}/>
          </a>
        </Box>
      }
    </Td>
  </Tr>
}

const renderCards = (orders: SalesOrder[]) => {
  return <Table variant='simple'>
    <Thead>
      <Tr>
        <Th>ID</Th>
        <Th>Package</Th>
        <Th>App Name</Th>
        <Th>Status</Th>
        <Th>Company</Th>
        <Th>Date</Th>
        <Th>Invoice</Th>
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
  const [filters, setFilters] = useState({
    order_status: ''
  });

  return (
    <>
      <PaginationPage
        title='Orders'
        url='/api/orders/'
        action={fetchSalesOrders}
        stateKey='orders'
        searchPlaceholder='Search by id or app name'
        renderCards={renderCards}
        additionalFilters={filters}
        leftNavigation={
          <Select
            placeholder="Filter by status"
            backgroundColor='white'
            width={250}
            value={filters.order_status}
            onChange={
              (e) => setFilters(
                { ...filters, order_status: e.target.value }
              )
            }
          >
            <option value="Waiting Payment">Waiting Payment</option>
            <option value="Waiting Deployment">Waiting Deployment</option>
            <option value="Deployed">Deployed</option>
          </Select>
        }
      />
    </>
  );
};

export default OrderList;
