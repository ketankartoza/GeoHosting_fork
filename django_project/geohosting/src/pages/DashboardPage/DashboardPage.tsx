import React from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import customTheme from '../../theme/theme';
import DashboardSidePanel from "../../components/DashboardSidePanel/DashboardSidePanel";
import { Route, Routes, useLocation } from "react-router-dom";
import DashboardMainPage from "./DashboardMainPage";
import SupportPage from "./Support/SupportPage";
import OrdersList from './Orders/OrderList';
import OrderDetail from "./Orders/OrderDetail";
import ProfilePage from './Profile/ProfilePage';
import AgreementsTab from '../../components/Profile/Agreements';

const DashboardPage = ({ title="Dashboard" }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const location = useLocation();

  return (
    <ChakraProvider theme={customTheme}>
      <Box minH="100vh" bg="gray.200">
        <DashboardSidePanel
          selected={location.pathname.split('/').pop()}
          onClose={toggleSidebar}
          display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
        />
        <Box ml={{ base: 0, md: 60 }} transition="0.3s ease" >
          <Flex
            as="header"
            align="center"
            justify="space-between"
            w="full"
            px={4}
            bg="#3e3e3e"
            borderBottomWidth="1px"
            borderColor="gray.200"
            h="14"
          >
            <IconButton
              aria-label="Open menu"
              icon={<HamburgerIcon />}
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={toggleSidebar}
            />
            <Heading size="md" textAlign="center" color={'#ffffff'}>{ title }</Heading>
          </Flex>

          {/* Main content area below the header */}
          <Box p={4} pt={8}>
            <Routes>
              <Route path="/" element={<DashboardMainPage />} />
              <Route path='/agreements' element={<AgreementsTab />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path='/profile' element={<ProfilePage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default DashboardPage;
