import React from 'react';
import {Box, Flex, HStack, Image, Link, useDisclosure} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';
import LoginForm from '../LoginForm/LoginForm';

const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box position="fixed" top={0} width="100%" as="nav" padding="10px 20px" bg="gray.500" zIndex={1000} textColor={"white"}>
      <Flex justify="space-between" align="center">
        <HStack spacing="24px">
          <Image src='/static/images/kartoza-logo-only.png'
                 alt='Kartoza Logo'
                 width={8}
          />
          <Link href="#" fontSize="md">About us</Link>
        </HStack>
        <Link href="#" onClick={onOpen} fontSize="md" style={{ display: 'flex', alignItems: 'center' }}>
          <LockIcon boxSize={4} marginRight={1}/>
          My account
        </Link>
      </Flex>
      <LoginForm isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Navbar;
