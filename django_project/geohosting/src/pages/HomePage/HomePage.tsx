import React from 'react';
import {Box, ChakraProvider, Container, Heading, Text, Wrap, WrapItem} from '@chakra-ui/react';
import Navbar from '../../components/Navbar/Navbar';
import ProductCard from "../../components/ProductCard/ProductCard";
import GeonodeIcon from '../../assets/images/GeoNode.svg';
import customTheme from "../../theme/theme";

const HomePage: React.FC = () => {
  return (
    <ChakraProvider theme={customTheme}>
      <Navbar />
      <Box
        position="absolute"
        left="0"
        top="0"
        width={{ base: '20vw', md: '14vw', xl: '10vw' }}
        height={{ base: '100vh', md: '100vh', xl: '100%' }}
        background="url('/static/images/right.svg')"
        backgroundSize="cover"
        backgroundRepeat="repeat-y"
        backgroundAttachment="scroll, local;"
        zIndex="-1"
      />
      <Box
        position="absolute"
        right="0"
        top="0"
        width={{ base: '20vw', md: '14vw', xl: '10vw' }}
        height={{ base: '100vh', md: '100vh', xl: '100%' }}
        background="url('/static/images/left.svg')"
        backgroundSize="cover"
        backgroundRepeat="repeat-y"
        backgroundAttachment="scroll, local;"
        zIndex="-1"
      />
      <Container maxW='container.xl' textAlign="center" mt="80px" mb="80px" bg="transparent">
        <Heading as="h1" fontSize={{ base: '5xl', md: '6xl', xl: '7xl' }} fontWeight="thin" color="blue.500" mt="20px">
          GeoSpatialHosting
        </Heading>
        <Text fontSize="lg" marginTop="20px">
          YOUR ONLINE GEOSPATIAL WORKSPACE
        </Text>
        <Text color="gray.700" fontSize={{ base: '2xl', md: '3xl', xl: '4xl' }} marginTop="30px" fontWeight="bold" paddingLeft={50} paddingRight={50}>
          Welcome to a better GIS platform where privacy and freedom come first.
        </Text>
        <Wrap spacing="30px" marginTop="50px" justify="center">
          <WrapItem>
            <ProductCard
              image={GeonodeIcon}
              title="GeoNode"
              description="GeoSpatial Content Management System"
            />
          </WrapItem>
          <WrapItem>
            <ProductCard
              image={GeonodeIcon}
              title="G3W"
              description="Publish your QGIS projects on the web."
              comingSoon
            />
          </WrapItem>
          <WrapItem>
            <ProductCard
              image={GeonodeIcon}
              title="BIMS"
              description="Biodiversity Information Management System."
              comingSoon
            />
          </WrapItem>
          <WrapItem>
            <ProductCard
              image={GeonodeIcon}
              title="G3W"
              description="Publish your QGIS projects on the web."
              comingSoon
            />
          </WrapItem>
          <WrapItem>
            <ProductCard
              image={GeonodeIcon}
              title="G3W"
              description="Publish your QGIS projects on the web."
              comingSoon
            />
          </WrapItem>
        </Wrap>
      </Container>
       <Box
        width="100%"
        backgroundColor="blue.500"
        py="4"
        textAlign="center"
      >
        <Text color="white">Powered by Kartoza</Text>
      </Box>
    </ChakraProvider>
  );
};

export default HomePage;
