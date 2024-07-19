// src/theme/theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const customTheme = extendTheme({
  config,
  colors: {
    blue: {
      500: '#4F9AC0',
    },
    customOrange: {
      500: "#ECB44B",
      600: "#4F9AC0",
    },
    gray: {
      200: '#eaeaea',
      500: '#414042'
    }
  },
  fonts: {
    body: 'Lato, sans-serif',
    heading: 'Lato, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
      },
      sizes: {
        xl: {
          h: '56px',
          fontSize: 'lg',
          px: '32px',
        },
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "orange" ? "customOrange.500" : undefined,
          color: "white",
          _hover: {
            bg: props.colorScheme === "orange" ? "customOrange.600" : undefined,
          },
        }),
      },
    },
  },
});

export default customTheme;
