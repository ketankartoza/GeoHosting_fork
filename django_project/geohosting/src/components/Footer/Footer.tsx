import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Link, Button, IconButton } from '@chakra-ui/react';
import { ChevronUpIcon } from '@chakra-ui/icons';
import { UnorderedList, ListItem, Icon } from "@chakra-ui/react";
import { FaTwitter, FaYoutube, FaInstagram, FaFacebook, FaLinkedin, FaGithub } from 'react-icons/fa6';
import LoginForm from '../LoginForm/LoginForm';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

const Footer: React.FC = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const { token, loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLoginForm = () => {
    setIsLoginFormOpen(true);
  };

  const handleCloseLoginForm = () => {
    setIsLoginFormOpen(false);
  };

  return (
    <>
      <Box
        width="100%"
        backgroundColor="#404040"
        py="8"
        px="6"
        color="white"
        mt="auto"
        position="relative"
      >
        <Flex
          maxW="1200px"
          mx="auto"
          justify="space-between"
          flexWrap="wrap"
          gap="6"
        >
          <Box flex="1" minW="300px">
            <Text fontSize="lg" fontWeight="bold" mb="4" color="white">
              About Kartoza
            </Text>
            <Text color="#b4b6b0" fontSize={{ base: "md", md: "md" , xl: 'md' }} >
              We are a South Africa-based Free and Open Source GIS service provider. We develop and maintain geographic information systems and train teams to use geospatial software to its full potential.
            </Text>

            <Box mt={4} color='white' opacity={0.2}>Version {window.app_version}</Box>
          </Box>

          {/* Navigation Links */}
          <Box flex="1" minW="300px">
            <Text fontSize="lg" fontWeight="bold" mb="4" color="white">
              Navigate
            </Text>
            <UnorderedList listStyleType="none" m="0" p="0" fontSize={{ base: "md", md: "md" , xl: 'md' }} >
              <ListItem>
                <Link href="https://kartoza.com/crowdfunding" color="#b4b6b0">Crowdfunding</Link>
              </ListItem>
              <ListItem>
                <Link href="https://kartoza.com/contact-us/new" color="#b4b6b0">Contact</Link>
              </ListItem>
              <ListItem>
                <Link href="https://kartoza.com/internships" color="#b4b6b0">Internships</Link>
              </ListItem>
              <ListItem>
                <Link href="https://kartoza.com/policies" color="#b4b6b0">Policies</Link>
              </ListItem>
              <ListItem>
                <Link href="https://kartoza.com/careers" color="#b4b6b0">We're Hiring!</Link>
              </ListItem>
              <ListItem>
                <Link href="https://kartoza.com/portfolio" color="#b4b6b0">Portfolio</Link>
              </ListItem>
            </UnorderedList>
          </Box>

          {/* Follow Kartoza */}
          <Box flex="1" minW="300px">
            <Text fontSize="lg" fontWeight="bold" mb="4" color="white"> {/* Increased margin-bottom */}
              Follow Kartoza
            </Text>
            <Flex gap="1" mb="4">
              <Link href="https://twitter.com/KartozaGeo" target="_blank">
                <Icon as={FaTwitter} w={9} h={9} color="white" />
              </Link>
              <Link href="https://www.instagram.com/kartozageo/" target="_blank">
                <Icon as={FaInstagram} w={9} h={9} color="white" />
              </Link>
              <Link href="https://www.facebook.com/kartozaGIS" target="_blank">
                <Icon as={FaFacebook} w={9} h={9} color="white" />
              </Link>
              <Link href="https://www.linkedin.com/company/kartoza-pty-ltd" target="_blank">
                <Icon as={FaLinkedin} w={9} h={9} color="white" />
              </Link>
              <Link href="https://www.github.com/orgs/kartoza" target="_blank">
                <Icon as={FaGithub} w={9} h={9} color="white" />
              </Link>
              <Link href="https://www.youtube.com/user/kartozachannel/feed" target="_blank">
                <Icon as={FaYoutube} w={9} h={9} color="white" />
              </Link>
            </Flex>

            <Text mb="6" color="#b4b6b0" fontSize={{ base: "md", md: "md" , xl: 'md' }} >
              Be the first to know! Sign up for our newsletter and stay in the loop with all things Kartoza.
            </Text>

            <Flex gap="2">
              {!token && (
                <Button
                  type="button"
                  bg="#f8b54b"
                  color="white"
                  _hover={{ bg: '#57a0c7' }}
                  onClick={handleOpenLoginForm}
                  width="220px"
                  height="54px"
                >
                  Sign Up
                </Button>
              )}
            </Flex>
          </Box>
        </Flex>

        {/* Scroll to Top Button */}
        {showScrollButton && (
          <IconButton
            position="fixed"
            bottom="50px"
            right="30px"
            bg="#f8b54b"
            color="white"
            fontSize="2.5rem"
            _hover={{ bg: '#57a0c7' }}
            aria-label="Scroll to top"
            icon={<ChevronUpIcon />}
            onClick={scrollToTop}
          />
        )}
      </Box>

      {/* Login Form Modal */}
      <LoginForm isOpen={isLoginFormOpen} onClose={handleCloseLoginForm} formType={'signup'}/>
    </>
  );
};

export default Footer;
