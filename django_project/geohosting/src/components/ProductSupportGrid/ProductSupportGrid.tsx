import React from 'react';
import { Box, Text, Button, Flex, Icon } from '@chakra-ui/react';
import { FaGithub, FaHeadset } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Card = ({ icon, title, description, buttonText, descriptionMb = "4",definedWidth='100%', onButtonClick }) => (
  <Box
    width={{ base: '100%', md: '48%' }}
    borderRadius="8px"
    p="4"
    bg="white"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Flex
      direction={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'center', md: 'start' }}
      gap="26px"
      mb="4"
    >
      <Box
        width="125px"
        height="125px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="50%"
      >
        <Icon as={icon} w={32} h={32} color="#888B8C" />
      </Box>
      <Box textAlign={{ base: 'center', md: 'left' }}>
        <Text
          fontFamily="Lato"
          fontStyle="normal"
          fontWeight="700"
          fontSize={{ base: '24px', md: '24px' }}
          lineHeight={{ base: '28px', md: '38px' }}
          color="#3E3E3E"
          mb="4"
        >
          {title}
        </Text>
        <Text
          fontFamily="Lato"
          fontStyle="normal"
          fontWeight="400"
          fontSize={{ base: "md", md: "lg" , xl: 'lg' }}
          lineHeight={{ base: '18px', md: '19px' }}
          color="#555555"
          mb={descriptionMb}
          width={definedWidth}
        >
          {description}
        </Text>
        <Button
          width="full"
          maxW="220px"
          height="54px"
          background="#57A0C7"
          color="#FFFFFF"
          borderRadius="5px"
          fontFamily="Lato"
          fontWeight="700"
          fontSize="16px"
          lineHeight="19px"
          p="0"
          display={{ base: 'relative', md: 'flex' }}
          alignItems="center"
          justifyContent="center"
          _hover={{
            background: "#4682b4",
          }}
          mt="auto"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </Box>
    </Flex>
  </Box>
);

const ProductSupportGrid = ({ product }) => {
  const navigate = useNavigate();

  const handleSupportClick = () => {
    navigate('/dashboard/support');
  };

  const handleGithubClick = () => {
    const github_link = product.product_meta.find((meta) => meta.key === "github_link")?.value || "#";
    if (github_link && github_link !== "#") {
      window.location.href = github_link;
    }
  };


  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      width="100%"
      maxWidth="1048px"
      p="4"
      m="auto"
      gap={{ base: '16px', md: '10px' }}
    >
      <Card
        icon={FaGithub}
        title="Download"
        description={`The source code of ${product.name} is freely available on GitHub`}
        buttonText="GitHub"
        descriptionMb="20" onButtonClick={handleGithubClick}
      />
      <Card
        icon={FaHeadset}
        title="Support"
        description="We provide a full support service with our hosting packages. Need a custom solution? Let's discuss how we can customize the platform to suit your organisation's specific requirements."
        buttonText="Support Center"
        descriptionMb="9"
        onButtonClick={handleSupportClick}
        definedWidth='150%'
      />
    </Flex>
  );
};

export default ProductSupportGrid;
