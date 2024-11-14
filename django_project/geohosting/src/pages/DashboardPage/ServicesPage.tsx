import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Image,
  keyframes,
  Link,
  Spinner,
  Text
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchUserInstances } from '../../redux/reducers/instanceSlice';
import Pagination from '../../components/Pagination/Pagination';

import Geoserver from '../../assets/images/GeoServer.svg';
import Geonode from '../../assets/images/GeoNode.svg';
import DashboardTitle from "../../components/DashboardPage/DashboardTitle";
import TopNavigation from "../../components/DashboardPage/TopNavigation";
import { FaGear } from "react-icons/fa6";
import { FaLink } from "react-icons/fa";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg)
  }
`;
const spinAnimation = `${spin} infinite 2s linear`;

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstances, setFilteredInstances] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  const dispatch = useDispatch<AppDispatch>();

  const Placeholder = 'https://via.placeholder.com/60';

  const {
    instances,
    loading,
    error
  } = useSelector((state: RootState) => state.instance);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserInstances(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (instances) {
      // Filter instances based on search term
      const filtered = instances.filter((instance: any) =>
        instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstances(filtered);
    }
  }, [instances, searchTerm]);

  // Pagination logic
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredInstances.slice(indexOfFirstCard, indexOfLastCard);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleStatus = (id: number) => {
    const updatedInstances = filteredInstances.map((instance: any) =>
      instance.id === id ? {
        ...instance,
        isActive: !instance.isActive
      } : instance
    );
    setFilteredInstances(updatedInstances);
  };

  // Function to determine the correct image based on package name
  const getImageForPackage = (packageName: string) => {
    if (packageName.toLowerCase().includes('geoserver')) {
      return Geoserver;
    } else if (packageName.toLowerCase().includes('geonode')) {
      return Geonode;
    } else {
      return Placeholder;
    }
  };

  // Render instance status
  const RenderInstanceStatus = (props) => {
    const { instance } = props
    switch (instance.status) {
      case 'Offline':
        return <>
          <Box
            width='16px'
            height='16px'
            backgroundColor="var(--chakra-colors-red-300)"
            borderRadius='50'
            border='1px solid var(--chakra-colors-gray-600)'
          />
          <Text>Offline</Text>
        </>
      case 'Online':
        return <>
          <Box
            width='16px'
            height='16px'
            backgroundColor="var(--chakra-colors-green-300)"
            borderRadius='50'
            border='1px solid var(--chakra-colors-gray-600)'
          />
          <Text>Online</Text>
        </>
      case 'Deploying':
        return <>
          <Box
            animation={spinAnimation}
            width='fit-content'
            height='fit-content'
          >
            <FaGear/>
          </Box>
          <Text>Deploying</Text>
        </>
      default:
        return null
    }

  }

  return (
    <Box>
      <Box p={0} display="flex" flexDirection="column"
           minHeight={{ base: 'auto', md: '80vh' }}>

        {/* Dashboard title */}
        <DashboardTitle title={'Hosted Services'}/>

        {/* Top navigation of dashboard */}
        <TopNavigation
          onSearch={setSearchTerm} placeholder='Search by service'
        />

        {loading ? <Spinner/> : error ?
          <Text>Error loading instances</Text> : (
            <>
              {/* Cards */}
              <Flex wrap="wrap" justify="flex-start" gap={6}
                    direction={{ base: 'column', md: 'row' }}
              >
                {currentCards.map((instance: any) => (
                  <Box
                    key={instance.id}
                    borderWidth="1px"
                    borderRadius="lg"
                    p={6}
                    width={{ base: "100%", md: "320px" }}
                    bg="white"
                    boxShadow="lg"
                  >
                    {/* Logo and Switch */}
                    <Flex justify="space-between" mb={4}>
                      <Image
                        src={getImageForPackage(instance.product.name)}
                        alt={`${instance.product.name} logo`}
                        boxSize="80px"
                        borderRadius="full"
                      />
                      <Box paddingTop={2}>
                        {/* TODO: We enable this after the feature has been developed*/}
                        {/*<Switch*/}
                        {/*  size="lg"*/}
                        {/*  colorScheme={instance.isActive ? "blue" : "red"}*/}
                        {/*  isChecked={instance.isActive}*/}
                        {/*  onChange={() => toggleStatus(instance.id)}*/}
                        {/*  mr={2}*/}
                        {/*/>*/}
                        <Box>
                          <Flex align='center' gap={1}>
                            <RenderInstanceStatus instance={instance}/>
                          </Flex>
                        </Box>
                      </Box>
                    </Flex>

                    {/* Package name and Edit Icon */}
                    <Flex justify="space-between" align="center" mb={4}>
                      <Text fontWeight="bold" isTruncated>
                        {
                          instance.status === 'Online' && instance.url ?
                            <Link href={instance.url} target='_blank'>
                              <Flex
                                wrap="wrap" gap={1}
                                direction={{ base: 'column', md: 'row' }}
                                alignItems='center'
                                color='teal'
                              >
                                <FaLink/> {instance.name}
                              </Flex>
                            </Link> :
                            instance.name
                        }
                      </Text>
                      {/* TODO: We enable this after the feature has been developed*/}
                      {/*<IconButton*/}
                      {/*  aria-label="Edit instance"*/}
                      {/*  icon={<EditIcon/>}*/}
                      {/*  onClick={() => console.log(`Edit instance ${instance.id}`)}*/}
                      {/*  color="blue.500"*/}
                      {/*  size="sm"*/}
                      {/*/>*/}
                    </Flex>

                    {/* Package details */}
                    {instance.product.feature_list && (
                      <Flex direction="column">
                        <Text fontSize="sm">
                          Storage: {instance.product.feature_list.spec[0]?.split(' ')[0]}
                        </Text>
                        <Text fontSize="sm" textAlign="right">
                          Memory: {instance.product.feature_list.spec[2]?.split(' ')[1]}
                        </Text>
                        <Text fontSize="sm" mt={2}>
                          CPUs: {instance.product.feature_list.spec[1]?.split(' ')[2]}
                        </Text>
                      </Flex>
                    )}
                  </Box>
                ))}
              </Flex>


            </>
          )}
      </Box>
      {/* Pagination Component */}
      <Pagination
        totalItems={filteredInstances.length}
        itemsPerPage={cardsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </Box>

  );
};

export default ServicesPage;
