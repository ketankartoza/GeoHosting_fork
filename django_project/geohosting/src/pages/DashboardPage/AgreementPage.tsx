import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import Pagination from "../../components/Pagination/Pagination";
import TopNavigation from "../../components/DashboardPage/TopNavigation";
import DashboardTitle from "../../components/DashboardPage/DashboardTitle";

const agreements = [
  {
    name: 'User Agreement',
    file: '/path/to/user-agreement.pdf',
    dateIssued: '2023-01-01'
  },
  {
    name: 'Privacy Policy',
    file: '/path/to/privacy-policy.pdf',
    dateIssued: '2023-02-15'
  },
  {
    name: 'Terms of Service',
    file: '/path/to/terms-of-service.pdf',
    dateIssued: '2023-03-10'
  },
];

const AgreementPage: React.FC = () => {
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
      <Box width="100%" margin="0 auto" textAlign="left">

        {/* Dashboard title */}
        <DashboardTitle title={'Agreements'}/>

        {/* Top navigation of dashboard */}
        <TopNavigation onSearch={handleSearch} placeholder='Search Title'/>

        {/* Responsive Table Container */}
        <Box
          overflowX="auto"
          mb={4}
        >
          <Table
            variant="simple"
            width={{ base: "100%", lg: "75%", xl: "60%" }}
            style={{ borderCollapse: "separate", borderSpacing: "0 1em" }}
          >
            <Thead>
              <Tr>
                {/*<Th width="0" p={0} border={"none"} padding={0}></Th>*/}
                <Th border={"none"} padding={0} paddingLeft={4}>
                  Title
                </Th>
                <Th whiteSpace={'nowrap'} padding={0} border={"none"}>
                  Date Issued
                </Th>
                <Th textAlign="left" border={"none"} padding={0}>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentAgreements.map((agreement, index) => (
                <Tr key={index} height='40px' border={"none"}>
                  {/* TODO: Disable checbox because not sure what to do with this */}
                  {/*<Td padding={0} paddingRight={5}*/}
                  {/*    border={"none"}>*/}
                  {/*  <Checkbox*/}
                  {/*    colorScheme="blue"*/}
                  {/*    isChecked={checkedItems[index]}*/}
                  {/*    onChange={() => handleCheckboxChange(index)}*/}
                  {/*    borderColor="gray.500"*/}
                  {/*    onClick={(e) => e.stopPropagation()}*/}
                  {/*  />*/}
                  {/*</Td>*/}
                  <Td padding={0} backgroundColor='white' border={"none"}>
                    <Box
                      paddingLeft={4}
                      style={{
                        borderRadius: '4px 0 0 4px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      {agreement.name}
                    </Box>
                  </Td>
                  <Td
                    padding={0} backgroundColor='white' width='100px'
                    borderRadius='0 4px 4px 0' paddingRight={4}
                    border={"none"}
                  >
                    <Box
                      whiteSpace={'nowrap'}
                      style={{
                        borderRadius: '0 10px 10px 0',
                        cursor: 'pointer',
                      }}>
                      {agreement.dateIssued}
                    </Box>
                  </Td>
                  <Td textAlign="left" padding={0} paddingLeft={4}
                      width='40px'
                      border={"none"}>
                    <Tooltip label="Download">
                      <IconButton
                        as="a"
                        href={agreement.file}
                        download
                        aria-label={`Download ${agreement.name}`}
                        icon={<DownloadIcon/>}
                        colorScheme="orange"
                        bg="orange.300"
                        color="white"
                        variant="solid"
                        _hover={{ bg: 'orange.400' }}
                      />
                    </Tooltip>
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

export default AgreementPage;
