import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Image,
  List,
  ListItem,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { Package, Product } from '../../redux/reducers/productsSlice';
import { formatPrice, packageName } from "../../utils/helpers";
import LoginForm from "../LoginForm/LoginForm";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export interface PackageProps {
  product: Product;
  pkg: Package;
}

const ProductPricing: React.FC<PackageProps> = ({ product, pkg }) => {
  const navigate = useNavigate();
  const available = product.available;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { token } = useSelector((state: RootState) => state.auth);

  const handleCheckout = () => {
    localStorage.setItem('selectedProduct', JSON.stringify({
      product,
      pkg
    }));
    if (token) {
      navigate('/checkout/configuration', { state: { product, pkg } });
    } else {
      onOpen()
    }
  };

  return (
    <Box
      key={pkg.id}
      height={475}
      backgroundColor={'gray.200'}
      borderRadius={15}
      display={'flex'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      flexDirection="column"
      width={'100%'}
      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
      position="relative"
    >
      {/* Coming Soon Banner */}
      {!available && (
        <Box
          position="absolute"
          top="-35px"
          right="-35px"
          zIndex={999}
        >
          <Image
            src='/static/images/Coming_Soon_Banner.png'
            alt='Coming Soon'
            width={185}
          />
        </Box>
      )}

      <Box
        backgroundColor={packageName(pkg) === 'Gold' ? 'customOrange.500' : 'blue.500'}
        textColor={'white'}
        width={'100%'}
        borderTopRadius={15}
        position="sticky"
        top="0"
        zIndex="1"
        pt={2}
        pb={2}
      >
        <Heading as="h4" fontSize={25} paddingTop={2} paddingBottom={2}
                 textAlign="center" fontWeight={500}>
          {product.name} {packageName(pkg)}
        </Heading>
      </Box>

      {/* Blurred content if not available */}
      <Box
        mt={10}
        mb={5}
        filter={!available ? 'blur(4px)' : 'none'}
        position="relative"
        width="100%"
        textAlign="center"
      >
        <Box flexDirection={'row'} display={'flex'} alignItems={'end'}
             justifyContent="center">
          <Text fontSize={{ base: '35', sm: '45', md: '32', xl: '45' }}
                fontWeight={'bold'} color={'gray.600'}>
            {!available ? pkg.currency : formatPrice(pkg.price, pkg.currency)}
          </Text>
        </Box>
      </Box>

      <Box
        mt={5}
        textAlign="center"
        width={{ base: "50%", md: '80%', xl: "50%" }}
        alignItems="center"
        filter={!available ? 'blur(4px)' : 'none'}
      >
        <Text fontWeight={'bold'} fontSize={18}>
          {packageName(pkg)} Features
        </Text>
        <List spacing={2} mt={3} pl={5}>
          {pkg.feature_list &&
            pkg.feature_list['spec'] &&
            Object.entries(pkg.feature_list['spec']).map(([key, value]: any) => (
              <ListItem key={key} display="flex" alignItems="center">
                <CheckIcon color="blue.500" mr={2}/> {value}
              </ListItem>
            ))}
        </List>
      </Box>

      <Box mt={10} width="100%" pl={7} pr={7}>
        <Tooltip label="Product is not available" isDisabled={available}>
          <Button
            size={'xl'}
            width="100%"
            backgroundColor={packageName(pkg) === 'Gold' ? 'customOrange.500' : 'blue.500'}
            color={'white'}
            fontWeight={'bold'}
            paddingTop={5}
            paddingBottom={5}
            onClick={handleCheckout}
            isDisabled={!available}
            _disabled={{
              backgroundColor: packageName(pkg) === 'Gold' ? 'customOrange.500' : 'blue.500',
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
            _hover={{
              filter: 'brightness(1.1)',
              cursor: available ? 'pointer' : 'not-allowed'
            }}
            transition="filter 0.3s ease"
          >
            {`Get ${product.name} ${packageName(pkg)}`}
          </Button>
        </Tooltip>
      </Box>
      <LoginForm
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={() => {
          navigate('/checkout/configuration', { state: { product, pkg } });
        }}
      />
    </Box>
  );
};

export default ProductPricing;
