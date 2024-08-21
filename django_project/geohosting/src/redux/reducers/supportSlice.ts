import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Ticket {
  id: number;
  subject: string;
  details: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AttachmentsState {
  [key: number]: File[];
}

interface SupportState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  attachments: AttachmentsState;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: SupportState = {
  tickets: [],
  selectedTicket: null,
  attachments: {},
  loading: false,
  error: null,
};

interface CreateTicketData {
  subject: string;
  details: string;
  status: string;
  customer: string;
  issue_type: string;
}

// Async thunk for fetching tickets
export const fetchTickets = createAsyncThunk(
  'support/fetchTickets',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/support/tickets/');
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

// Async thunk for fetching a single ticket
export const fetchTicket = createAsyncThunk(
  'support/fetchTicket',
  async (id: number, thunkAPI) => {
    try {
      const response = await axios.get(`/api/support/tickets/${id}/`);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

// Async thunk for creating a ticket
export const createTicket = createAsyncThunk(
  'support/createTicket',
  async (ticketData: CreateTicketData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/support/tickets/', ticketData, { headers: { Authorization: `Token ${token}` }});
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);


// Async thunk for updating a ticket
export const updateTicket = createAsyncThunk(
  'support/updateTicket',
  async ({ id, updateData }: { id: number; updateData: Partial<Ticket> }, thunkAPI) => {
    try {
      const response = await axios.put(`/api/support/tickets/${id}/`, updateData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

// Async thunk for uploading attachments 
export const uploadAttachments = createAsyncThunk(
  'support/uploadAttachments',
  async ({ ticketId, files }: { ticketId: number; files: File[] }, thunkAPI) => {
    const formData = new FormData();
    const token = localStorage.getItem('token');
    files.forEach(file => formData.append('attachments', file));

    try {
      const response = await axios.post(`/api/support/tickets/${ticketId}/attachments/`, formData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
    setAttachments: (state, action) => {
      const { ticketId, files } = action.payload;
      state.attachments[ticketId] = files;
    },
    clearAttachments: (state, action) => {
      const ticketId = action.payload;
      delete state.attachments[ticketId];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTicket = action.payload;
      })
      .addCase(fetchTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.push(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTicket = action.payload;
        state.tickets = state.tickets.map(ticket =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        );
        if (state.selectedTicket?.id === updatedTicket.id) {
          state.selectedTicket = updatedTicket;
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.loading = false;
        const { ticketId, files } = action.payload;
        state.attachments[ticketId] = files;
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedTicket,
  clearSelectedTicket,
  setAttachments,
  clearAttachments,
} = supportSlice.actions;

export default supportSlice.reducer;
