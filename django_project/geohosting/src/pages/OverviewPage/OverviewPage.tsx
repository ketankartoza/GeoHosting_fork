import React, {lazy, Suspense, useEffect} from "react";
import customTheme from "../../theme/theme";
import Navbar from "../../components/Navbar/Navbar";
import Background from "../../components/Background/Background";
import {
  Box,
  ChakraProvider,
  Container,
  Flex, Heading,
  Text, SimpleGrid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from "@chakra-ui/react";
import {useParams} from "react-router-dom";
import {fetchProductDetail, fetchProductDetailByName, Package, clearProductDetail} from "../../redux/reducers/productsSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store";
import Footer from "../../components/Footer/Footer";

import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const ProductOverview = lazy(() => import('../../components/ProductOverview/ProductOverview'));
const ProductPricing = lazy(() => import('../../components/ProductPricing/ProductPricing'));
const ProductFeatureGrid = lazy(() => import('../../components/ProductFeatureGrid/ProductFeatureGrid'));

const OverviewPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { appName } = useParams<{ appName: string }>();
  const { detailLoading, detailError, productDetail } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (appName) {
      window.scrollTo(0, 0)
      dispatch(clearProductDetail());
      dispatch(fetchProductDetailByName(appName));
    }
  }, [dispatch, appName]);

  return (
    <ChakraProvider theme={customTheme}>
      <Flex direction="column" minHeight="100vh">
        <Box flex="1">
          <Navbar />
          <Background />
          {detailLoading && (
            <Box position={'absolute'} display={'flex'} justifyContent={'center'} width={'100%'} height={'100%'} alignItems={'center'}>
              <LoadingSpinner/>
            </Box>
          )}
          <Container maxW='100%' mt="80px" mb="80px" bg="transparent" pl={0} pr={0}>
            {!detailLoading && productDetail && (
              <>
                <Container maxW='container.xl' textAlign="center" mt="80px" >
                    <Heading as="h1" size="xl" fontSize={{base: 40, sm: 50}} display={'flex'} justifyContent={'center'} alignItems={'center'} color={'gray.600'}>
                      <Box justifyContent={'center'} display={'flex'}>
                        <img src={productDetail.image} width={115}/>
                      </Box>
                      {productDetail.name}
                    </Heading>
                    <Container maxW='container.sm'>
                      <Heading as="h3" fontSize={{ base: '20px', md: '2xl', xl: '3xl' }} pt={3} pb={3} fontWeight={'light'}>{productDetail.description}</Heading>
                    </Container>
                    <Container maxW='container.xl' mt={5} mb={5}>
                      <Text color={'gray.700'} fontWeight="bold" fontSize={{ base: 'lg', sm: 'xl', md: '2xl', xl: '3xl' }} >
                        Tailor Your Experience: Find the Right Plan for You
                      </Text>
                    </Container>
                    <SimpleGrid columns={{ base: 1, md: 3, lg: 3 }}
                                spacingX={{ base: '40px', md: '10px', xl: '30px' }}
                                spacingY={{ base: 10, md: 10, lg: 0 }}
                                mt={5} mb={10}
                                pl={{ base: '5', sm: '20', md: '0', xl: '10' }}
                                pr={{ base: '5', sm: '20', md: '0', xl: '10' }}>
                    {productDetail.packages.map((pkg: Package) => (
                        <Suspense fallback={<LoadingSpinner/>}>
                          <ProductPricing key={pkg.id} product={productDetail} pkg={pkg}/>
                        </Suspense>
                      ))}
                    </SimpleGrid>

                    <Container maxW='container.xl' mt={5} mb={5}>
                      <Text color={'gray.700'} fontWeight="bold" fontSize={{ base: 'xl', md: '2xl', xl: '3xl' }}>
                        What {productDetail.name} Can Do for You
                      </Text>
                    </Container>
                </Container>
                <Suspense fallback={<LoadingSpinner/>}>
                  <ProductOverview {...productDetail.images} />
                </Suspense>
                <Container maxW='container.xl' mt={5} mb={10} textAlign={"center"}>
                  <Text color={'gray.700'} fontWeight="bold" fontSize={{ base: 'xl', md: '2xl', xl: '3xl' }}  mb={15}>
                    Why Choose {productDetail.name}?
                  </Text>
                  <Suspense fallback={<LoadingSpinner/>}>
                    <ProductFeatureGrid product={productDetail}/>
                  </Suspense>
                </Container>
              </>
            )}
          </Container>
        </Box>
        <Footer/>
      </Flex>
    </ChakraProvider>
  )
}


export default OverviewPage;
