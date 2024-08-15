import React, { useState } from 'react';
import { Box, Skeleton, Image, BoxProps } from '@chakra-ui/react';

type ImageWithSkeletonProps = BoxProps & {
  src: string;
  alt: string;
  width: number | string;
  height?: number | string;
  borderRadius?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}


const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ src, alt, width, height, borderRadius, onClick, style, ...rest }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <Box position="relative"
         width={width}
         height={height}
         onClick={onClick}
         style={style}
         cursor={onClick ? 'pointer' : 'default'} {...rest}>
      {!imageLoaded && (
        <Skeleton
          width={width}
          height={height}
          borderRadius={borderRadius}
          startColor="gray.200"
          endColor="gray.400"
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleImageLoad}
        display={imageLoaded ? 'block' : 'none'}
        borderRadius={borderRadius}
      />
    </Box>
  );
};

export default ImageWithSkeleton;
