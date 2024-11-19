import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import axios from 'axios';
import { getCurrencyBasedOnLocation } from '../../utils/helpers';

export interface Product {
  id: number;
  name: string;
  description: string;
  available: boolean;
  image?: string;
  images: ProductMedia[];
  packages: Package[];
  product_meta: { key: string; value: string; }[];
  domain: string;
}

export interface ProductMedia {
  id: number;
  image: string;
  title: string;
  description: string;
  order: number;
  product: number;
}

export interface Package {
  id: number;
  name: string;
  price: string;
  feature_list: object;
  order: number;
  created_at: string;
  updated_at: string;
  package_code: string;
  product: number;
  currency: string
}

interface ProductsState {
  products: Product[];
  productDetail: Product | null;
  loading: boolean;
  error: string | null;
  detailLoading: boolean;
  detailError: string | null;
}

const initialState: ProductsState = {
  products: [],
  productDetail: null,
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
};

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('/api/products/');
      return response.data.results;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

// Async thunk to fetch product details
export const fetchProductDetail = createAsyncThunk(
  'products/fetchProductDetail',
  async (productId: number, thunkAPI) => {
    try {
      const response = await axios.get(`/api/products/${productId}/`);
      return response.data;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

export const fetchProductDetailByName = createAsyncThunk(
  'products/fetchProductDetailByName',
  async (productName: string, thunkAPI) => {
    try {
      const currency = await getCurrencyBasedOnLocation();
      const response = await axios.get(`/api/products/${productName}/`, {
        params: { currency },
      });
      return response.data;
    } catch (error: any) {
      const errorData = error.response.data;
      return thunkAPI.rejectWithValue(errorData);
    }
  }
);

const handlePending = (state: ProductsState, action: PayloadAction<any>) => {
  if (action.type === fetchProducts.pending.type) {
    state.loading = true;
    state.error = null;
  } else {
    state.detailLoading = true;
    state.detailError = null;
  }
};

const handleFulfilled = (state: ProductsState, action: PayloadAction<any>) => {
  if (action.type === fetchProducts.fulfilled.type) {
    state.loading = false;
    state.products = action.payload;
  } else {
    state.detailLoading = false;
    state.productDetail = action.payload;
  }
};

const handleRejected = (state: ProductsState, action: PayloadAction<any>) => {
  if (action.type === fetchProducts.rejected.type) {
    state.loading = false;
    state.error = action.payload as string;
  } else {
    state.detailLoading = false;
    state.detailError = action.payload as string;
  }
};


const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetail: (state) => {
      state.productDetail = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    const actions = [
      fetchProducts,
      fetchProductDetail,
      fetchProductDetailByName
    ];

    actions.forEach(action => {
      builder.addCase(action.pending, handlePending);
      builder.addCase(action.fulfilled, handleFulfilled);
      builder.addCase(action.rejected, handleRejected);
    });
  },
});

export const { clearProductDetail } = productsSlice.actions;
export default productsSlice.reducer;
