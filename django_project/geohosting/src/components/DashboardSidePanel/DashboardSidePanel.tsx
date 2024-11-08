import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/reducers/authSlice";
import { Box, CloseButton, Flex, Heading, VStack } from "@chakra-ui/react";
import React from "react";

const SidebarItem = ({ label, isSelected, onClick }) => {
  return (
    <Box
      px={4}
      py={2}
      color="white"
      _hover={{ bg: 'gray.600', cursor: 'pointer' }}
      w="full"
      backgroundColor={isSelected ? 'gray.600' : 'blue.500'}
      onClick={onClick}
      bg={isSelected ? 'gray.600' : 'transparent'}
      borderRight={isSelected ? '8px solid #FFFFFF' : 'none'}
    >
      {label}
    </Box>
  );
};

const DashboardSidePanel = ({ selected, onClose, ...rest }) => {
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
      zIndex={99}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="3" justifyContent="space-between">
        <Heading
          fontSize="xl"
          fontFamily="monospace"
          fontWeight="bold"
          color="white"
          onClick={() => navigate('/')}
        >
          GeoSpatialHosting
        </Heading>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} color="white" />
      </Flex>
      <VStack spacing={4} align="start" mt={5}>
        <SidebarItem
          label="Hosted Services"
          isSelected={selected === 'dashboard'}
          onClick={() => navigate('/dashboard')}
        />
        <SidebarItem
          label="Agreements"
          isSelected={selected === 'agreements'}
          onClick={() => navigate('/dashboard/agreements')}
        />
        <SidebarItem
          label="Orders"
          isSelected={selected === 'orders'}
          onClick={() => navigate('/dashboard/orders')}
        />
        <SidebarItem
          label="Support"
          isSelected={selected === 'support'}
          onClick={() => navigate('/dashboard/support')}
        />
        <SidebarItem
          label="Profile"
          isSelected={selected === 'profile'}
          onClick={() => navigate('/dashboard/profile')}
        />
        <SidebarItem
          label="Logout"
          isSelected={false}
          onClick={handleLogout}
        />
      </VStack>
    </Box>
  );
};

export default DashboardSidePanel;
