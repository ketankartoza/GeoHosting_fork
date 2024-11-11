import React from 'react';
import { Box, Text } from "@chakra-ui/react";

interface Props {
  title: string;
}

const DashboardTitle: React.FC<Props> = ({ title }) => {
  return (
    <>
      <Box borderBottom="2px" borderColor="blue.500" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" mb={2} color={'#3e3e3e'}>
          {title}
        </Text>
      </Box>
    </>
  )
};

export default DashboardTitle;
