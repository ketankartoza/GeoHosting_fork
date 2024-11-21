import {
  createAsyncThunk,
  createSlice,
  SerializedError
} from '@reduxjs/toolkit';
import axios from "axios";
import { headerWithToken } from "../../utils/helpers";

export interface Profile {
  avatar: string;
}

export interface BillingInformation {
  name: string;
  address: string;
  postal_code: string;
  country: string;
  city: string;
  region: string;
  tax_number: string;
}

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  profile: Profile;
  billing_information: BillingInformation;
}

interface ProfileState {
  user: User | null;
  loading: boolean;
  error: SerializedError | null;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk for change password
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/user/profile/', {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async ({ profileData, files }: {
    profileData: any,
    files: Array<{ name: string, file: File | null }>
  }, thunkAPI) => {
    const data = new FormData();
    data.append("payload", JSON.stringify(profileData));
    files.map(file => {
      if (file.file) {
        data.append(file.name, file.file);
      }
    })
    try {
      const response = await axios.put('/api/user/profile/', data, {
        headers: headerWithToken()
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || 'An unknown error occurred');
    }
  }
);

// Async thunk for change password
export const changePassword = createAsyncThunk(
  'profile/changePassword',
  async ({ oldPassword, newPassword }: {
    oldPassword: string;
    newPassword: string
  }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/user/profile/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      return true;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as SerializedError;
      })
      .addCase(updateUserProfile.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as SerializedError;
      });
  },
});

export default profileSlice.reducer;
