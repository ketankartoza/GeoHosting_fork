import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Instance } from "../../redux/reducers/instanceSlice";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure
} from "@chakra-ui/react";
import axios from "axios";
import { headerWithToken } from "../../utils/helpers";
import { toast } from "react-toastify";

interface Props {
  instance: Instance;
}

/** Instance deletion */
export const InstanceDeletion = forwardRef(
  ({ instance }: Props, ref
  ) => {
    const [appName, setAppName] = useState('');
    const [deleting, setDeleting] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Open
    useImperativeHandle(ref, () => ({
      open() {
        onOpen()
      }
    }));

    // Handle create company
    const submit = () => {
      axios.delete(
        '/api/instances/' + instance.id + '/',
        {
          headers: headerWithToken()
        }
      ).then((response) => {
        location.reload()
      }).catch(function (error) {
        toast.error(
          error.response?.data ? error.response?.data : error.message
        );
      })
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        blockScrollOnMount={true}
        preserveScrollBarGap={true}>
        <ModalOverlay/>
        <ModalContent bg={'gray.200'}>
          <ModalCloseButton/>
          <ModalBody m={4}>
            <Box width={{ base: '100%' }}>
              <Box color="red.600">
                Are you sure you want to delete the server
                instance <b>{instance.name}</b>?
                <br/>
                <br/>
                This action is irreversible and will permanently remove the
                instance.
                <br/>
                Additionally, your subscription will be canceled, and the
                server
                cannot be restored once deleted.
              </Box>
              <Box marginTop={8}>
                <FormControl>
                  <FormLabel>Enter the instance name</FormLabel>
                  <Input
                    isDisabled={deleting}
                    value={appName}
                    onChange={
                      (e) => setAppName(
                        e.target.value
                      )
                    }
                    borderWidth="0px"
                    borderColor="gray.400"
                    bg="white"
                    width={'100%'}
                  />
                </FormControl>
                <Button
                  isDisabled={appName !== instance.name}
                  w={'100%'}
                  mt={8}
                  colorScheme="blue"
                  alignSelf="flex-start"
                  onClick={submit}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

export default InstanceDeletion;