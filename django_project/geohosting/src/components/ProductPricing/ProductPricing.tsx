import React from "react";
import {Box, Button, Heading, List, ListItem, Text} from "@chakra-ui/react";
import {CheckIcon} from "@chakra-ui/icons";
import {Package} from "../../redux/reducers/productsSlice";


const ProductPricing: React.FC<Package> = (pkg) => {
  return (
    <Box key={pkg.id} height={400} backgroundColor={'gray.200'} borderRadius={15} display={'flex'} justifyContent={'flex-start'} alignItems={'center'} flexDirection='column' width={'100%'}>
      <Box backgroundColor={'blue.500'} textColor={'white'} width={'100%'} borderTopRadius={15} position="sticky" top="0" zIndex="1">
        <Heading as="h4" size="lg" paddingTop={2} paddingBottom={2} textAlign="center">
          {pkg.name}
        </Heading>
      </Box>
      <Box mt={4}>
        <Text fontSize={40} fontWeight={'bold'}>
          {pkg.price}
        </Text>
        <Text fontSize={20}>
          /month
        </Text>
      </Box>
      <Box mt={4}>
        <Button size={'xl'} backgroundColor={'blue.500'} color={'white'} fontWeight={'bold'} paddingTop={5} paddingBottom={5}>Get {pkg.name}</Button>
      </Box>
      <Box mt={5} textAlign="center" width="80%" alignItems='center'>
        <Text fontWeight={'bold'} fontSize={18}>
          Features
        </Text>
        <List spacing={2} mt={2}>
          {/* Assuming feature_list is an object of key-value pairs */}
          {pkg.feature_list && Object.entries(pkg.feature_list).map(([key, value]) => (
            <ListItem key={key} display="flex" alignItems="center">
              <CheckIcon color="green.500" mr={2} /> {value}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}

export default ProductPricing;