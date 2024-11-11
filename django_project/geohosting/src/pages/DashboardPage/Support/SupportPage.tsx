import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, Text, useColorModeValue, } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import {
  fetchTickets,
  setSelectedTicket
} from '../../../redux/reducers/supportSlice';
import { toast } from 'react-toastify';
import Pagination from '../../../components/Pagination/Pagination';
import DashboardTitle from "../../../components/DashboardPage/DashboardTitle";
import TopNavigation from "../../../components/DashboardPage/TopNavigation";
import {
  SupportTicketFormModal
} from "../../../components/SupportTicketForm/SupportTicketFormModal";

const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const SupportPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const supportTicketModalRef = useRef(null);
  const {
    tickets,
    loading,
    error
  } = useSelector((state: RootState) => state.support);
  const [currentTicket, setCurrentTicket] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  /**
   * Handling when create issue.
   */
  const handleCreateIssue = () => {
    setCurrentTicket(null);
    // @ts-ignore
    supportTicketModalRef?.current?.open()
  };

  /**
   * Handling when create issue.
   */
  const handleEditTicket = (ticketId: number) => {
    const selectedTicket = tickets.find(ticket => ticket.id === ticketId);
    if (selectedTicket) {
      setCurrentTicket(selectedTicket);
      dispatch(setSelectedTicket(selectedTicket));
      // @ts-ignore
      supportTicketModalRef?.current?.open()
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
      <Box position="relative" p={0}
           minHeight={{ base: 'auto', md: 'calc(100vh - 15rem)' }}
      >

        {/* Dashboard title */}
        <DashboardTitle title={'Support'}/>

        {/* Top navigation of dashboard */}
        <TopNavigation
          onSearch={setSearchTerm} placeholder='Search Ticket'
          rightElement={
            <Button colorScheme="blue" onClick={handleCreateIssue}>
              Create Issue
            </Button>
          }
        />
        {/* For ticket form */}
        <SupportTicketFormModal
          ticket={currentTicket}
          onClose={() => {
            setCurrentTicket(null);
          }}
          ref={supportTicketModalRef}
        />

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
                    <Text fontWeight="bold"
                          fontSize="lg">{ticket.subject}</Text>
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
                    Last
                    updated: {new Date(ticket.updated_at).toLocaleDateString()}
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
