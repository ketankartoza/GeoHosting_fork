import React from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  Heading,
  IconButton,
  CloseButton,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/reducers/authSlice';
import customTheme from '../../theme/theme';
import {AppDispatch} from "../../redux/store";

const SidebarContent = ({ onClose, ...rest }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate('/');
    });
  };

  return (
    <Box
      bg="blue.500"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold" color="white">
          Dashboard
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} color="white" />
      </Flex>
      <VStack spacing={4} align="start" mt={5}>
        <Box px={4} py={2} color="white" _hover={{ bg: 'gray.700' }} w="full" onClick={() => navigate('/')}>
          Home
        </Box>
        <Box px={4} py={2} color="white" _hover={{ bg: 'gray.700' }} w="full">
          Invoices
        </Box>
        <Box px={4} py={2} color="white" _hover={{ bg: 'gray.700' }} w="full">
          Support
        </Box>
        <Box px={4} py={2} color="white" _hover={{ bg: 'gray.700' }} w="full" onClick={handleLogout}>
          Logout
        </Box>
      </VStack>
    </Box>
  );
};

const DashboardPage = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <ChakraProvider theme={customTheme}>
      <Box minH="100vh">
        <SidebarContent onClose={toggleSidebar} display={{ base: isOpen ? 'block' : 'none', md: 'block' }} />
        <Box ml={{ base: 0, md: 60 }} transition="0.3s ease">
          <Flex
            as="header"
            align="center"
            justify="space-between"
            w="full"
            px={4}
            bg="gray.200"
            borderBottomWidth="1px"
            borderColor="gray.300"
            h="14"
          >
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={toggleSidebar}
            />
            <Heading size="md" textAlign="center">Dashboard</Heading>
          </Flex>

          <Box p={4}>
            <Text>Welcome to the Dashboard!</Text>
            {/* Add your dashboard content here */}
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default DashboardPage;
