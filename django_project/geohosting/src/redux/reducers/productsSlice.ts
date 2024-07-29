import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Product {
  id: number;
  name: string;
  description: string;
  available: boolean;
  image?: string;
  images: ProductMedia[];
  packages: Package[];
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

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fetchProducts actions
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Handle fetchProductDetail actions
    builder.addCase(fetchProductDetail.pending, (state) => {
      state.detailLoading = true;
      state.detailError = null;
    });
    builder.addCase(fetchProductDetail.fulfilled, (state, action) => {
      state.detailLoading = false;
      state.productDetail = action.payload;
    });
    builder.addCase(fetchProductDetail.rejected, (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload as string;
    });
  },
});

export default productsSlice.reducer;
