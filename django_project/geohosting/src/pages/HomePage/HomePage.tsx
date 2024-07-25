import React, {useEffect} from 'react';
import {Box, ChakraProvider, Container, Flex, Heading, Spinner, Text, Wrap, WrapItem} from '@chakra-ui/react';
import Navbar from '../../components/Navbar/Navbar';
import ProductCard from "../../components/ProductCard/ProductCard";
import GeonodeIcon from '../../assets/images/GeoNode.svg';
import customTheme from "../../theme/theme";
import {AppDispatch, RootState} from "../../redux/store";
import {useDispatch, useSelector} from "react-redux";
import {fetchProducts} from "../../redux/reducers/productsSlice";
import SvgComponent from "../../components/Svg/SvgComponent";

const HomePage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { products, loading, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <ChakraProvider theme={customTheme}>
      <Flex direction="column" minHeight="100vh">
        <Box flex="1">
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
                {loading && <Spinner size='xl' />}
                {error && <Text color="red.500">{error}</Text>}
                {products.map((product) => (
                  <WrapItem key={product.id}>
                    <ProductCard
                      image={product.image ? product.image : GeonodeIcon}
                      title={product.name}
                      description={product.description}
                      comingSoon={product.available}
                    />
                  </WrapItem>
                ))}
              </Wrap>
            </Container>
          </Box>
          <Box
            width="100%"
            backgroundColor="blue.500"
            py="4"
            textAlign="center"
          >
            <Text color="white">Powered by Kartoza</Text>
          </Box>
        </Flex>
    </ChakraProvider>
  );
};

export default HomePage;
