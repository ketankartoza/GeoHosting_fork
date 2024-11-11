import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Textarea,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon, DeleteIcon, WarningIcon } from '@chakra-ui/icons';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import {
  createTicket,
  updateTicket,
  uploadAttachment
} from '../../redux/reducers/supportSlice';
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
  uploading: boolean;
  uploaded: boolean;
  error: string;
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

const SupportTicketForm: React.FC<SupportTicketFormProps> = (
  { onClose, ticket }) => {
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
    } else {
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
        uploading: false,
        uploaded: false,
        error: '',
      }));
      setAttachments(
        prevAttachments => [...prevAttachments, ...newAttachments]
      );
    }
  };

  const handleDeleteAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  /**
   * Upload attachment
   * @param ticketId
   */
  const uploadAttachmentFn = async (ticketId: number) => {
    let success = true;
    // Upload attachment after ticket
    if (attachments?.length) {
      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i]
        if (attachment.uploaded) {
          return
        }
        attachment.uploading = true
        setAttachments([...attachments]);

        await dispatch(
          uploadAttachment({
            ticketId, file: attachment.file
          })
        ).then((result: any) => {
          attachment.uploading = false
          if (result.meta.requestStatus === 'fulfilled') {
            attachment.uploaded = true
          } else {
            attachment.error = 'Failed to upload attachment.'
            success = false;
          }
        });
        setAttachments([...attachments])
      }
    }
    return success
  }

  const handleSubmit = () => {
    // Upload attachment after ticket
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
      dispatch(
        createTicket(ticketData)
      ).then((result: any) => {
        if (result.meta.requestStatus === 'fulfilled') {
          toast.success(
            'Ticket created successfully. Now uploading attachments.'
          );
          (
            async () => {
              const ticketId = result.payload.id;
              const success = await uploadAttachmentFn(ticketId)
              if (success) {
                toast.success(
                  'All attachment uploaded successfully.'
                );
              } else {
                toast.error(
                  'Some of attachments are failed. Please reupload.'
                );
                return
              }

              // Close and make default
              onClose();
              setSubject('');
              setIssueType('');
              setEditorData('');
              setAttachments([]);
            }
          )()
        } else {
          toast.error('Failed to create ticket.');
        }
      });
    }
  };

  return (
    <FormContainer p={4}>
      <VStack spacing={4}>
        <FormControl id="customer" isReadOnly>
          <FormLabel>Customer</FormLabel>
          <Input type="text" value={customerEmail} isReadOnly bg="gray.100"/>
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

        <FormControl id="attachments" position={"relative"}>
          <FormLabel>Attachments</FormLabel>
          <Input
            id={'attachments'}
            type="file"
            multiple
            onChange={handleFileChange}
            pos='absolute'
            top={0}
            left={0}
            height='100%'
            width='100%'
            opacity={0}
          />
          <Button
            disabled={true}
            colorScheme="orange"
            width='100%'
            onClick={() => {
              // @ts-ignore
              document.getElementById("attachments").click();
            }}
          >
            Add attachment
          </Button>
        </FormControl>

        {
          attachments.length > 0 && (
            <Table variant="simple">
              <Tbody>
                {
                  attachments.map((attachment, index) => (
                    <Tr key={index}>
                      <Td padding={0}>{attachment.name}</Td>
                      <Td padding={0}>
                        {
                          attachment.uploading ?
                            <span>uploading</span> : attachment.error ?
                              <WarningIcon color='red'/> : null
                        }
                      </Td>
                      <Td padding={0}>
                        {
                          attachment.uploaded ?
                            <CheckCircleIcon color='green'/> :
                            <IconButton
                              size={'xs'}
                              aria-label="Delete attachment"
                              icon={<DeleteIcon/>}
                              onClick={() => handleDeleteAttachment(index)}
                              colorScheme="red"
                            />
                        }
                      </Td>
                    </Tr>
                  ))
                }
              </Tbody>
            </Table>
          )
        }

        <HStack spacing={4} mt={4}>
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
