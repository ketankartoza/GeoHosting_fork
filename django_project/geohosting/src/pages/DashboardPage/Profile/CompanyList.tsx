import React, { useEffect, useRef } from 'react';
import { Box, Button, } from '@chakra-ui/react';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { fetchUserCompanies } from "../../../redux/reducers/companySlice";
import CompanyForm from "./CompanyForm";

/** Company controller */
const CompanyList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const modalRef = useRef(null);
  const {
    data,
    loading
  } = useSelector((state: RootState) => state.company['list']);

  const request = () => {
    dispatch(fetchUserCompanies('/api/companies/?page_size=1000'));
  }

  /** When first dispatch created */
  useEffect(() => {
    request()
  }, [dispatch]);

  if (loading) {
    return <Box>Loading</Box>
  }
  return (
    <Box>
      {
        !data?.results.length && <Box>No companies found</Box>
      }
      {
        data?.results.length ? <Box display='flex' gap={2} flexWrap='wrap'>
          {
            data?.results.map(
              company => <Box
                key={company.id} px={4} py={1} background={'white'}
                borderRadius={8} cursor='pointer'
                whiteSpace='nowrap'
                _hover={{ opacity: 0.8 }}
                onClick={
                  () => {
                    // @ts-ignore
                    modalRef?.current?.open(company.id)
                  }
                }
              >
                {company.name}
              </Box>
            )
          }
        </Box> : null
      }
      <Button
        disabled={loading}
        colorScheme="blue"
        mt={6}
        onClick={() => {
          // @ts-ignore
          modalRef?.current?.open()
        }}
      >
        Create company
      </Button>
      <CompanyForm ref={modalRef}/>
    </Box>
  );
};

export default CompanyList;
