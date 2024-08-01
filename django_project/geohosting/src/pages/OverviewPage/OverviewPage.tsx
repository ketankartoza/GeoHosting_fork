import React, {useEffect} from "react";
import customTheme from "../../theme/theme";
import Navbar from "../../components/Navbar/Navbar";
import Background from "../../components/Background/Background";
import {
  Box,
  ChakraProvider,
  Container,
  Flex, Heading,
  Image, SimpleGrid,
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
import GeonodeIcon from "../../assets/images/GeoNode.svg";
import ProductOverview from "../../components/ProductOverview/ProductOverview";
import ProductPricing from "../../components/ProductPricing/ProductPricing";
import Footer from "../../components/Footer/Footer";


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
              <Spinner size='xl' />
            </Box>
          )}
          <Container maxW='container.xl' mt="80px" mb="80px" bg="transparent">
            {!detailLoading && productDetail && (
              <Container maxW='container.xl' textAlign="center" mt="80px" mb="80px">
                  <Heading as="h1" size="xl" fontSize={50} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Box justifyContent={'center'} display={'flex'}>
                      <img src={productDetail.image} width={115}/>
                    </Box>
                    {productDetail.name}
                  </Heading>
                  <Container maxW='container.sm'>
                    <Heading as="h3" fontSize={25} pt={3} pb={3} fontWeight={'light'}>{productDetail.description}</Heading>
                  </Container>
                  <SimpleGrid columns={{ base: 1, md: 3, lg: 3 }} spacingX='15px' spacingY={{ base: 10, md: 10, lg: 0 }} mt={5} mb={10}>
                  {productDetail.packages.map((pkg: Package) => (
                      <ProductPricing key={pkg.id} product={productDetail} pkg={pkg}/>
                    ))}
                  </SimpleGrid>
                  <ProductOverview {...productDetail.images} />
              </Container>
            )}
          </Container>
        </Box>
        <Footer/>
      </Flex>
    </ChakraProvider>
  )
}


export default OverviewPage;
