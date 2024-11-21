import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PaginationResult } from "../types/paginationTypes";
import { headerWithToken } from "../../utils/helpers";
import { ReduxState } from "../types/reduxState";

export interface Ticket {
  id: number;
  subject: string;
  details: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketPaginationResult extends PaginationResult {
  results: Ticket[]
}

interface ListState extends ReduxState {
  data: TicketPaginationResult | null
}

interface NonReturnState extends ReduxState {
  data: null
}

interface DetailState extends ReduxState {
  data: Ticket | null
}

interface SupportState {
  list: ListState;
  create: NonReturnState;
  detail: DetailState;
  update: DetailState;
  delete: NonReturnState;
}

// Initial state
const initialState: SupportState = {
  list: {
    data: {
      count: 0,
      next: null,
      previous: null,
      results: []
    },
    loading: false,
    error: null,
  },
  create: {
    data: null,
    loading: false,
    error: null,
  },
  update: {
    data: null,
    loading: false,
    error: null,
  },
  detail: {
    data: null,
    loading: false,
    error: null,
  },
  delete: {
    data: null,
    loading: false,
    error: null,
  },
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
  async (url: string, thunkAPI) => {
    try {
      const response = await axios.get(url, {
        headers: headerWithToken()
      });
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
      const response = await axios.post('/api/tickets/', ticketData, { headers: headerWithToken() });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);


// Async thunk for updating a ticket
export const updateTicket = createAsyncThunk(
  'support/updateTicket',
  async ({ id, updateData }: {
    id: number;
    updateData: Partial<Ticket>
  }, thunkAPI) => {
    try {
      const response = await axios.put(`/api/tickets/${id}/`, updateData);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

// Async thunk for uploading attachment
export const uploadAttachment = createAsyncThunk(
  'support/uploadAttachments',
  async ({ ticketId, file }: { ticketId: number; file: File }, thunkAPI) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticket', ticketId.toString());

    try {
      const response = await axios.post(`/api/tickets/${ticketId}/attachments/`, formData, {
        headers: {
          ...{
            'Content-Type': 'multipart/form-data'
          },
          ...headerWithToken()
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.list.data = {
          count: 0,
          next: null,
          previous: null,
          results: []
        };
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.list.data = action.payload;
        state.list.loading = false;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload as string;
      })
      .addCase(createTicket.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.create.loading = false;
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.create.loading = false;
        state.create.error = action.payload as string;
      });
  },
});

export const {} = supportSlice.actions;

export default supportSlice.reducer;
