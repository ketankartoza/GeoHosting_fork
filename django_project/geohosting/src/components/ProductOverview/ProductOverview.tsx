import React, { useState } from "react";
import { ProductMedia } from "../../redux/reducers/productsSlice";
import {
  Box,
  Heading,
  Image, Modal, ModalBody, ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure
} from "@chakra-ui/react";

const ProductOverview = (medias: ProductMedia[]) => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [popupImage, setPopupImage] = useState<string | null>(null);

  const handleImageHover = (image: string) => {
    setPopupImage(image);
    onOpen();
  };

  return (
    <>
      {medias && Object.entries(medias).map(([index, image]) => (
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 2 }}
          mb={4}
          spacingX='40px'
          spacingY={{ base: 10, md: 10, lg: 0 }}
          backgroundColor={(parseInt(index) % 2) ? 'white' : 'blue.500'}
          color={(parseInt(index) % 2) ? 'gray.500' : 'white'}
          borderRadius={10}
          key={index}
          padding={10}
        >
          {parseInt(index) % 2 > 0 ? (
            <>
              <Box>
                <Image
                  key={image.id}
                  src={image.image}
                  alt={image.title}
                  onClick={() => handleImageHover(image.image)}
                  style={{
                    cursor: 'pointer'
                  }}
                  mb={5}
                />
              </Box>
              <Box>
                <Heading as="h3" size="lg" textAlign={'left'}>{image.title}</Heading>
                <Text mt={5} textAlign={"left"} fontSize={20}>
                  {image.description}
                </Text>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Heading as="h3" size="lg" textAlign={'right'}>{image.title}</Heading>
                <Text mt={5} textAlign={"right"} fontSize={20}>
                  {image.description}
                </Text>
              </Box>
              <Box>
                <Image
                  key={image.id}
                  src={image.image}
                  alt={image.title}
                  onClick={() => handleImageHover(image.image)}
                  style={{
                    cursor: 'pointer'
                  }}
                  mb={5}
                />
              </Box>
            </>
          )}
        </SimpleGrid>
      ))}
      <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image src={popupImage ? popupImage : ''} alt="Product Image" width={'100%'} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ProductOverview;
