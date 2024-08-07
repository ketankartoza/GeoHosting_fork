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
  VStack,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '../../redux/store';
import { confirmResetPassword } from '../../redux/reducers/authSlice';

interface PasswordResetConfirmProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetConfirm: React.FC<PasswordResetConfirmProps> = ({ isOpen, onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading } = useSelector((state: RootState) => state.auth);
  const [show, setShow] = useState(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  const handleClick = () => setShow(!show);

  const getTokenFromUrl = (): string | null => {
    const params = new URLSearchParams(location.search);
    return params.get('token');
  };

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      setIsValid(false);
    } else if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      setIsValid(false);
    } else {
      setPasswordError('');
      setIsValid(true);
    }
  };

  useEffect(() => {
    validatePasswords();
  }, [newPassword, confirmPassword]);

  const handlePasswordResetConfirm = () => {
    if (!isValid) {
      return;
    }

    const token = getTokenFromUrl();
    if (!token) {
      toast.error('Invalid or missing token.');
      return;
    }

    dispatch(confirmResetPassword({ token, new_password: newPassword })).then((result: any) => {
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(result.payload.message);
        onClose();
        navigate('/'); // navigate home ?
      } else if (result.meta.requestStatus === 'rejected') {
        if (result.payload) {
          toast.error(result.payload.error);
        } else {
          toast.error('Password reset failed. Please try again.');
        }
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={true} preserveScrollBarGap={true}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reset Password</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl id="new-password" isRequired>
              <FormLabel>New Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={show ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl id="confirm-password" isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={show ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </InputGroup>
            </FormControl>
            {passwordError && <Text color="red.500">{passwordError}</Text>}
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center" flexDirection="column">
          <Button
            colorScheme="blue"
            onClick={handlePasswordResetConfirm}
            isLoading={loading}
            isDisabled={!isValid}
          >
            Reset Password
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PasswordResetConfirm;
