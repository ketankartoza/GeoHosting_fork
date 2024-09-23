import React, { useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, IconButton, Tooltip, Flex, Checkbox, Text } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import SearchBar from '../SearchBar/SearchBar';
import Pagination from '../Pagination/Pagination';

const agreements = [
  { name: 'User Agreement', file: '/path/to/user-agreement.pdf', dateIssued: '2023-01-01' },
  { name: 'Privacy Policy', file: '/path/to/privacy-policy.pdf', dateIssued: '2023-02-15' },
  { name: 'Terms of Service', file: '/path/to/terms-of-service.pdf', dateIssued: '2023-03-10' },
];

const AgreementsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>(Array(agreements.length).fill(false));
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const handleCheckboxChange = (index: number) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const isWithinDateRange = (dateIssued: string) => {
    const issuedDate = new Date(dateIssued);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && issuedDate < start) return false;
    if (end && issuedDate > end) return false;
    return true;
  };

  const filteredAgreements = agreements.filter(agreement =>
    agreement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    isWithinDateRange(agreement.dateIssued)
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentAgreements = filteredAgreements.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <Box>
    <Box width="100%" margin="0 auto" textAlign="left" minHeight={{ base: 'auto', md: '80vh' }}>
      <Text fontSize="2xl" fontWeight="bold" mb={2} color={'#3e3e3e'}>Agreements</Text>
      <Box height="2px" bg="blue.500" width="100%" mb={4} />

      <SearchBar
        onSearch={handleSearch}
        showDateFields={false}
        showClearButton={false}
        placeholder={'Search Agreements'}
      />

      {/* Responsive Table Container */}
      <Box
        width={['100%', '100%', '70%']}
        overflowX="auto"
        mb={4}
      >
        <Table variant="simple" borderWidth="0px" borderColor="gray.300" minWidth="600px">
          <Thead>
            <Tr>
              <Th width="5%" border="0px" borderColor="gray.300"></Th>
              <Th border="0px" borderColor="gray.300">Agreement</Th>
              <Th width="10%" border="0px" borderColor="gray.300">Date Issued</Th>
              <Th width="5%" textAlign="left" border="0px" borderColor="gray.300"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentAgreements.map((agreement, index) => (
              <Tr key={index}>
                <Td border="0px" borderColor="gray.300">
                  <Checkbox 
                    colorScheme="blue" 
                    isChecked={checkedItems[index]} 
                    onChange={() => handleCheckboxChange(index)} 
                    borderColor="gray.500" 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </Td>
                <Td border="0px" borderColor="gray.300">
                  <div
                    style={{
                      height: '40px',
                      backgroundColor: 'white',
                      padding: '5px',
                      display: 'flex',
                      alignItems: 'center', 
                      color: checkedItems[index] || hoverIndex === index ? 'blue.500' : 'gray', 
                      width: '110%',
                      borderRadius: '10px 0 0 10px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoverIndex(index)}  
                    onMouseLeave={() => setHoverIndex(null)}  
                  >
                    {agreement.name}
                  </div>
                </Td>
                <Td border="0px" borderColor="gray.300">
                  <div style={{
                    height: '40px',
                    backgroundColor: 'white',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'gray',
                    borderRadius: '0 10px 10px 0',
                  }}>
                    {agreement.dateIssued}
                  </div>
                </Td>
                <Td textAlign="left" border="0px" borderColor="gray.300">
                  <Flex justify="flex-start"> 
                    <Tooltip label="Download">
                      <IconButton
                        as="a"
                        href={agreement.file}
                        download
                        aria-label={`Download ${agreement.name}`}
                        icon={<DownloadIcon />}
                        colorScheme="orange"
                        bg="orange.300"
                        color="white"
                        variant="solid"
                        _hover={{ bg: 'orange.400' }}
                      />
                    </Tooltip>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      
    </Box>
    {filteredAgreements.length > rowsPerPage && (
      <Pagination
        totalItems={filteredAgreements.length}
        itemsPerPage={rowsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    )}
    </Box>
  );
};

export default AgreementsTab;
