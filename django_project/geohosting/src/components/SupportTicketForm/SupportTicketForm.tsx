import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Textarea,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { createTicket, uploadAttachments, updateTicket } from '../../redux/reducers/supportSlice';
import { toast } from 'react-toastify';

const EditorContainer = styled.div`
  .ck-editor__editable {
    height: 200px;
  }
`;

const FormContainer = styled(Box)`
  min-height: 600px; 
  max-height: 80vh;
  overflow-y: auto;
`;

interface Attachment {
  name: string;
  file: File;
}

interface SupportTicketFormProps {
  onClose: () => void;
  ticket?: {
    id: number;
    customer: string;
    subject: string;
    details: string;
    status: string;
    issue_type: string;
    attachments: Attachment[];
  };
}

const SupportTicketForm: React.FC<SupportTicketFormProps> = ({ onClose, ticket }) => {
  const dispatch: AppDispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.support);
  const [subject, setSubject] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('');
  const [editorData, setEditorData] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    const email = localStorage.getItem('email') || '';
    setCustomerEmail(email);

    if (ticket) {
      setIsEditMode(true);
      setSubject(ticket.subject);
      setIssueType(ticket.issue_type);
      setEditorData(ticket.details);
      setAttachments(ticket.attachments);
    }else {
      setIsEditMode(false);
      setSubject('');
      setIssueType('');
      setEditorData('');
      setAttachments([]);
    }
  }, [ticket]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map(file => ({
        name: file.name,
        file: file,
      }));
      setAttachments(prevAttachments => [...prevAttachments, ...newAttachments]);
    }
  };

  const handleDeleteAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const customer = customerEmail;
    const ticketData = {
      subject,
      details: editorData,
      status: 'open',
      customer,
      issue_type: issueType
    };

    if (isEditMode && ticket) {
      // TODO update tickets should also upload any new attachments added
      dispatch(updateTicket({
        id: ticket.id,
        updateData: ticketData
      })).then((result: any) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Ticket updated successfully.');
          onClose();
        } else {
          toast.error('Failed to update ticket.');
        }
      });
    } else {
      dispatch(createTicket(ticketData)).then((result: any) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success('Ticket created successfully.');
          onClose();
          setSubject('');
          setIssueType('');
          setEditorData('');
          setAttachments([]);

          const ticketId = result.payload.id;

          dispatch(uploadAttachments({
            ticketId,
            files: attachments.map(attachment => attachment.file)
          })).then((result: any) => {
            if (result.meta.requestStatus === 'fulfilled') {
              toast.success('Attachment uploaded successfully.');
            } else {
              toast.error('Failed to upload attachment.');
            }
          });
        } else {
          toast.error('Failed to create ticket.');
        }
      });
    }
  };

  return (
    <FormContainer
      p={8}
      maxWidth="700px"
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
      bg="white"
    >
      <VStack spacing={4}>
        <FormControl id="customer" isReadOnly>
          <FormLabel>Customer</FormLabel>
          <Input type="text" value={customerEmail} isReadOnly bg="gray.100" />
        </FormControl>

        <FormControl id="subject" isRequired>
          <FormLabel>Subject</FormLabel>
          <Input
            type="text"
            placeholder="Enter issue subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </FormControl>

        <FormControl id="issueType" isRequired>
          <FormLabel>Issue Type</FormLabel>
          <Select
            placeholder="Select issue type"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Support">Support</option>
          </Select>
        </FormControl>

        <FormControl id="issueDetails" isRequired>
          <FormLabel>Issue Details</FormLabel>
          <EditorContainer>
            <Textarea
              value={editorData}
              onChange={(event) => setEditorData(event.target.value)}
            />
          </EditorContainer>
        </FormControl>

        <FormControl id="attachments">
          <FormLabel>Attachments</FormLabel>
          <Input 
            type="file" 
            multiple 
            onChange={handleFileChange}
            sx={{
              '&::file-selector-button': {
                border: 'none',
                color: 'white',
                bg: 'blue.500',
                fontSize: 'sm',
                fontWeight: 'bold',
                p: '2',
                cursor: 'pointer',
                borderRadius: 'md',
                mt: '1.5px',
                _hover: {
                  bg: 'blue.600',
                },
              },
            }}
          />
        </FormControl>

        {attachments.length > 0 && (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>File Name</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {attachments.map((attachment, index) => (
                <Tr key={index}>
                  <Td>{attachment.name}</Td>
                  <Td>
                    <IconButton
                      aria-label="Delete attachment"
                      icon={<DeleteIcon />}
                      onClick={() => handleDeleteAttachment(index)}
                      colorScheme="red"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <HStack spacing={4}>
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={loading}
          >
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </FormContainer>
  );
};

export default SupportTicketForm;
