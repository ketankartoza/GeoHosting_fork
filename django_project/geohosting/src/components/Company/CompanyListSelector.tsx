import React, { useEffect, useRef } from 'react';
import { Box, Button, Checkbox, } from '@chakra-ui/react';
import { useDispatch, useSelector } from "react-redux";
import { EditIcon } from "@chakra-ui/icons";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUserCompanies } from "../../redux/reducers/companySlice";
import CompanyForm from "./CompanyForm";

export interface OrderSummaryProps {
  companyName: string | null;
  setCompanyName: (companyName: string) => void;
}

/** Company controller */
const CompanyListSelector: React.FC<OrderSummaryProps> = (
  { companyName, setCompanyName }
) => {
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

  /** When first dispatch created */
  useEffect(() => {
    if (data?.results && data?.results[0]) {
      setCompanyName(data?.results[0].name)
    }
  }, [data]);

  if (loading) {
    return <Box paddingTop={4}>Loading</Box>
  }
  return (
    <Box paddingTop={4}>
      <Box mb={4} fontSize='13px'>Select company</Box>
      {
        !data?.results.length && <Box color='red' fontSize='13px'>
          Please create company
        </Box>
      }
      {
        data?.results.length ? <Box>
          {
            data?.results.map(
              company => <Box
                display='flex'
                justifyContent='space-between'
                key={company.id} p={4}
                fontSize='13px' background={'white'}
                cursor='pointer' whiteSpace='nowrap'

              >
                <Box>
                  <Checkbox
                    _checked={{
                      "& .chakra-checkbox__control": {
                        background: "#4F9AC0",
                        borderColor: "#4F9AC0",
                        color: "white"
                      },
                      "& .chakra-checkbox__control:hover": {
                        background: "#4F9AC0",
                        borderColor: "#4F9AC0",
                        color: "white"
                      }
                    }}
                    sx={{
                      "& .chakra-checkbox__label": {
                        fontSize: "13px !important",
                      },
                      "& .chakra-checkbox__control": {
                        background: "white",
                        borderColor: "#777777",
                      },
                    }}
                    isChecked={companyName === company.name}
                    onChange={() => setCompanyName(company.name)}
                  >
                    {company.name}
                  </Checkbox>
                </Box>
                <EditIcon
                  fontSize='13px'
                  onClick={
                    () => {
                      // @ts-ignore
                      modalRef?.current?.open(company.id)
                    }
                  }/>
              </Box>
            )
          }
        </Box> : null
      }
      <Button
        disabled={loading}
        colorScheme="blue"
        mt={4} fontSize='13px'
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

export default CompanyListSelector;
