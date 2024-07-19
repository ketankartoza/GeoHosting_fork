import React from 'react';
import { Box, Flex, HStack, Link, useDisclosure } from '@chakra-ui/react';
import { PhoneIcon, LockIcon } from '@chakra-ui/icons';
import LoginForm from '../LoginForm/LoginForm';

const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box as="nav" padding="10px 20px" borderBottom="1px solid #ddd">
      <Flex justify="space-between" align="center">
        <HStack spacing="24px">
          <PhoneIcon boxSize={6} />
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
