import React, { MouseEventHandler, useState } from 'react';
import { Box, Heading, Text, Button, Skeleton, Image } from '@chakra-ui/react';
import ImageWithSkeleton from "../ImageWithSkeleton/ImageWithSkeleton";

interface CardProps {
  image?: string;
  title: string;
  description: string;
  comingSoon?: boolean;
  onClick: MouseEventHandler;
  selected: boolean;
}

const ProductCard: React.FC<CardProps> = ({ image, title, description, comingSoon, onClick, selected }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setHovering(true);
  const handleMouseLeave = () => setHovering(false);

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      textAlign="center"
      paddingTop={5}
      paddingBottom={5}
      position="relative"
      height={350}
      onClick={onClick}
      backgroundColor={selected ? "blue.100" : "gray.200"}
      borderColor={hovering ? "rgba(87, 160, 198)" : "gray.200"}
      width={["350px", "350px", "320px", "320px"]}
      transition="background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease"
      cursor="pointer"
      boxShadow={hovering ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "0 2px 4px rgba(0, 0, 0, 0.1)"}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      _hover={{
        borderColor: "rgba(87, 160, 198, 0.4)",
        _before: {
          background: hovering
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(87, 160, 198, 0.2), rgba(87, 160, 198, 0) 200px)`
            : 'transparent',
          transition: 'background 0.1s ease',
        },
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: hovering
          ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(87, 160, 198, 0.3), rgba(87, 160, 198, 0) 200px)`
          : 'transparent',
        transition: 'background 0.1s ease',
        zIndex: 0,
      }}
    >
      {comingSoon && (
        <Box
          position="absolute"
          top="-35px"
          right="-35px"
          zIndex={1}
        >
          <Image
            src='/static/images/Coming_Soon_Banner.png'
            alt='Coming Soon'
            width={180}
          />
        </Box>
      )}
      <Box justifyContent={'center'} display={'flex'} zIndex={1}>
        <ImageWithSkeleton
          src={image || ''}
          alt={title}
          width={115}
          height={115}
          borderRadius="none"
        />
      </Box>
      <Heading as="h3" size="md" marginBottom="10px" zIndex={1}>
        {title}
      </Heading>
      <Text justifyContent={'center'} display={'flex'} fontSize="md" marginBottom="20px"
        maxW={["500px", "350px", "320px", "320px"]} pt={2} pb={5} pl={5} pr={5} height={75} zIndex={1}>
        {description}
      </Text>
      <Button colorScheme="orange" onClick={onClick} zIndex={1}>Learn More</Button>
    </Box>
  );
};

export default ProductCard;
