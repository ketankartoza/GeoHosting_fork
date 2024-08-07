import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  ChakraProvider,
  Container,
  Flex,
  Heading,
  Text
} from '@chakra-ui/react';
import Navbar from '../../components/Navbar/Navbar';
import customTheme from "../../theme/theme";
import Background from "../../components/Background/Background";
import Footer from "../../components/Footer/Footer";
import {useDisclosure} from '@chakra-ui/react';
import PasswordResetConfirm from '../../components/ResetPassword/ResetPassword';

const ResetPasswordPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, [onOpen]);


  return (
    <ChakraProvider theme={customTheme}>
      <Flex direction="column" minHeight="100vh">
        <Box flex="1">
          <Navbar />
          <PasswordResetConfirm isOpen={isOpen} onClose={onClose} />
          <Background />
          <Container maxW='container.xl' textAlign="center" mt="80px" mb="80px" bg="transparent">
            <Heading as="h1" fontSize={{ base: '5xl', md: '6xl', xl: '7xl' }} fontWeight="thin" color="blue.500" mt="20px">
              GeoSpatialHosting
            </Heading>
            <Text fontSize="lg" marginTop="20px">
              YOUR ONLINE GEOSPATIAL WORKSPACE
            </Text>
            <Container maxW='container.lg'>
              <Text color="gray.700" fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }} marginTop="30px" fontWeight="bold" paddingLeft={50} paddingRight={50}>
                Professional GeoSpatial hosting for open-source GIS web applications.
              </Text>
            </Container>
           
          </Container>
        </Box>
        <Footer/>
      </Flex>
    </ChakraProvider>
  );
};

export default ResetPasswordPage;
