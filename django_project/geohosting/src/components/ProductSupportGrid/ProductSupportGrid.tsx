import React, { useRef } from 'react';
import { Box, Text, Button, Flex, Icon } from '@chakra-ui/react';
import { FaGithub, FaHeadset } from 'react-icons/fa';
import { SupportTicketFormModal ,SupportTicketFormModalHandle } from '../SupportTicketForm/SupportTicketFormModal';

const Card = ({ icon, title, description, buttonText, descriptionMb = "4", definedWidth, onButtonClick }) => (
  <Box
    width={"100%"}
    p="4"
    bg="white"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Flex
      direction={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'center', md: 'start' }}
      gap={12}
      mb="4"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="50%"
      >
        <Icon as={icon} w={32} h={32} color="#888B8C" />
      </Box>
      <Box textAlign={{ base: 'center', md: 'left' }} flex="1">
        <Text
          fontFamily="Lato"
          fontStyle="normal"
          fontWeight="700"
          fontSize={{ base: 24, md: 32 }}
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
          fontSize={{ base: "sm", md: "md", xl: 'lg' }}
          lineHeight={{ base: '1.5', md: '1.6' }}
          color="#555555"
          mb={descriptionMb}
          width="100%"
        >
          {description}
        </Text>
      </Box>
    </Flex>
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
      alignSelf={{ base: 'center', md: 'center' }}
      _hover={{
        background: "#4682b4",
      }}
      mt="auto"
      onClick={onButtonClick}
    >
      {buttonText}
    </Button>
  </Box>
);

const ProductSupportGrid = ({ product }) => {
  const modalRef = useRef<SupportTicketFormModalHandle>(null);

  const handleSupportClick = () => {
    if (modalRef.current) {
      modalRef.current.open();
    }
  };

  const handleGithubClick = () => {
    const githubLink = product.product_meta.find((meta) => meta.key === "github_link")?.value || "#";
    if (githubLink && githubLink !== "#") {
      window.location.href = githubLink;
    }
  };

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      width="100%"
      p="4"
      m="auto"
      gap={{ base: '16px', md: '10px' }}
    >
      <Card
        icon={FaGithub}
        title="Download"
        description={"The source code of " + product.name + " is freely available on GitHub"}
        buttonText="GitHub"
        descriptionMb="10"
        onButtonClick={handleGithubClick}
        definedWidth="100%"
      />
      <Card
        icon={FaHeadset}
        title="Support"
        description={
          product.product_meta.find(meta => meta.key === 'support_description')?.value
        }
        buttonText="Support Center"
        descriptionMb="2"
        onButtonClick={handleSupportClick}
        definedWidth={{ base: '100%', md: '150%' }}
      />
      
      {/* Support Ticket Modal */}
      <SupportTicketFormModal ref={modalRef} onClose={() => {}} ticket={null} />
    </Flex>
  );
};

export default ProductSupportGrid;
