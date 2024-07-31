import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  VStack,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../redux/store';
import { login, logout, register } from '../../redux/reducers/authSlice';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useSelector((state: RootState) => state.auth);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const handleClick = () => setShow(!show);

  const handleLogin = () => {
    dispatch(login({ email, password })).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onClose();
        navigate('/dashboard');
      } else if (result.meta.requestStatus === 'rejected') {
        if (result.payload) {
          const errorMessages = Object.entries(result.payload)
            .map(([key, value]) => `${value}`)
            .join('\n');
          toast.error(errorMessages);
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    });
  };

  const handleSignUp = () => {
    dispatch(register({ email, password, firstName, lastName })).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') {
        onClose();
        navigate('/dashboard');
      } else if (result.meta.requestStatus === 'rejected') {
        if (result.payload) {
          const errorMessages = Object.entries(result.payload)
            .map(([key, value]) => `${value}`)
            .join('\n');
          toast.error(errorMessages);
        } else {
          toast.error('Sign up failed. Please try again.');
        }
      }
    });
  };

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      toast.success('Successfully logged out.');
      onClose();
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSignUp) {
        handleSignUp();
      } else {
        handleLogin();
      }
    }
  };

  const isFormValid = () => {
    if (isSignUp) {
      return email && password && firstName && lastName;
    }
    return email && password;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={true} preserveScrollBarGap={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{token ? 'Welcome' : isSignUp ? 'Sign Up' : 'Log in'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {token ? (
            <Text>You are already logged in.</Text>
          ) : (
            <VStack spacing={4}>
              {isSignUp && (
                <>
                  <FormControl id="first-name" isRequired>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyUp={handleKeyPress}
                    />
                  </FormControl>
                  <FormControl id="last-name" isRequired>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyUp={handleKeyPress}
                    />
                  </FormControl>
                </>
              )}
              <FormControl id="email" isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  autoFocus={true}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyUp={handleKeyPress}
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={show ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleKeyPress}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {isSignUp && (
                  <Text fontSize="sm" color="gray.500">
                    Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.
                  </Text>
                )}
              </FormControl>
              {!isSignUp && (
                <Link href="#" fontSize="sm" color="purple.500" display="block" alignSelf="flex-end">
                  Forgot your password?
                </Link>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter justifyContent="center" flexDirection="column">
          {token ? (
            <Button colorScheme="blue" onClick={handleLogout} isLoading={loading}>
              Logout
            </Button>
          ) : (
            <>
              <Button colorScheme="blue" onClick={isSignUp ? handleSignUp : handleLogin} isLoading={loading} isDisabled={!isFormValid()}>
                {isSignUp ? 'Sign Up' : 'Login'}
              </Button>
              <Button variant="ghost" size="sm" mt={2} onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Have an account? Log in' : 'Need an account? Sign up'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginForm;
