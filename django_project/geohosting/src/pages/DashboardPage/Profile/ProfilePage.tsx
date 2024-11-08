import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import {
  fetchUserProfile,
  updateUserProfile
} from '../../../redux/reducers/profileSlice';
import { PasswordResetModal } from '../../../components/Profile/Password';
import { thunkAPIFulfilled, thunkAPIRejected } from "../../../utils/utils";
import { toast } from "react-toastify";

const ProfilePage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const resetPasswordModalRef = useRef(null);
  const { user, error } = useSelector((state: RootState) => state.profile);

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Updated info values
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    address: '',
    postal_code: '',
    country: '',
    city: '',
    region: '',
    tax_number: '',
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      if (!error.message) {
        toast.error('There was an issue with the update. Please try again.')
      } else {
        toast.error(error.message)
      }
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      const { profile, billing_information } = user;
      setPersonalInfo({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      });
      setBillingInfo({
        name: billing_information.name,
        address: billing_information.address,
        postal_code: billing_information.postal_code,
        country: billing_information.country,
        city: billing_information.city,
        region: billing_information.region,
        tax_number: billing_information.tax_number
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = () => {
    setSubmitting(true);
    dispatch(
      updateUserProfile({
        ...personalInfo,
        billing_information: billingInfo
      })
    ).then((result: any) => {
      setSubmitting(false)
      if (thunkAPIRejected(result)) {
        toast.error(
          result.payload
        );
      } else if (thunkAPIFulfilled(result)) {
        toast.success(
          'Your profile has been successfully updated.'
        );
      }
    });
  };

  return (
    <Box p={0} mx="auto">
      <Text fontSize="2xl" fontWeight="bold" mb={2} color={'#3e3e3e'}>
        Profile
      </Text>
      <Box height="2px" bg="blue.500" width="100%" mb={8}/>

      <Flex
        direction={{ base: 'column', md: 'row' }}
        align="flex-start"
        gap={4}
      >
        <VStack spacing={2} alignItems="center" padding="0 1rem">
          <Avatar size="2xl" src={user?.profile.avatar}/>
          <Button
            disabled={true}
            colorScheme="orange"
            style={{
              cursor: "not-allowed",
              background: 'var(--chakra-colors-customOrange-600)'
            }}
            // onClick={() => console.log("Update Avatar")}
          >
            Update Avatar
          </Button>
        </VStack>

        <VStack
          spacing={4} alignItems="flex-start"
          width={{ base: '100%', lg: '60%' }}
        >
          <Text fontSize="lg" fontWeight="bold">User Information</Text>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              disabled={submitting}
              value={personalInfo.first_name}
              onChange={
                (e) => setPersonalInfo(
                  { ...personalInfo, first_name: e.target.value })
              }
              borderWidth="0px"
              borderColor="gray.400"
              bg="white"
              width={'100%'}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Surname</FormLabel>
            <Input
              disabled={submitting}
              value={personalInfo.last_name}
              onChange={(e) => setPersonalInfo({
                ...personalInfo,
                last_name: e.target.value
              })}
              borderWidth="0px"
              borderColor="gray.400"
              bg="white"
              width={'100%'}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              disabled={submitting}
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo({
                ...personalInfo,
                email: e.target.value
              })}
              borderWidth="0px"
              borderColor="gray.400"
              bg="white"
              width={'100%'}
            />
          </FormControl>
          <Button
            disabled={submitting}
            colorScheme="blue"
            mt={6}
            onClick={() => {
              console.log('Open')
              // @ts-ignore
              resetPasswordModalRef?.current?.open()
            }}
          >
            Update Password
          </Button>

          {/* FOr more information */}
          <Box marginTop={5} width={{ base: '100%' }}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Billing Information
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel>Institution Name</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.name}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    name: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                  width={'100%'}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Billing Address</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.address}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    address: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                  width={'100%'}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Postal Code</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.postal_code}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    postal_code: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                  width={'100%'}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.country}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    country: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                  width={'100%'}
                />
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.city}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    city: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                  width={'100%'}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Region</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.region}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    region: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                />
              </FormControl>
              <FormControl>
                <FormLabel>VAT/Tax number</FormLabel>
                <Input
                  disabled={submitting}
                  value={billingInfo.tax_number}
                  onChange={(e) => setBillingInfo({
                    ...billingInfo,
                    tax_number: e.target.value
                  })}
                  borderWidth="0px"
                  borderColor="gray.400"
                  bg="white"
                  width={'100%'}
                />
              </FormControl>
            </SimpleGrid>
            <Button colorScheme="orange" onClick={handleProfileUpdate} mt={4}>
              Update Profile
            </Button>
          </Box>

          {/* Reset password modal */}
          <PasswordResetModal ref={resetPasswordModalRef}/>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ProfilePage;
