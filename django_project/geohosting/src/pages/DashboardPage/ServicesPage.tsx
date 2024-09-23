import React, { useEffect, useState } from 'react';
import { Box, Spinner, Image, Text, Flex, Switch, IconButton, Button } from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchUserInstances } from '../../redux/reducers/instanceSlice';
import SearchBar from '../../components/SearchBar/SearchBar';
import Pagination from '../../components/Pagination/Pagination';

import Geoserver from '../../assets/images/GeoServer.svg';
import Geonode from '../../assets/images/GeoNode.svg';

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInstances, setFilteredInstances] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;
  const dispatch = useDispatch<AppDispatch>();

  const Placeholder = 'https://via.placeholder.com/60';

  const { instances, loading, error } = useSelector((state: RootState) => state.instance);
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
        instance.price.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      instance.id === id ? { ...instance, isActive: !instance.isActive } : instance
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

  return (
    <Box>
    <Box p={0} display="flex" flexDirection="column" height={{ base: 'auto', md: '80vh' }}>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        Hosted Services
      </Text>
      <Box borderBottom="2px" borderColor="blue.500" mb={4} />

      {/* Search bar */}
      <SearchBar
        onSearch={setSearchTerm}
        showDateFields={false}
        showClearButton={false}
        placeholder={'Search by service'}
      />

      {loading ? <Spinner /> : error ? <Text>Error loading instances</Text> : (
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
                <Flex justify="space-between" align="center" mb={4}>
                  <Image 
                    src={getImageForPackage(instance.price.name)} 
                    alt={`${instance.price.name} logo`} 
                    boxSize="80px" 
                    borderRadius="full" 
                  />
                  <Flex align="center">
                    <Switch
                      size="lg"
                      colorScheme={instance.isActive ? "blue" : "red"}
                      isChecked={instance.isActive}
                      onChange={() => toggleStatus(instance.id)}
                      mr={2}
                    />
                  </Flex>
                </Flex>

                {/* Package name and Edit Icon */}
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontWeight="bold" isTruncated>{instance.name}</Text>
                  <IconButton 
                    aria-label="Edit instance" 
                    icon={<EditIcon />} 
                    onClick={() => console.log(`Edit instance ${instance.id}`)}
                    color="blue.500" 
                    size="sm"
                  />
                </Flex>

                {/* Package details */}
                {instance.price.feature_list && (
                  <Flex direction="column">
                    <Text fontSize="sm">
                      Storage: {instance.price.feature_list.spec[0]?.split(' ')[0]}
                    </Text>
                    <Text fontSize="sm" textAlign="right">
                      Memory: {instance.price.feature_list.spec[2]?.split(' ')[1]}
                    </Text>
                    <Text fontSize="sm" mt={2}>
                      CPUs: {instance.price.feature_list.spec[1]?.split(' ')[2]}
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
