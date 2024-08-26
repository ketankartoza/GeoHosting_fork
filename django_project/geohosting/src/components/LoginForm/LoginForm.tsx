import React, { useState, useEffect } from 'react';
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
import { login, logout, register, resetPassword } from '../../redux/reducers/authSlice';

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
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [isEmailTouched, setIsEmailTouched] = useState<boolean>(false);

  const handleClick = () => setShow(!show);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setIsEmailTouched(true);
    if (emailValue === '') {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(validateEmail(emailValue));
    }
  };

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
      if (isForgotPassword) {
        handlePasswordReset();
      } else if (isSignUp) {
        handleSignUp();
      } else {
        handleLogin();
      }
    }
  };

  const handlePasswordReset = () => {
    dispatch(resetPassword(email)).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('An email has been sent to reset your password.');
        setIsForgotPassword(false);
      } else if (result.meta.requestStatus === 'rejected') {
        if (result.payload) {
          const errorMessages = Object.entries(result.payload)
            .map(([key, value]) => `${value}`)
            .join('\n');
          toast.error(errorMessages);
        } else {
          toast.error('Password reset failed. Please try again later.');
        }
      } else {
        toast.error('Invalid email address. Please enter a valid email. ');
      }
    });
  };

  const isFormValid = () => {
    if (isSignUp) {
      return email && password && firstName && lastName && isEmailValid;
    } else if (isForgotPassword) {
      return email && isEmailValid;
    }
    return email && password && isEmailValid;
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setIsEmailTouched(false);
    setEmail('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={true} preserveScrollBarGap={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{token ? 'Welcome' : isSignUp ? 'Sign Up' : isForgotPassword ? 'Reset Password' : 'Log in'}</ModalHeader>
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
                  onChange={handleEmailChange}
                  onKeyUp={handleKeyPress}
                />
                {isEmailTouched && !isEmailValid && <Text color="red.500">Invalid email address.</Text>}
              </FormControl>
              {!isForgotPassword && (
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
                      <Button 
                        h="1.75rem" 
                        size="sm" 
                        onClick={handleClick} 
                        colorScheme="blue"
                      >
                          {show ? 'Hide' : 'Show'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              )}
              {!isSignUp && !isForgotPassword && (
                <Link
                  href="#"
                  fontSize="sm"
                  color="purple.500"
                  display="block"
                  alignSelf="flex-end"
                  onClick={() => setIsForgotPassword(true)}
                >
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
              <Button
                colorScheme="blue"
                onClick={isForgotPassword ? handlePasswordReset : isSignUp ? handleSignUp : handleLogin}
                isLoading={loading}
                isDisabled={!isFormValid()}
              >
                {isForgotPassword ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Login'}
              </Button>
              {!isForgotPassword && (
                <Button variant="ghost" size="sm" mt={2} onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? 'Have an account? Log in' : 'Need an account? Sign up'}
                </Button>
              )}
              {isForgotPassword && (
                <Button variant="ghost" size="sm" mt={2} onClick={handleBackToLogin}>
                  Back to Login
                </Button>
              )}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginForm;
