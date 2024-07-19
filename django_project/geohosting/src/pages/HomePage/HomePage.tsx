import React from 'react';
import { ChakraProvider, Container, Heading, Text, Button, HStack, Image } from '@chakra-ui/react';
import Navbar from '../../components/Navbar/Navbar';

const HomePage: React.FC = () => {
  return (
    <ChakraProvider>
      <Navbar />
      <Container textAlign="center" padding="50px">
        <Image
          src="https://via.placeholder.com/150"
          alt="Logo"
          width={150}
          height={150}
          mx="auto"
        />
        <Heading as="h1" size="xl" marginTop="20px">This is Landing page</Heading>
        <Text fontSize="lg" marginTop="20px">
          This is a simple landing page using Chakra UI.
        </Text>
        <HStack spacing="20px" marginTop="20px" justify="center">
          <Button variant="outline">Learn More</Button>
          <Button colorScheme="cyan">Get Started</Button>
        </HStack>
      </Container>
    </ChakraProvider>
  );
};

export default HomePage;
