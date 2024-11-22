import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PaginationResult } from "../types/paginationTypes";
import { ReduxState, ReduxStateInit } from "../types/reduxState";
import { headerWithToken } from "../../utils/helpers";
import { BillingInformation } from "./profileSlice";


export interface Company {
  id: number,
  name: string;
  billing_information: BillingInformation;
}

interface CompanyPaginationResult extends PaginationResult {
  results: Company[]
}

interface ListState extends ReduxState {
  data: CompanyPaginationResult | null
}

interface NonReturnState extends ReduxState {
  data: null
}

interface DetailState extends ReduxState {
  data: Company | null
}


interface CompanyState {
  list: ListState;
  create: NonReturnState;
  detail: DetailState;
  update: DetailState;
  delete: NonReturnState;
}

// Initial state
const initialState: CompanyState = {
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
  create: ReduxStateInit,
  update: ReduxStateInit,
  detail: ReduxStateInit,
  delete: ReduxStateInit,
};

// Async thunk to fetch user companies
export const fetchUserCompanies = createAsyncThunk(
  'company/fetchUserCompanies',
  async (url: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(url, {
        headers: headerWithToken()
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || 'An error occurred while fetching companies'
      );
    }
  }
);

export const createUserCompany = createAsyncThunk(
  'company/createUserCompany',
  async ({ companyData, files }: {
    companyData: any,
    files: Array<{ name: string, file: File | null }>
  }, thunkAPI) => {
    const data = new FormData();
    data.append("payload", JSON.stringify(companyData));
    files.map(file => {
      if (file.file) {
        data.append(file.name, file.file);
      }
    })
    try {
      const response = await axios.post('/api/companies/', data, {
        headers: headerWithToken()
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

export const fetchUserCompany = createAsyncThunk(
  'company/fetchUserCompany',
  async (id: number, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/companies/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      return response.data;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

export const updateUserCompany = createAsyncThunk(
  'company/updateUserCompany',
  async ({ id, companyData, files }: {
    id: number,
    companyData: any,
    files: Array<{ name: string, file: File | null }>
  }, thunkAPI) => {
    const data = new FormData();
    data.append("payload", JSON.stringify(companyData));
    files.map(file => {
      if (file.file) {
        data.append(file.name, file.file);
      }
    })
    try {
      const response = await axios.put(`/api/companies/${id}/`, data, {
        headers: headerWithToken()
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCompanies.pending, (state) => {
        state.list.loading = true;
        state.list.error = null;
      })
      .addCase(fetchUserCompanies.fulfilled, (state, action) => {
        state.list.loading = false;
        state.list.data = action.payload;
      })
      .addCase(fetchUserCompanies.rejected, (state, action) => {
        state.list.loading = false;
        state.list.error = action.payload as string; // Ensure error is string
      })
      .addCase(createUserCompany.pending, (state) => {
        state.create.loading = true;
        state.create.error = null;
      })
      .addCase(createUserCompany.fulfilled, (state, action) => {
        state.create.loading = false;
      })
      .addCase(createUserCompany.rejected, (state, action) => {
        state.create.loading = false;
        state.create.error = action.payload as string;
      })
      .addCase(fetchUserCompany.pending, (state) => {
        state.detail.loading = true;
        state.detail.error = null;
      })
      .addCase(fetchUserCompany.fulfilled, (state, action) => {
        state.detail.loading = false;
        state.detail.data = action.payload;
      })
      .addCase(fetchUserCompany.rejected, (state, action) => {
        state.detail.loading = false;
        state.detail.error = action.payload as string;
      })
      .addCase(updateUserCompany.pending, (state) => {
        state.update.loading = true;
        state.update.error = null;
      })
      .addCase(updateUserCompany.fulfilled, (state, action) => {
        state.update.loading = false;
      })
      .addCase(updateUserCompany.rejected, (state, action) => {
        state.update.loading = false;
        state.update.error = action.payload as string;
      });
  },
});

export default companySlice.reducer;
