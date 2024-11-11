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
import {
  ChangePasswordModal
} from '../../../components/Profile/ChangePasswordModal';
import { thunkAPIFulfilled, thunkAPIRejected } from "../../../utils/utils";
import { toast } from "react-toastify";
import { returnAsString } from "../../../utils/helpers";

const ProfilePage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const resetPasswordModalRef = useRef(null);
  const {
    user,
    loading,
    error
  } = useSelector((state: RootState) => state.profile);

  const [avataSrc, setAvatarSrc] = useState<string>('');

  // Updated info values
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [profile, setProfile] = useState({
    avatar: null,
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
      setAvatarSrc(profile.avatar)
      setPersonalInfo({
        first_name: returnAsString(user.first_name),
        last_name: returnAsString(user.last_name),
        email: returnAsString(user.email),
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
  }, [user]);

  /** Image changed */
  const imageChanged = (event) => {
    if (user) {
      const [file] = event.target.files
      const { profile } = user;
      if (file) {
        setAvatarSrc(URL.createObjectURL(file));
        setProfile({ avatar: file });
      } else {
        setAvatarSrc(profile.avatar);
        setProfile({ avatar: null });
      }
    }
  }

  // Handle profile update
  const handleProfileUpdate = () => {
    dispatch(
      updateUserProfile(
        {
          profileData: { ...personalInfo, billing_information: billingInfo },
          files: [{ name: 'avatar', file: profile.avatar }]
        }
      )
    ).then((result: any) => {
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
          <Avatar size="2xl" src={avataSrc}/>
          <Box pos='relative'>
            <Input
              id={'avatar-input'}
              pos='absolute'
              top={0}
              left={0}
              height='100%'
              width='100%'
              opacity={0}
              type="file" name="avatar" accept="image/png, image/jpeg, image/svg+xml"
              onChange={imageChanged}
            />
            <Button
              disabled={true}
              colorScheme="orange"
              onClick={() => {
                // @ts-ignore
                document.getElementById("avatar-input").click();
              }}
            >
              Update Avatar
            </Button>
          </Box>
        </VStack>

        <VStack
          spacing={4} alignItems="flex-start"
          width={{ base: '100%', lg: '60%' }}
        >
          <Text fontSize="lg" fontWeight="bold">User Information</Text>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
            colorScheme="blue"
            mt={6}
            onClick={() => {
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
          <ChangePasswordModal ref={resetPasswordModalRef}/>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ProfilePage;
