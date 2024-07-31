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
            height={{ base: '100vh', md: '100vh', xl: '100%' }}
            background="url('/static/images/right.svg')"
            backgroundSize="cover"
            backgroundRepeat="repeat-y"
            backgroundAttachment="scroll, local;"
            zIndex="-1"
          />
          <Box
            position="absolute"
            right="0"
            top="0"
            width={{ base: '20vw', md: '14vw', xl: '10vw' }}
            height={{ base: '100vh', md: '100vh', xl: '100%' }}
            background="url('/static/images/left.svg')"
            backgroundSize="cover"
            backgroundRepeat="repeat-y"
            backgroundAttachment="scroll, local;"
            zIndex="-1"
          />
    </>
  );
};

export default Background;
