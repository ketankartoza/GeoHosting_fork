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
} from "@chakra-ui/react";
import ImageWithSkeleton from "../ImageWithSkeleton/ImageWithSkeleton";

const ProductOverview = ({ productMeta, medias, productName }: { productMeta: { key: string; value: string }[]; medias: ProductMedia[]; productName: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [popupImage, setPopupImage] = useState<string | null>(null);

  const handleImageHover = (image: string) => {
    setPopupImage(image);
    onOpen();
  };

  const imagesToDisplay = medias && medias.length > 0 ? medias: [];

  // Extract the headers from productMeta using the provided keys
  const overviewHeader = productMeta.find((meta) => meta.key === "overview_header")?.value || "Overview Header";
  const continuationHeader = productMeta.find((meta) => meta.key === "overview_continuation_header")?.value || "Continuation Header";
  const overviewDescription = productMeta.find((meta) => meta.key === "overview_description")?.value || "Overview Description";
  const overviewContinuation = productMeta.find((meta) => meta.key === "overview_continuation")?.value || "Overview Continuation";

  return (
    <>
      <Box
        width="100%"
        backgroundColor="blue.400"
        paddingX={{ base: 4, md: 10, lg: 40 }}
        paddingY={{ base: 6, md: 10 }}
      >
        {imagesToDisplay.map((image, index) => (
          <Box
            key={image.id}
            color="white"
            padding={4}
            backgroundColor="blue.400"
            marginBottom={{ base: 6, md: 10 }}
          >
            <Flex
              direction={{ base: "column", md: index === 1 ? "row" : "column" }}
              alignItems={{ base: "center", md: index === 1 ? "flex-start" : "center" }}
              justifyContent={{ base: "center", md: index === 1 ? "center" : "flex-start" }}
              backgroundColor="blue.400"
              minHeight="200px"
            >
              {index === 1 ? (
                <>
                  <Box
                    flex="1"
                    textAlign="center"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom={{ base: 4, md: 5 }}
                  >
                    <ImageWithSkeleton
                      src={image.image}
                      alt={image.title}
                      width="100%"
                      height="auto"
                      borderRadius="md"
                      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
                      onClick={() => handleImageHover(image.image)}
                    />
                  </Box>
                  <Box
                    flex="1"
                    marginLeft={{ base: 0, md: 10 }}
                    width={{ base: "100%", md: "300px" }}
                  >
                    <Heading as="h3" size="lg" textAlign={{ base: "center", md: "left" }} marginBottom={5}>
                      {continuationHeader}
                    </Heading>
                    <Text marginTop={10} textAlign={{ base: "center", md: "left" }} fontSize={{ base: "md", md: "lg" }}>
                      {overviewContinuation}
                    </Text>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    width="100%"
                    marginBottom={{ base: 4, md: 0 }}
                  >
                    {index === 0 && (
                      <Heading as="h3" size="lg" textAlign="center" marginBottom={5} marginTop={5}>
                        What {productName} Can Do for You
                      </Heading>
                    )}
                    <Heading as="h3" size="lg" textAlign="center" marginBottom={5}>
                      {overviewHeader}
                    </Heading>
                    <ImageWithSkeleton
                      src={image.image}
                      alt={image.title}
                      width="100%"
                      height="auto"
                      borderRadius="md"
                      boxShadow="0px 4px 6px rgba(0, 0, 0, 0.2)"
                      onClick={() => handleImageHover(image.image)}
                      marginBottom={5}
                    />
                  </Box>
                  <Box
                    flex="1"
                    width={{ base: "100%", md: "60%" }}
                  >
                    <Text marginTop={5} textAlign="center" fontSize={{ base: "md", md: "lg" }}>
                      {overviewDescription}
                    </Text>
                  </Box>
                </>
              )}
            </Flex>
          </Box>
        ))}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image src={popupImage ? popupImage : ""} alt="Product Image" width={"100%"} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductOverview;
