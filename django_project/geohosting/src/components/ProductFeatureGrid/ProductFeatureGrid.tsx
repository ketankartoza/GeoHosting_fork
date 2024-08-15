import React from "react";
import { Box, SimpleGrid, Heading, Text, Icon, Flex } from "@chakra-ui/react";
import { FaLightbulb, FaSitemap, FaUser, FaCode } from "react-icons/fa";
import {Product} from "../../redux/reducers/productsSlice";


interface FeatureGridProps {
  product: Product;
}


const FeatureGrid: React.FC<FeatureGridProps> = ({ product }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={10} spacingY={{ base: "50px", md: '10', lg: '10'}} padding={10}>
      <Box position="relative" textAlign="center">
        <Box
          position="absolute"
          top="-40px"
          left="50%"
          transform="translateX(-50%)"
          bg="customOrange.500"
          borderRadius="full"
          width="80px"
          height="80px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="lg"
        >
          <Icon as={FaLightbulb} w={10} h={10} color="white" />
        </Box>
        <Box
          p={6}
          bg="white"
          boxShadow="md"
          borderRadius="lg"
          pt={16}
          minH={{ base: "270px", md: "250px", lg: '260px'}}
        >
          <Heading size="lg" mb={4}>
            What does it do?
          </Heading>
          <Text fontSize="md" color="gray.600">
            With {product.name} you can aggregate, filter, and summarise your data.
            Establish sales catchment areas and connect sales performance to
            those areas. Establish demographic zones and connect health,
            insurance, or other outcomes to those zones.
          </Text>
        </Box>
      </Box>

      <Box position="relative" textAlign="center">
        <Box
          position="absolute"
          top="-40px"
          left="50%"
          transform="translateX(-50%)"
          bg="customOrange.500"
          borderRadius="full"
          width="80px"
          height="80px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="lg"
        >
          <Icon as={FaSitemap} w={10} h={10} color="white" />
        </Box>
        <Box
          p={6}
          bg="white"
          boxShadow="md"
          borderRadius="lg"
          pt={16}
          minH={{ base: "270px", md: "250px", lg: '260px'}}
        >
          <Heading size="lg" mb={4}>
            How does it work?
          </Heading>
          <Text fontSize="md" color="gray.600">
            Start by creating a new project. Add indicators (e.g., sales numbers
            per district over time) to your project. Add context layers (e.g.,
            roads, shop locations, etc.) to help your readers contextualize the
            data. Use our time slider to scroll through time. Deep dive into
            your data with widgets and filters.
          </Text>
        </Box>
      </Box>

      <Box position="relative" textAlign={{ base: "center", md: "left" }}>
        <Box
          p={6}
          bg="white"
          boxShadow="md"
          borderRadius="lg"
          backgroundColor="gray.200"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            alignItems="center"
            textAlign={{ base: "center", md: "left" }}
            minH={'160px'}
          >
            <Box mb={{ base: 4, md: 0 }} mr={{ md: 6 }}>
              <Icon color="customOrange.500" as={FaUser} w={20} h={20} />
            </Box>
            <Box>
              <Heading size="lg" mb={4}>
                Who is it for?
              </Heading>
              <Text fontSize="md" color="gray.600">
                {product.name} is for organizations and governments that need to track
                indicators at an administrative unit level (e.g., countries, states,
                districts, catchments, etc.)
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>

      <Box position="relative" textAlign={{ base: "center", md: "left" }}>
        <Box
          p={6}
          bg="white"
          boxShadow="md"
          borderRadius="lg"
          backgroundColor="gray.200"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            alignItems="center"
            textAlign={{ base: "center", md: "left" }}
            minH={'160px'}
          >
            <Box mb={{ base: 4, md: 0 }} mr={{ md: 6 }}>
              <Icon color="customOrange.500" as={FaCode} w={20} h={20} />
            </Box>
            <Box>
              <Heading size="lg" mb={4}>
                Open Platform
              </Heading>
              <Text fontSize="md" color="gray.600">
                {product.name} is open source (AGPL) and has an open platform approach.
                Kartoza has built the platform under contract for our clients who
                kindly wanted to share the outcome of this work with the world.
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </SimpleGrid>
  );
};

export default FeatureGrid;
