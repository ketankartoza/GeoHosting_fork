import React from 'react';
import {Box, Text} from '@chakra-ui/react';


const Footer: React.FC = () => {
  return (
    <Box
      width="100%"
      backgroundColor="blue.500"
      py="4"
      textAlign="center"
    >
      <Text color="white">Powered by Kartoza</Text>
    </Box>
  )
};

export default Footer;
