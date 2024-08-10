import React, { useState } from 'react';
import {
  Box,
  Flex,
  Button,
} from '@chakra-ui/react';
import SupportTicketForm from "../../../components/SupportTicketForm/SupportTicketForm";


const SupportPage: React.FC = () => {
  const [showSupportForm, setShowSupportForm] = useState(false);

  const handleCreateIssue = () => {
    setShowSupportForm(true);
  };

  return (
    <Box>
      {!showSupportForm && (
        <Button colorScheme="blue" onClick={handleCreateIssue}>
          Create Issue
        </Button>
      )}
      {showSupportForm && (
        <Flex justifyContent="center" mt={4}>
          <SupportTicketForm onClose={() => setShowSupportForm(false)} />
        </Flex>
      )}
    </Box>
  );
};

export default SupportPage;
