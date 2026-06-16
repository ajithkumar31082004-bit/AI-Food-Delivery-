import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const addToCart = createAsyncThunk('cart/add', async ({ foodItemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/cart/add', { foodItemId, quantity });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add item');
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ foodItemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/cart/update', { foodItemId, quantity });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (foodItemId, { rejectWithValue }) => {
  try {
    const { data } = await API.delete(`/cart/remove/${foodItemId}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], restaurantName: null, loading: false, error: null },
  reducers: {
    clearCartError(state) { state.error = null; }
  },
  extraReducers: (builder) => {
    const handleCart = (s, action) => {
      s.loading = false;
      s.items = action.payload.items || [];
      s.restaurantName = s.items[0]?.restaurantName || null;
    };
    builder
      .addCase(fetchCart.pending, (s) => { s.loading = true; })
      .addCase(fetchCart.fulfilled, handleCart)
      .addCase(addToCart.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addToCart.fulfilled, handleCart)
      .addCase(addToCart.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateCartItem.fulfilled, handleCart)
      .addCase(removeFromCart.fulfilled, handleCart);
  }
});

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
