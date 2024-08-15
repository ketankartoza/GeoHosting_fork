import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface ResetPasswordError {
  error: string;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post('/api/auth/login/', { email, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('email', response.data.email);
      return token;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

// Async thunk for password reset
export const resetPassword = createAsyncThunk(
  'auth/reset-password',
  async (email: string, thunkAPI) => {
    try {
      await axios.post('/api/auth/reset-password/', { email });
      return true;
    } catch (error: any) {
      const errorData = error.response?.data || { message: 'An unknown error occurred' };
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

// Async thunk for confirm reset password
export const confirmResetPassword = createAsyncThunk<
  ResetPasswordResponse,
  ResetPasswordPayload,
  { rejectValue: ResetPasswordError }
>(
  'auth/password-reset-confirm',
  async (payload, thunkAPI) => {
    const { token, new_password } = payload;
    try {
      const response = await axios.post<ResetPasswordResponse>('/api/auth/password-reset-confirm/', { token, new_password });
      return response.data;
    } catch (error: any) {
      const errorData: ResetPasswordError = error.response?.data || { error: 'An unknown error occurred' };
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);


// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('/api/auth/logout/', {}, {
          headers: { Authorization: `Token ${token}` }
        });
        localStorage.removeItem('token');
        return true;
      } catch (error: any) {
        const errorData = error.response.data;
        localStorage.removeItem('token');
        return thunkAPI.rejectWithValue(errorData);
      }
    }
  }
);

// Async thunk for register
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }, thunkAPI) => {
    try {
      const response = await axios.post('/api/auth/register/', { email, password, first_name: firstName, last_name: lastName });
      const token = response.data.token;
      localStorage.setItem('token', token);
      return token;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: (state) => {
      state.token = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.token = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAuthState } = authSlice.actions;

export default authSlice.reducer;
