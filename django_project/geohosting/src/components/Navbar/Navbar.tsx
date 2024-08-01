import React from 'react';
import {Box, Container, Flex, HStack, Image, Link as ChakraLink, useDisclosure} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { LockIcon } from '@chakra-ui/icons';
import LoginForm from '../LoginForm/LoginForm';
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { token, loading, error } = useSelector((state: RootState) => state.auth);

  return (
    <Box position="fixed" top={0} width="100%" as="nav" padding="10px 20px" bg="gray.500" zIndex={1000} textColor={"white"}>
      <Container maxW='container.xl' textAlign="center" bg="transparent">
        <Flex justify="space-between" align="center">
          <HStack spacing="24px">
            <Image src='/static/images/kartoza-logo-only.png'
                   alt='Kartoza Logo'
                   style={{'cursor': 'pointer'}}
                   onClick={() => navigate('/')}
                   width={8}
            />
            <ChakraLink as={RouterLink} to="/about" fontSize="md">About us</ChakraLink>
          </HStack>
          <ChakraLink
            as="button"
            onClick={() => token ? navigate('/dashboard') : onOpen()}
            fontSize="md"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <LockIcon boxSize={4} marginRight={1}/>
            My account
          </ChakraLink>
        </Flex>
        <LoginForm isOpen={isOpen} onClose={onClose} />
      </Container>
    </Box>
  );
};

export default Navbar;
