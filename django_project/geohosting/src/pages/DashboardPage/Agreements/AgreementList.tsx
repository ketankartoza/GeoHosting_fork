import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react';
import { PaginationPage } from "../PaginationPage";
import {
  Agreement,
  fetchUserAgreements
} from "../../../redux/reducers/agreementSlice";
import { DownloadIcon } from "@chakra-ui/icons";
import axios from "axios";
import { headerWithToken } from "../../../utils/helpers";
import { toast } from "react-toastify";

interface CardProps {
  agreement: Agreement;
}

/** Card for support **/
const Card: React.FC<CardProps> = ({ agreement }) => {
  const [downloading, setDownloading] = useState(false);
  const downloadFile = async () => {
    setDownloading(true)
    try {
      const response = await axios.get(agreement.download_url,
        {
          responseType: "blob",
          headers: headerWithToken()
        }
      );
      const filename = agreement.name + '.pdf'
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setDownloading(false)
    } catch (error) {
      toast.error("Error downloading the file.");
      setDownloading(false)
    }
  }
  return <Tr
    key={agreement.id} height='40px' border={"none"}>
    <Td padding={0} backgroundColor='white' border={"none"}>
      <Box
        paddingLeft={4}
        style={{
          borderRadius: '4px 0 0 4px'
        }}
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
          borderRadius: '0 10px 10px 0'
        }}>
        {agreement.created_at.split('T')[0]}
      </Box>
    </Td>
    <Td textAlign="left" padding={0} paddingLeft={4}
        width='40px'
        border={"none"}>
      <Tooltip label="Download">
        <IconButton
          as="a"
          download
          aria-label={`Download ${agreement.name}`}
          icon={downloading ? <Spinner/> : <DownloadIcon/>}
          isDisabled={downloading}
          onClick={downloadFile}
          colorScheme="orange"
          bg="orange.300 !important"
          color="white"
          variant="solid"
          cursor={downloading ? 'progress! important' : 'pointer'}
          _hover={{ bg: 'orange.400' }}
        />
      </Tooltip>
    </Td>
  </Tr>
}

const renderCards = (agreements: Agreement[]) => {
  return <Box
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
        {
          agreements.map((agreement, index) => (
            <Card key={index} agreement={agreement}/>
          ))
        }
      </Tbody>
    </Table>
  </Box>
}

/** Agreement List Page in pagination */
const AgreementList: React.FC = () => {
  const [filters, setFilters] = useState({
    status: ''
  });
  return (
    <>
      <PaginationPage
        title='Agreements'
        url='/api/agreements/'
        action={fetchUserAgreements}
        stateKey='agreements'
        searchPlaceholder='Search by name'
        renderCards={renderCards}
        additionalFilters={filters}
      />
    </>
  );
};

export default AgreementList;
