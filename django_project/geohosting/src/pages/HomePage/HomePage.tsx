import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  ChakraProvider,
  Container,
  Flex,
  Heading,
  Image,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import Navbar from '../../components/Navbar/Navbar';
import ProductCard from "../../components/ProductCard/ProductCard";
import GeonodeIcon from '../../assets/images/GeoNode.svg';
import customTheme from "../../theme/theme";
import { AppDispatch, RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import {fetchProducts, Product, fetchProductDetail, Package} from "../../redux/reducers/productsSlice";
import { CheckIcon } from "@chakra-ui/icons";
import ProductPricing from "../../components/ProductPricing/ProductPricing";
import ProductOverview from "../../components/ProductOverview/ProductOverview";
import Background from "../../components/Background/Background";

const HomePage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { products, loading, error, detailLoading, detailError, productDetail } = useSelector((state: RootState) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      dispatch(fetchProductDetail(selectedProduct.id));
    }
  }, [dispatch, selectedProduct]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <ChakraProvider theme={customTheme}>
      <Flex direction="column" minHeight="100vh">
        <Box flex="1">
          <Navbar />
          <Background />
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
                    comingSoon={!product.available}
                    onClick={() => handleProductClick(product)}
                    selected={selectedProduct ? (selectedProduct.id == product.id) : false}
                  />
                </WrapItem>
              ))}
            </Wrap>
          </Container>
          {selectedProduct && productDetail && (
            <Container maxW='container.xl' textAlign="center" mt="80px" mb="80px">
              <Box ref={detailsRef} bg="white" p="4" mt="10">
                <Tabs>
                  <TabList>
                    <Tab>
                      <Image
                        src={selectedProduct.image ? selectedProduct.image : GeonodeIcon}
                        alt={selectedProduct.name}
                        boxSize="30px"
                        mr="2"
                      />
                      Overview
                    </Tab>
                    <Tab>Pricing</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                        <ProductOverview {...productDetail.images} />
                    </TabPanel>
                    <TabPanel>
                      <Heading as="h3" size="lg">{selectedProduct.name} Pricing</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacingX='15px' spacingY={{ base: 10, md: 10, lg: 0 }} mt={10}>
                        <Box height={{ base: 150, md: 200, lg: 400 }} backgroundColor={'gray.200'} borderRadius={15} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                          <Image
                            src={selectedProduct.image ? selectedProduct.image : GeonodeIcon}
                            alt={selectedProduct.name}
                            boxSize="60%"
                          />
                        </Box>
                        {productDetail.packages.map((pkg: Package) => (
                          <ProductPricing key={pkg.id} product={selectedProduct} pkg={pkg}/>
                        ))}
                      </SimpleGrid>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Container>
          )}
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
