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
  useDisclosure,
  Container,
} from "@chakra-ui/react";
import ImageWithSkeleton from "../ImageWithSkeleton/ImageWithSkeleton";


interface ProductOverviewProps {
  medias: ProductMedia[];
}

const ProductOverview: React.FC<ProductOverviewProps> = ({ medias }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [popupImage, setPopupImage] = useState<string | null>(null);

  const handleImageHover = (image: string) => {
    setPopupImage(image);
    onOpen();
  };

  return (
    <>
      {medias.map((image, index) => (
        <Box
          mb={4}
          backgroundColor={index % 2 === 0 ? "blue.400" : "transparent"}
          color={index % 2 === 0 ? "white" : "gray.500"}
          key={index}
          padding={10}
        >
          <Container maxW='container.xl'>
            <Flex
              direction={{ base: 'column', md: 'row', xl: 'row' }}
              alignItems={{ md: 'center', xl: 'center' }}
              justify="center"
              gap={5}
            >
              {index % 2 === 0 && (
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
              )}
              <Box flex="1">
                <Heading
                  as="h3"
                  size="lg"
                  textAlign={index % 2 === 0 ? "center" : "left"}
                  color={index % 2 === 0 ? "white" : "inherit"}
                >
                  {image.title}
                </Heading>
                <Text
                  mt={5}
                  textAlign={index % 2 === 0 ? "center" : "left"}
                  fontSize={20}
                  color={index % 2 === 0 ? "white" : "inherit"}
                >
                  {image.description}
                </Text>
              </Box>
              {index % 2 > 0 && (
                <Box flex="1">
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
                </Box>
              )}
            </Flex>
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
