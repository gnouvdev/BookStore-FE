import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "../../../services/wishlistService";

// Async thunks
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async () => {
    console.log("Fetching wishlist in thunk...");
    const wishlist = await wishlistService.getWishlist();
    console.log("Fetched wishlist in thunk:", wishlist);
    return wishlist;
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (book) => {
    console.log("Adding to wishlist in thunk:", book);
    await wishlistService.addToWishlist(book._id);
    return book;
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (bookId) => {
    console.log("Removing from wishlist in thunk:", bookId);
    await wishlistService.removeFromWishlist(bookId);
    return bookId;
  }
);

const initialState = {
  wishlistItems: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: (state) => {
      console.log("Clearing wishlist...");
      state.wishlistItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        console.log("Fetch wishlist pending...");
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        console.log("Fetch wishlist fulfilled:", action.payload);
        state.loading = false;
        state.wishlistItems = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        console.error("Fetch wishlist rejected:", action.error);
        state.loading = false;
        state.error = action.error.message;
      })
      // Add to wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        console.log("Add to wishlist fulfilled:", action.payload);
        const existingItem = state.wishlistItems.find(
          (item) => item._id === action.payload._id
        );
        if (!existingItem) {
          state.wishlistItems.push(action.payload);
        }
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        console.log("Remove from wishlist fulfilled:", action.payload);
        state.wishlistItems = state.wishlistItems.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
