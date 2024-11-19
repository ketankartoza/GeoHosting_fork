import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import {
  Box,
  ChakraProvider,
  Container,
  Flex,
  Heading,
  Img,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import customTheme from '../../theme/theme';
import { AppDispatch, RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { Product } from '../../redux/reducers/productsSlice';
import { useNavigate } from 'react-router-dom';

import Background from '../../components/Background/Background';
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Navbar = lazy(() => import('../../components/Navbar/Navbar'));
const ProductCard = lazy(() => import('../../components/ProductCard/ProductCard'));
const Footer = lazy(() => import('../../components/Footer/Footer'));

const HomePage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error, detailLoading, detailError, productDetail } = useSelector(
    (state: RootState) => state.products
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    navigate(`/app/${product.name}`);
  };

  return (
    <ChakraProvider theme={customTheme}>
      <Flex direction="column" minHeight="100vh">
        <Box flex="1">
          <Suspense fallback={<LoadingSpinner/>}>
            <Navbar />
          </Suspense>
          <Background />
          <Container maxW="container.xl" textAlign="center" mt="80px" mb="80px" bg="transparent">
            <Flex justify="center" align="center" flexDirection={{ base: 'column', md: 'row' }}>
              <Img
                src={'/static/images/logos/geohosting-full.svg'}
                width={{ base: '620px', md: '620px', xl: '700px' }}
                mb={{ base: 4, md: 0 }}
                mr={{ base: 0, md: 4 }}
              />
            </Flex>
            <Container maxW="container.lg">
              <Text
                color="gray.700"
                fontSize={{ base: 'lg', sm: 'xl', md: '2xl', xl: '3xl' }}
                marginTop="20px"
                fontWeight="bold"
                paddingLeft={50}
                paddingRight={50}
              >
                Professional GeoSpatial hosting for open-source GIS web applications.
              </Text>
            </Container>
            <Wrap spacing="30px" marginTop="50px" justify="center">
              <Suspense fallback={<LoadingSpinner />}>
                {loading && <LoadingSpinner />}
                {error && <Text color="red.500">{error}</Text>}
                {!loading &&
                  products.map((product) => (
                    <WrapItem key={product.id}>
                      <ProductCard
                        image={product.image}
                        title={product.name}
                        description={product.description}
                        comingSoon={!product.available}
                        onClick={() => handleProductClick(product)}
                        selected={selectedProduct ? selectedProduct.id === product.id : false}
                      />
                    </WrapItem>
                  ))}
              </Suspense>
            </Wrap>
          </Container>
        </Box>
        <Suspense fallback={<LoadingSpinner/>}>
          <Footer />
        </Suspense>
      </Flex>
    </ChakraProvider>
  );
};

export default HomePage;
