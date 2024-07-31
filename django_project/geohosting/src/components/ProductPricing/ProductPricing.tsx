import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import {Package, Product} from '../../redux/reducers/productsSlice';
import {formatPrice, packageName} from "../../utils/helpers";

interface PackageProps {
  product: Product;
  pkg: Package;
}

const ProductPricing: React.FC<PackageProps> = ({ product, pkg }) => {
  const navigate = useNavigate();

  const handleCheckout = () => {
    localStorage.setItem('selectedProduct', JSON.stringify({product, pkg}));
    navigate('/checkout', { state: { product, pkg } });
  };

  return (
    <Box
      key={pkg.id}
      height={400}
      backgroundColor={'gray.200'}
      borderRadius={15}
      display={'flex'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      flexDirection="column"
      width={'100%'}
    >
      <Box
        backgroundColor={packageName(pkg) === 'Gold' ? 'yellow.400' : 'blue.500'}
        textColor={'white'}
        width={'100%'}
        borderTopRadius={15}
        position="sticky"
        top="0"
        zIndex="1"
      >
        <Heading as="h4" fontSize={25} paddingTop={2} paddingBottom={2} textAlign="center">
          {product.name} {packageName(pkg)}
        </Heading>
      </Box>
      <Box mt={4}>
        <Box flexDirection={'row'} display={'flex'} alignItems={'end'}>
          <Text fontSize={35} fontWeight={'bold'}>
            {formatPrice(pkg.price, pkg.currency)}
          </Text>
        </Box>
        <Text fontSize={20}>/month</Text>
      </Box>
      <Box mt={4}>
        <Button
          size={'xl'}
          backgroundColor={packageName(pkg) === 'Gold' ? 'yellow.400' : 'blue.500'}
          color={'white'}
          fontWeight={'bold'}
          paddingTop={5}
          paddingBottom={5}
          onClick={handleCheckout}
        >
          {`Get ${product.name} ${packageName(pkg)}`}
        </Button>
      </Box>
      <Box mt={5} textAlign="center" width="80%" alignItems="center">
        <Text fontWeight={'bold'} fontSize={18}>
          Features
        </Text>
        <List spacing={2} mt={2}>
          {pkg.feature_list &&
            pkg.feature_list['spec'] &&
            Object.entries(pkg.feature_list['spec']).map(([key, value]: any) => (
              <ListItem key={key} display="flex" alignItems="center">
                <CheckIcon color="green.500" mr={2} /> {value}
              </ListItem>
            ))}
        </List>
      </Box>
    </Box>
  );
};

export default ProductPricing;
