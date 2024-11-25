import React from 'react';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { BillingInformation } from "../../redux/reducers/profileSlice";
import CountrySelector from "../CountrySelector";


interface Props {
  disable: boolean;
  data: BillingInformation;
  errors: any;
  setData: (data: BillingInformation) => void;
}

export const BillingInformationForm: React.FC<Props> = (
  { disable, data, setData, errors }
) => {
  return (
    <>
      <FormControl isInvalid={errors.name && !data.name}>
        <FormLabel>Billing name</FormLabel>
        <Input
          disabled={disable}
          value={data.name}
          onChange={(e) => setData({
            ...data,
            name: e.target.value
          })}
          borderWidth="0px"
          borderColor="gray.400"
          bg="white"
          width={'100%'}
        />
        {
          errors.name && !data.name &&
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        }
      </FormControl>
      <FormControl isInvalid={errors.address}>
        <FormLabel>Billing Address</FormLabel>
        <Input
          disabled={disable}
          value={data.address}
          onChange={(e) => setData({
            ...data,
            address: e.target.value
          })}
          borderWidth="0px"
          borderColor="gray.400"
          bg="white"
          width={'100%'}
        />
        {
          errors.address &&
          <FormErrorMessage>{errors.address}</FormErrorMessage>
        }
      </FormControl>
      <FormControl isInvalid={errors.postal_code}>
        <FormLabel>Postal Code</FormLabel>
        <Input
          disabled={disable}
          value={data.postal_code}
          onChange={(e) => setData({
            ...data,
            postal_code: e.target.value
          })}
          borderWidth="0px"
          borderColor="gray.400"
          bg="white"
          width={'100%'}
        />
        {
          errors.postal_code &&
          <FormErrorMessage>{errors.postal_code}</FormErrorMessage>
        }
      </FormControl>
      <FormControl isInvalid={errors.country}>
        <FormLabel>Country</FormLabel>
        <Box display='flex' alignItems='center' height='40px'>
          <CountrySelector
            disable={disable}
            data={data.country}
            setData={(value) => setData({
              ...data,
              country: value
            })}
          />
        </Box>
        {
          errors.country &&
          <FormErrorMessage>{errors.country}</FormErrorMessage>
        }
      </FormControl>
      <FormControl isInvalid={errors.city}>
        <FormLabel>City</FormLabel>
        <Input
          disabled={disable}
          value={data.city}
          onChange={(e) => setData({
            ...data,
            city: e.target.value
          })}
          borderWidth="0px"
          borderColor="gray.400"
          bg="white"
          width={'100%'}
        />
        {
          errors.city &&
          <FormErrorMessage>{errors.city}</FormErrorMessage>
        }
      </FormControl>
      <FormControl>
        <FormLabel>Region</FormLabel>
        <Input
          disabled={disable}
          value={data.region}
          onChange={(e) => setData({
            ...data,
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
          disabled={disable}
          value={data.tax_number}
          onChange={(e) => setData({
            ...data,
            tax_number: e.target.value
          })}
          borderWidth="0px"
          borderColor="gray.400"
          bg="white"
          width={'100%'}
        />
      </FormControl>
    </>
  );
};
export default BillingInformationForm;
