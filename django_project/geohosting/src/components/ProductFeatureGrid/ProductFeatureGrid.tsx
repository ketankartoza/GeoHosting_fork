import React from "react";
import { Box, SimpleGrid, Heading, Text, Icon, Flex } from "@chakra-ui/react";
import { FaLightbulb, FaSitemap, FaUser, FaCode } from "react-icons/fa";
import { Product } from "../../redux/reducers/productsSlice";

interface FeatureGridProps {
  product: Product;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ product }) => {
  return (
    <Box
      width="100%"
      maxWidth="auto"
      height="100%"
      maxHeight="auto"
      overflow="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding={10}
    >
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacingX={{ base: 4, md: 0 }}
        spacingY={{ base: 4, md: 10 }}
        width="100%"
        height="100%"
        justifyItems="center"
      >
        {[
          {
            title: "What does it do?",
            icon: FaLightbulb,
            description: `With ${product.name} you can aggregate, filter, and summarise your data. Establish sales catchment areas and connect sales performance to those areas. Establish demographic zones and connect health, insurance, or other outcomes to those zones.`,
          },
          {
            title: "How does it work?",
            icon: FaSitemap,
            description: `Start by creating a new project. Add indicators (e.g., sales numbers per district over time) to your project. Add context layers (e.g., roads, shop locations, etc.) to help your readers contextualize the data. Use our time slider to scroll through time. Deep dive into your data with widgets and filters.`,
          },
          {
            title: "Who is it for?",
            icon: FaUser,
            description: `${product.name} is for organizations and governments that need to track indicators at an administrative unit level (e.g., countries, states, districts, catchments, etc.)`,
          },
          {
            title: "Open Platform",
            icon: FaCode,
            description: `${product.name} is open source (AGPL) and has an open platform approach. Kartoza has built the platform under contract for our clients who kindly wanted to share the outcome of this work with the world.`,
          },
        ].map((feature, index) => (
          <Box
            key={index}
            width={{ base: "100%", md: "95%" }} 
            height={{ base: "auto", md: "300px" }}
            position="relative"
            textAlign={{ base: "center", md: "left" }}
          >
            <Box
              p={10}
              bg="white"
              boxShadow="md"
              borderRadius="lg"
              backgroundColor="gray.200"
              width="100%"
              height="100%"
            >
              <Flex
                direction={{ base: "column", md: "row" }}
                alignItems="center"
                textAlign={{ base: "center", md: "left" }}
                height="100%"
              >
                <Box mb={{ base: 4, md: 0 }} mr={{ md: 6 }}>
                  <Icon as={feature.icon} w={32} h={32} color="customOrange.500" />
                </Box>
                <Box>
                  <Heading size="lg" mb={4}>
                    {feature.title}
                  </Heading>
                  <Text fontSize="lg" lineHeight="8" color="gray.600">
                    {feature.description}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default FeatureGrid;
