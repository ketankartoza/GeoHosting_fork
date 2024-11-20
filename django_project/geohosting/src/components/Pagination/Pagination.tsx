import React from 'react';
import { Flex, Button, Box } from '@chakra-ui/react';
import { DisabledButton } from "../../Styles";

interface PaginationProps {
  totalItems: number; 
  itemsPerPage: number; 
  currentPage: number; 
  onPageChange: (page: number) => void; 
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle going to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Handle going to the previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  // Render pagination only if there's more than one page
  if (totalPages <= 1) return null;

  return (
    <Box width="100%">
      {/* Blue line */}
      <Box height="2px" bg="blue.500" width="100%" />

      {/* Pagination controls */}
      <Flex justify="space-between" align="center" mt="auto" py={6} width="100%">
        
        <Button
          onClick={handlePrevPage}
          isDisabled={currentPage === 1}
          colorScheme="orange"
          _disabled={DisabledButton}
        >
          Back
        </Button>

      
        <Flex justify="center" flex="1">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              onClick={() => onPageChange(index + 1)}
              bg={currentPage === index + 1 ? 'orange' : 'transparent'}
              color={currentPage === index + 1 ? 'white' : 'black'}
              border="1px solid"
              borderColor={currentPage === index + 1 ? 'orange' : 'gray'}
              _hover={{ bg: currentPage === index + 1 ? 'orange' : 'gray.100' }}
              mx={1}
            >
              {index + 1}
            </Button>
          ))}
        </Flex>

        
        <Button
          onClick={handleNextPage}
          isDisabled={currentPage === totalPages}
          colorScheme="orange"
          _disabled={DisabledButton}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default Pagination;
