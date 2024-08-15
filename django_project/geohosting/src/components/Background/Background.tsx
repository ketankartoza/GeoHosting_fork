import React from 'react';
import { Box } from '@chakra-ui/react';

const Background: React.FC = () => {
  return (
    <>
      <Box
        position="absolute"
        left="0"
        top="0"
        width={{ base: '20vw', md: '14vw', xl: '10vw' }}
        height='100%'
        background="url('/static/images/left-geohosting.svg')"
        backgroundSize="100% 1300px"
        backgroundRepeat="repeat-y"
        backgroundPosition="left top"
        zIndex="-1"
        float="left"
      />
      <Box
        position="absolute"
        right="0"
        width={{ base: '20vw', md: '14vw', xl: '10vw' }}
        height="100%"
        background="url('/static/images/right-geohosting.svg')"
        backgroundSize="100% 1400px"
        backgroundRepeat="repeat-y"
        backgroundPosition="right top -350px"
        zIndex="-1"
      />
    </>
  );
};

export default Background;
