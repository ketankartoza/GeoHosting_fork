import React from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
  keyframes,
  Link,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { PaginationPage } from "../PaginationPage";
import {
  fetchUserInstances,
  Instance
} from "../../../redux/reducers/instanceSlice";
import { FaLink } from "react-icons/fa";
import Geoserver from "../../../assets/images/GeoServer.svg";
import Geonode from "../../../assets/images/GeoNode.svg";
import { FaGear } from "react-icons/fa6";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg)
  }
`;
const spinAnimation = `${spin} infinite 2s linear`;

interface CardProps {
  instance: Instance;
}

/** Card for support **/
const Card: React.FC<CardProps> = ({ instance }) => {
  const columns = useBreakpointValue({ base: 1, md: 2 });
  const Placeholder = 'https://via.placeholder.com/60';
  // Function to determine the correct image based on package name
  const getImageForPackage = (packageName: string) => {
    if (packageName.toLowerCase().includes('geoserver')) {
      return Geoserver;
    } else if (packageName.toLowerCase().includes('geonode')) {
      return Geonode;
    } else {
      return Placeholder;
    }
  };

  // Render instance status
  const RenderInstanceStatus = (props) => {
    const { instance } = props
    switch (instance.status) {
      case 'Offline':
        return <>
          <Box
            width='16px'
            height='16px'
            backgroundColor="var(--chakra-colors-red-300)"
            borderRadius='50'
            border='1px solid var(--chakra-colors-gray-600)'
          />
          <Text>Offline</Text>
        </>
      case 'Online':
        return <>
          <Box
            width='16px'
            height='16px'
            backgroundColor="var(--chakra-colors-green-300)"
            borderRadius='50'
            border='1px solid var(--chakra-colors-gray-600)'
          />
          <Text>Online</Text>
        </>
      case 'Deploying':
        return <>
          <Box
            animation={spinAnimation}
            width='fit-content'
            height='fit-content'
          >
            <FaGear/>
          </Box>
          <Text>Deploying</Text>
        </>
      default:
        return null
    }
  }

  return <Box
    key={instance.id}
    borderWidth="1px"
    borderRadius="lg"
    p={6}
    width={{ base: "100%", md: "320px" }}
    bg="white"
    boxShadow="lg"
  >
    {/* Logo and Switch */}
    <Flex justify="space-between" mb={4}>
      <Image
        src={getImageForPackage(instance.product.name)}
        alt={`${instance.product.name} logo`}
        boxSize="80px"
        borderRadius="full"
      />
      <Box paddingTop={2}>
        {/* TODO: We enable this after the feature has been developed*/}
        {/*<Switch*/}
        {/*  size="lg"*/}
        {/*  colorScheme={instance.isActive ? "blue" : "red"}*/}
        {/*  isChecked={instance.isActive}*/}
        {/*  onChange={() => toggleStatus(instance.id)}*/}
        {/*  mr={2}*/}
        {/*/>*/}
        <Box>
          <Flex align='center' gap={1}>
            <RenderInstanceStatus instance={instance}/>
          </Flex>
        </Box>
      </Box>
    </Flex>

    {/* Package name and Edit Icon */}
    <Flex justify="space-between" align="center" mb={4}>
      <Text fontWeight="bold" isTruncated>
        {
          instance.status === 'Online' && instance.url ?
            <Link href={instance.url} target='_blank'>
              <Flex
                wrap="wrap" gap={1}
                direction={{ base: 'column', md: 'row' }}
                alignItems='center'
                color='teal'
              >
                <FaLink/> {instance.name}
              </Flex>
            </Link> :
            instance.name
        }
      </Text>
      {/* TODO: We enable this after the feature has been developed*/}
      {/*<IconButton*/}
      {/*  aria-label="Edit instance"*/}
      {/*  icon={<EditIcon/>}*/}
      {/*  onClick={() => console.log(`Edit instance ${instance.id}`)}*/}
      {/*  color="blue.500"*/}
      {/*  size="sm"*/}
      {/*/>*/}
    </Flex>

    {/* Package details */}
    {
      instance.package.feature_list && (
        <Grid templateColumns={`repeat(${columns}, 1fr)`}>
          <GridItem>
            <Text fontSize="sm">
              Storage: {instance.package.feature_list.spec[0]?.split(' ')[0]}
            </Text>
          </GridItem>
          <GridItem>
            <Text fontSize="sm" textAlign="right">
              Memory: {instance.package.feature_list.spec[2]?.split(' ')[1]}
            </Text>
          </GridItem>
          <GridItem>
            <Text fontSize="sm">
              CPUs: {instance.package.feature_list.spec[1]?.split(' ')[2]}
            </Text>
          </GridItem>
        </Grid>
      )
    }
  </Box>
}

const renderCards = (instances: Instance[]) => {
  return <Flex
    wrap="wrap"
    justify="flex-start" gap={6}
    direction={{ base: 'column', md: 'row' }}
    mb={8}
  >
    {
      instances.map((instance: Instance) => {
        return <Card key={instance.name} instance={instance}/>
      })
    }
  </Flex>
}

/** Service List Page in pagination */
const ServiceList: React.FC = () => {
  return (
    <>
      <PaginationPage
        title='Hosted Services'
        url='/api/instances/'
        action={fetchUserInstances}
        stateKey='instance'
        searchPlaceholder='Search by name'
        renderCards={renderCards}
      />
    </>
  );
};

export default ServiceList;
