import React, { useState } from "react";
import { ProductMedia } from "../../redux/reducers/productsSlice";
import {
  Box,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Flex,
  Text,
  useDisclosure, Container,
} from "@chakra-ui/react";
import ImageWithSkeleton from "../ImageWithSkeleton/ImageWithSkeleton";

const ProductOverview = (medias: ProductMedia[]) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [popupImage, setPopupImage] = useState<string | null>(null);

  const handleImageHover = (image: string) => {
    setPopupImage(image);
    onOpen();
  };

  return (
    <>
      {medias &&
        Object.entries(medias).map(([index, image]) => (
          <Box
            mb={4}
            backgroundColor={parseInt(index) % 2 ? "transparent" : "blue.400"}
            color={parseInt(index) % 2 ? "gray.500" : "white"}
            key={index}
            padding={10}
          >
            <Container maxW='container.xl'>
              {parseInt(index) % 2 > 0 ? (
                <Flex
                  direction={{ base: 'column', md: 'row', xl: 'row' }}
                  alignItems={{ md: 'center', xl: 'center' }}
                >
                  <Box flex="1">
                    <ImageWithSkeleton
                      key={image.id}
                      src={image.image}
                      alt={image.title}
                      width="100%"
                      height="100%"
                      borderRadius="md"
                      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
                      onClick={() => handleImageHover(image.image)}
                      mb={5}
                    />
                  </Box>
                  <Box flex="1" ml={5}>
                    <Heading as="h3" size="lg" textAlign="left">
                      {image.title}
                    </Heading>
                    <Text mt={10} textAlign="left" fontSize={20}>
                      {image.description}
                    </Text>
                  </Box>
                </Flex>
              ) : (
                <>
                  <Heading as="h3" size="lg" textAlign="center" mb={4}>
                    {image.title}
                  </Heading>
                  <ImageWithSkeleton
                    key={image.id}
                    src={image.image}
                    alt={image.title}
                    width="100%"
                    height="auto"
                    borderRadius="md"
                    onClick={() => handleImageHover(image.image)}
                    mb={5}
                    boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
                  />
                  <Text mt={5} textAlign="center" fontSize={20}>
                    {image.description}
                  </Text>
                </>
              )}
            </Container>
          </Box>
        ))}
      <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image
              src={popupImage ? popupImage : ""}
              alt="Product Image"
              width={"100%"}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductOverview;
