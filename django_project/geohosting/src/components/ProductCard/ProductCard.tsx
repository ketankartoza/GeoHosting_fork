import React, { useState } from 'react';
import { Box, Heading, Text, Button, Badge } from '@chakra-ui/react';

interface CardProps {
  image?: string;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const ProductCard: React.FC<CardProps> = ({ image, title, description, comingSoon }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      textAlign="center"
      paddingTop={5}
      paddingBottom={5}
      position="relative"
      backgroundColor={"gray.200"}
      borderColor={"gray.200"}
      width={["500px", "350px", "320px", "320px"]}
    >
      {comingSoon && (
        <Badge
          colorScheme="blue"
          position="absolute"
          top="10px"
          right="10px"
        >
          Coming Soon
        </Badge>
      )}
      <Box justifyContent={'center'} display={'flex'}>
        <img src={image} width={115}/>
      </Box>
      <Heading as="h3" size="md" marginBottom="10px">
        {title}
      </Heading>
      <Text justifyContent={'center'} display={'flex'} fontSize="sm" marginBottom="20px"
            maxW={["500px", "350px", "320px", "320px"]} padding={5} height={75}>
        {description}
      </Text>
      <Button colorScheme="orange">Learn More</Button>
    </Box>
  );
};

export default ProductCard;
