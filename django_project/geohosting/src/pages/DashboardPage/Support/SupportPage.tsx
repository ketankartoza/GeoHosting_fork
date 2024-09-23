import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchTickets, setSelectedTicket } from '../../../redux/reducers/supportSlice';
import SupportTicketForm from "../../../components/SupportTicketForm/SupportTicketForm";
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination';
import SearchBar from '../../../components/SearchBar/SearchBar';

const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const SupportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { tickets, loading, error } = useSelector((state: RootState) => state.support);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [editTicket, setEditTicket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const handleCreateIssue = () => {
    setShowSupportForm(true);
  };

  const handleEditTicket = (ticketId: number) => {
    const selectedTicket = tickets.find(ticket => ticket.id === ticketId);
    if (selectedTicket) {
      setEditTicket(selectedTicket);
      dispatch(setSelectedTicket(selectedTicket));
      setShowSupportForm(true);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(typeof error === 'string' ? error : error.detail || JSON.stringify(error));
    }
  }, [error]);

  // Filter and paginate tickets
  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);

  return (
    <Box>
    <Box position="relative" p={0} height={{ base: 'auto', md: '80vh' }}>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        Support
      </Text>
      <Box borderBottom="2px" borderColor="blue.500" mb={4} />

      <Flex mb={2} alignItems="center">
        <SearchBar
          onSearch={setSearchTerm}
          showDateFields={false}
          showClearButton={false}
          placeholder={'Search Ticket'}
        />
        
      </Flex>
      <Button colorScheme="blue" onClick={handleCreateIssue}>
          Create Issue
        </Button>

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
            {currentTickets.map((ticket) => (
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
                      bg={ticket.status === 'open' ? 'blue.500' : ticket.status === 'closed' ? 'red.500' : 'orange.500'}
                      borderRadius="full"
                    />
                    <Text
                      fontFamily="'Roboto', sans-serif"
                      fontWeight="300"
                      fontSize="16px"
                      color={ticket.status === 'open' ? 'blue.500' : ticket.status === 'closed' ? 'red.500' : 'orange.500'}
                    >
                      {ticket.status === 'open' ? 'Open' : ticket.status === 'closed' ? 'Closed' : 'Pending'}
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
    {/* Pagination Component */}
    <Pagination
        totalItems={filteredTickets.length}
        itemsPerPage={ticketsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

    </Box>
  );
};

export default SupportPage;
