import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTickets, setSelectedTicket ,} from '../../../redux/reducers/supportSlice';
import { EditIcon } from '@chakra-ui/icons';
import SupportTicketForm from "../../../components/SupportTicketForm/SupportTicketForm";
import { toast } from 'react-toastify';

const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const SupportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { tickets, loading, error } = useSelector((state: RootState) => state.support);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [editTicket, setEditTicket] = useState<any>(null);
  

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleCreateIssue = () => {
    setShowSupportForm(true);
  };

  const handleEditTicket = (ticketId: number) => {
    const selectedTicket = tickets.find(ticket => ticket.id === ticketId);
    if (selectedTicket) {
      setEditTicket(selectedTicket)
      dispatch(setSelectedTicket(selectedTicket));
      setShowSupportForm(true);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.detail || JSON.stringify(error));
    }
  }, [error]);

  return (
    <Box position="relative">
      {(
        <Button colorScheme="blue" onClick={handleCreateIssue}>
          Create Issue
        </Button>
      )}
      
      {showSupportForm && (
        <Flex
          justifyContent="center"
          alignItems="center"
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.4)" 
          zIndex={1}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            position="relative"
            p={4}
            zIndex={2}
          >
            <SupportTicketForm 
              onClose={() => {
                setShowSupportForm(false);
                setEditTicket(null);
              }}  
              ticket={editTicket} 
            />
          </Flex>
        </Flex>
      )}

      <Box mt={4}>
        {loading && <Text>Loading...</Text>}
        {!loading && (
          <Box>
            {tickets.map((ticket) => (
              <Box
                key={ticket.id}
                p={4}
                mb={4}
                bg={useColorModeValue('white', 'gray.700')}
                borderRadius="md"
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                boxShadow="sm"
                position="relative"
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Text fontWeight="bold" fontSize="lg">{ticket.subject}</Text>
                  <Flex alignItems="center" ml="auto" gap={2}>
                    <Box
                      width="12px"
                      height="12px"
                      bg={ticket.status === 'open' ? 'blue.500' : ticket.status === 'closed'? 'red.500': 'orange.500'}
                      borderRadius="full"
                    />
                    <Text
                      fontFamily="'Roboto', sans-serif"
                      fontWeight="300"
                      fontSize="16px"
                      color={ticket.status === 'open' ? 'blue.500' : ticket.status === 'closed'? 'red.500': 'orange.500'}
                    >
                      {ticket.status === 'open' ? 'Open' : ticket.status === 'closed'? 'Closed': 'Pending'}
                    </Text>
                  </Flex>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Text>{stripHtmlTags(ticket.details)}</Text>
                  {/* HIDE EDIT */}
                  {/* <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit Ticket"
                    onClick={() => handleEditTicket(ticket.id)}
                    isDisabled={ticket.status !== 'open'}
                    variant="outline"
                    colorScheme={ticket.status === 'open' ? 'blue' : 'gray'}
                  /> */}
                </Box>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  mt={2}
                >
                  Last updated: {new Date(ticket.updated_at).toLocaleDateString()}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SupportPage;
