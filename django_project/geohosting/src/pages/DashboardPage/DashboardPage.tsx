import React from 'react';
import {
  Box,
  ChakraProvider,
  Flex,
  Heading,
  IconButton,
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import customTheme from '../../theme/theme';
import DashboardSidePanel
  from "../../components/DashboardSidePanel/DashboardSidePanel";
import { Route, Routes, useLocation } from "react-router-dom";
import OrdersList from './Orders/OrderList';
import OrderDetail from "./Orders/OrderDetail";
import ProfilePage from './Profile/ProfilePage';
import SupportList from "./Support/SupportList";
import ServiceList from "./Services/ServiceList";
import AgreementList from "./Agreements/AgreementList";

const DashboardPage = ({ title = "Dashboard" }) => {
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
        <Flex
          ml={{ base: 0, md: 60 }} transition="0.3s ease" minH='100vh'
          flexDirection={'column'}
        >
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
              icon={<HamburgerIcon/>}
              display={{ base: 'inline-flex', md: 'none' }}
              onClick={toggleSidebar}
            />
            <Heading size="md" textAlign="center"
                     color={'#ffffff'}>{title}</Heading>
          </Flex>

          {/* Main content area below the header */}
          <Box p={8} flexGrow={1} position='relative'>
            <Routes>
              <Route path="/" element={<ServiceList/>}/>
              <Route path='/agreements' element={<AgreementList/>}/>
              <Route path="/support" element={<SupportList/>}/>
              <Route path="/orders/:id" element={<OrderDetail/>}/>
              <Route path="/orders" element={<OrdersList/>}/>
              <Route path='/profile' element={<ProfilePage/>}/>
            </Routes>
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default DashboardPage;
