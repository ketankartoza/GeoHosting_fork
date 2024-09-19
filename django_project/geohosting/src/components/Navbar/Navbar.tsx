import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Image,
  Link as ChakraLink,
  useDisclosure,
  VStack
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { HamburgerIcon, LockIcon } from '@chakra-ui/icons';
import LoginForm from '../LoginForm/LoginForm';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchProducts } from "../../redux/reducers/productsSlice";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { products } = useSelector(
    (state: RootState) => state.products
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { token } = useSelector((state: RootState) => state.auth);
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose
  } = useDisclosure();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <Box top={0}
         width="100%" as="nav"
         padding="10px 20px" bg="gray.500" zIndex={1000} textColor={"white"}>
      <Container maxW='container.xl' textAlign="center" bg="transparent">
        <Flex justify="space-between" align="center">
          <HStack spacing="24px">
            <Image
              src='/static/images/kartoza-logo-only.png'
              alt='Kartoza Logo'
              style={{ 'cursor': 'pointer' }}
              onClick={() => navigate('/')}
              width={8}
            />
            <ChakraLink as={RouterLink} to="https://kartoza.com/about"
                        fontSize="md">
              About us
            </ChakraLink>
          </HStack>

          <HStack spacing="24px" display={{ base: 'none', md: 'flex' }}
                  marginLeft="auto">
            {products.map((product) => (
              <ChakraLink
                key={product.name}
                as="button"
                onClick={() => token ? navigate('/app/' + product.name) : onOpen()}
                fontSize="md"
              >
                {product.name}
              </ChakraLink>
            ))}
            {
              token ?
                <ChakraLink
                  as="button"
                  onClick={() => navigate('/dashboard')}
                  fontSize="md"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <LockIcon boxSize={4} marginRight={1}/>
                  My account
                </ChakraLink> :
                <ChakraLink
                  as="button"
                  onClick={() => onOpen()}
                  fontSize="md"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <LockIcon boxSize={4} marginRight={1}/>
                  Sign in
                </ChakraLink>
            }
          </HStack>

          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon/>}
            display={{ base: 'flex', md: 'none' }}
            backgroundColor={'gray.500'}
            _hover={{ backgroundColor: 'gray.500' }}
            onClick={onDrawerOpen}
          />
        </Flex>

        <Drawer isOpen={isDrawerOpen} placement="right"
                onClose={onDrawerClose}>
          <DrawerOverlay/>
          <DrawerContent>
            <DrawerCloseButton/>
            <DrawerHeader>Menu</DrawerHeader>

            <DrawerBody>
              <VStack spacing="24px" align="start">
                {products.map((product) => (
                  <ChakraLink
                    key={product.name}
                    as="button"
                    onClick={() => {
                      token ? navigate('/app/' + product.name) : onOpen();
                      onDrawerClose();
                    }}
                    fontSize="md"
                  >
                    {product.name}
                  </ChakraLink>
                ))}
                <ChakraLink
                  as="button"
                  onClick={() => {
                    token ? navigate('/dashboard') : onOpen();
                    onDrawerClose();
                  }}
                  fontSize="md"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <LockIcon boxSize={4} marginRight={1}/>
                  My account
                </ChakraLink>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <LoginForm isOpen={isOpen} onClose={onClose}/>
      </Container>
    </Box>
  );
};

export default Navbar;
