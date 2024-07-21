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
  VStack, InputGroup, InputRightElement,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {RootState} from "../../redux/store";
import {login} from "../../redux/reducers/authSlice";

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector((state: RootState) => state.auth);
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleClick = () => setShow(!show);

  const handleLogin = () => {
    // @ts-ignore
    dispatch(login({ email, password })).then((result: any) => {
     if (result.meta.requestStatus === 'fulfilled') {
        onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={true} preserveScrollBarGap={true}  >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Log in</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {token ? (
            <p>You are already logged in.</p>
          ) : null }
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email"
                     placeholder='Enter email'
                     value={email}
                     autoFocus={true} onChange={(e) => setEmail(e.target.value)}/>
            </FormControl>
            <FormControl id="password" isRequired >
              <FormLabel>Password</FormLabel>
              <InputGroup size='md'>
                <Input
                  pr='4.5rem'
                  type={show ? 'text' : 'password'}
                  placeholder='Enter password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width='4.5rem'>
                  <Button h='1.75rem' size='sm' onClick={handleClick}>
                    {show ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Link href="#" fontSize="sm" color="purple.500" display="block" alignSelf="flex-end">
              Forgot your password?
            </Link>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme="purple" onClick={handleLogin} isLoading={loading}>
            Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default LoginForm;
