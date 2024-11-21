import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { BillingInformation } from "../../../redux/reducers/profileSlice";
import { returnAsString } from "../../../utils/helpers";
import BillingInformationForm from "../../../components/BillingInformation";
import { thunkAPIFulfilled, thunkAPIRejected } from "../../../utils/utils";
import { toast } from "react-toastify";
import {
  createUserCompany,
  fetchUserCompanies,
  fetchUserCompany,
  updateUserCompany
} from "../../../redux/reducers/companySlice";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

/** Company controller */

interface Props {

}

export const CompanyForm = forwardRef(
  (props: Props, ref
  ) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
      data,
      loading
    } = useSelector((state: RootState) => state.company['detail']);
    const {
      loading: createLoading
    } = useSelector((state: RootState) => state.company['create']);
    const [id, setId] = useState<number | null>(null);
    const [errors, setErrors] = useState<any>({});

    // Open
    useImperativeHandle(ref, () => ({
      open(id: number | null) {
        setDefault()
        setId(id)
        if (id) {
          dispatch(
            fetchUserCompany(id)
          )
        }
        onOpen()
      }
    }));

    // Updated info values
    const [info, setInfo] = useState({
      name: ''
    });
    const [billingInfo, setBillingInfo] = useState<BillingInformation>({
      name: '',
      address: '',
      postal_code: '',
      country: '',
      city: '',
      region: '',
      tax_number: '',
    });

    const setDefault = () => {
      setInfo({
        name: returnAsString('')
      });
      setBillingInfo({
        name: returnAsString(''),
        address: returnAsString(''),
        postal_code: returnAsString(''),
        country: returnAsString(''),
        city: returnAsString(''),
        region: returnAsString(''),
        tax_number: returnAsString('')
      });
    }

    useEffect(() => {
      if (data) {
        const { name, billing_information } = data;
        setInfo({
          name: returnAsString(name)
        });
        setBillingInfo({
          name: returnAsString(billing_information.name),
          address: returnAsString(billing_information.address),
          postal_code: returnAsString(billing_information.postal_code),
          country: returnAsString(billing_information.country),
          city: returnAsString(billing_information.city),
          region: returnAsString(billing_information.region),
          tax_number: returnAsString(billing_information.tax_number)
        });
      }
    }, [data]);

    // Handle create company
    const submit = () => {
      if (!id) {
        dispatch(
          createUserCompany(
            {
              companyData: { ...info, billing_information: billingInfo },
              files: []
            }
          )
        ).then((result: any) => {
          if (thunkAPIRejected(result)) {
            setErrors(result.payload)
            toast.error('Failed to create company.');
          } else if (thunkAPIFulfilled(result)) {
            dispatch(fetchUserCompanies('/api/companies?page_size=1000'));
            onClose()
            toast.success(
              'Your company has been successfully created.'
            );
          }
        });
      }
      if (id) {
        dispatch(
          updateUserCompany(
            {
              id,
              companyData: { ...info, billing_information: billingInfo },
              files: []
            }
          )
        ).then((result: any) => {
          if (thunkAPIRejected(result)) {
            setErrors(result.payload)
            toast.error('Failed to update the company.');
          } else if (thunkAPIFulfilled(result)) {
            dispatch(fetchUserCompanies('/api/companies?page_size=1000'));
            onClose()
            toast.success(
              'Your company has been successfully created.'
            );
          }
        });
      }
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        blockScrollOnMount={true}
        preserveScrollBarGap={true}>
        <ModalOverlay/>
        <ModalContent bg={'gray.200'}>
          <ModalCloseButton/>
          {
            loading ? <LoadingSpinner/> :
              <ModalBody m={4}>
                <Box width={{ base: '100%' }}>
                  <FormControl isInvalid={errors.name}>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      isInvalid={errors.name}
                      isDisabled={loading || createLoading}
                      value={info.name}
                      onChange={
                        (e) => setInfo(
                          { ...info, name: e.target.value })
                      }
                      borderWidth="0px"
                      borderColor="gray.400"
                      bg="white"
                      width={'100%'}
                    />
                    {
                      errors.subject &&
                      <FormErrorMessage>{errors.name}</FormErrorMessage>
                    }
                  </FormControl>
                  <Text fontSize="lg" fontWeight="bold" mt={8}>
                    Billing Information
                  </Text>
                  <Box display='flex' flexDirection='column' gap={6} mt={8}>
                    <BillingInformationForm
                      disable={loading || createLoading}
                      data={billingInfo} setData={setBillingInfo}
                    />
                  </Box>
                </Box>
                <Button
                  isDisabled={loading || createLoading}
                  w={'100%'}
                  mt={8}
                  colorScheme="blue"
                  alignSelf="flex-start"
                  onClick={submit}
                >
                  {!id ? "Create" : "Update"}
                </Button>
              </ModalBody>
          }
        </ModalContent>
      </Modal>

    );
  }
);

export default CompanyForm;
