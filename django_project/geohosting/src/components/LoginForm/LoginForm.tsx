import React, {useState} from 'react';
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

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose }) => {
  const [show, setShow] = React.useState(false)
  const handleClick = () => setShow(!show)
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleChange = (event) => setEmail(event.target.value)

  const handleLogin = () => {
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={true} preserveScrollBarGap={true}  >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Log in</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email"
                     placeholder='Enter email'
                     value={email}
                     autoFocus={true} onChange={handleChange}/>
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
          <Button colorScheme="purple" onClick={handleLogin}>
            Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default LoginForm;
