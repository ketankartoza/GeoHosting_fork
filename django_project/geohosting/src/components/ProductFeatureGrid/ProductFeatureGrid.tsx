import React from "react";
import { Box, Flex, Heading, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { FaCode, FaLightbulb, FaSitemap, FaUser } from "react-icons/fa";
import { Product } from "../../redux/reducers/productsSlice";

interface FeatureGridProps {
  product: Product;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ product }) => {
  return (
    <Box
      overflow="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        spacingX={10}
        spacingY={10}
        width="100%"
        height="100%"
        justifyItems="center"
      >
        {[
          {
            title: "What does it do?",
            icon: FaLightbulb,
            description: product.product_meta.find(meta => meta.key === 'what_does_it_do')?.value,
          },
          {
            title: "How does it work?",
            icon: FaSitemap,
            description: product.product_meta.find(meta => meta.key === 'how_does_it_work')?.value,
          },
          {
            title: "Who is it for?",
            icon: FaUser,
            description: product.product_meta.find(meta => meta.key === 'who_is_it_for')?.value,
          },
          {
            title: "Open Platform",
            icon: FaCode,
            description: product.product_meta.find(meta => meta.key === 'open_platform')?.value,
          },
        ].map((feature, index) => (
          <Box
            key={index}
            width="100%"
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
                  <Icon as={feature.icon} w={32} h={32}
                        color="customOrange.500"/>
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
