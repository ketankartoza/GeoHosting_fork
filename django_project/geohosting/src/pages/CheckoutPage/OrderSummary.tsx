import React from 'react';
import {
  Box,
  GridItem,
  Heading,
  Image,
  List,
  ListItem,
  Text
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { formatPrice, packageName } from "../../utils/helpers";
import { Package, Product } from "../../redux/reducers/productsSlice";
import { FaPrint } from "react-icons/fa6";

export interface OrderSummaryProps {
  product: Product;
  pkg: Package;
  invoice_url?: string | null;
  appName?: string;
  companyName?: string | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = (
  {
    product, pkg, invoice_url,
    appName, companyName
  }
) => {
  return (
    <GridItem>
      <Box>
        <Text fontSize={22} color={'black'}>
          Order Summary
          {
            appName &&
            <Text as='span' color='orange.500'>&nbsp;&nbsp;[{appName}]</Text>
          }
        </Text>
      </Box>
      <Box padding={8} backgroundColor="gray.100" borderRadius={10}>
        <Box border="1px" borderColor="gray.300" borderRadius="md"
             p="4">
          <Box display="flex" alignItems="center" pr={4} pb={4}>
            <Image
              src={product.image}
              alt={product.name}
              boxSize="50px"
            />
            <Text fontSize="2xl" fontWeight="bold" ml={2}>
              {product.name} {packageName(pkg)}
            </Text>
          </Box>
          <Text fontSize="xl" mb={4} fontWeight="bold">
            {formatPrice(pkg.price, pkg.currency)} / month
          </Text>
          <Heading as="h3" size="md" mb={2}>
            Features
          </Heading>
          <List spacing={2}>
            {
              pkg.feature_list &&
              pkg.feature_list['spec'] &&
              Object.entries(pkg.feature_list['spec']).map(([key, value]: any) => {
                if (!value) {
                  return
                }
                return <ListItem
                  key={key} display="flex" alignItems="center">
                  <CheckIcon color="green.500" mr={2}/> {value}
                </ListItem>
              })
            }
          </List>
          <Box mt={4}>
            {companyName !== undefined ? (!companyName ? 'Purchase in personal capacity' : `Purchase for ${companyName}`) : null}
          </Box>

          {
            invoice_url ?
              <Box marginTop={5} color='orange.500'>
                <a href={invoice_url} target='_blank'
                   style={{ display: "flex", alignItems: "center" }}>
                  <FaPrint style={{ display: "inline-block" }}/>&nbsp;&nbsp;
                  <b>Invoice</b>
                </a>
              </Box> : null
          }
        </Box>
      </Box>
    </GridItem>
  );
};
export default OrderSummary;