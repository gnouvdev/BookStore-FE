import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";

const initialState = {
  cartItems: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cartItems = action.payload.data.items.map((item) => ({
        bookId: item.book._id,
        title: item.book.title,
        coverImage: item.book.coverImage,
        price: item.price,
        quantity: item.quantity,
      }));
      state.totalAmount = action.payload.data.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.includes("cartApi/executeQuery/fulfilled"),
        (state, action) => {
          if (action.meta.arg.endpointName === "getCart") {
            const cart = action.payload.data;
            state.cartItems = cart.items.map((item) => ({
              bookId: item.book._id,
              title: item.book.title,
              coverImage: item.book.coverImage,
              price: item.price,
              quantity: item.quantity,
            }));
            state.totalAmount = cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
          }
        }
      )
      .addMatcher(
        (action) => action.type.includes("cartApi/executeMutation/fulfilled"),
        (state, action) => {
          const cart = action.payload.data;

          if (action.meta.arg.endpointName === "addToCart") {
            // Lưu lại cartItems cũ trước khi cập nhật
            const prevCartItems = [...state.cartItems];
            const addedBookId = action.meta.arg.originalArgs.bookId;
            const prevItem = prevCartItems.find(
              (item) => item.bookId === addedBookId
            );

            state.cartItems = cart.items.map((item) => ({
              bookId: item.book._id,
              title: item.book.title,
              coverImage: item.book.coverImage,
              price: item.price,
              quantity: item.quantity,
            }));
            state.totalAmount = cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            const addedItem = cart.items.find(
              (item) => item.book._id === addedBookId
            );
            const prevQuantity = prevItem ? prevItem.quantity : 0;
            const newQuantity = addedItem ? addedItem.quantity : 0;

            if (prevQuantity > 0 && newQuantity > prevQuantity) {
              toast.success("Increased Quantity in Cart", {
                duration: 1000,
                position: "top-center",
              });
            } else {
              toast.success("Product Added to Cart", {
                duration: 1000,
                position: "top-center",
              });
            }
          }
          if (
            action.meta.arg.endpointName === "removeFromCart" ||
            action.meta.arg.endpointName === "clearCart" ||
            action.meta.arg.endpointName === "updateCartItemQuantity"
          ) {
            state.cartItems = cart.items.map((item) => ({
              bookId: item.book._id,
              title: item.book.title,
              coverImage: item.book.coverImage,
              price: item.price,
              quantity: item.quantity,
            }));
            state.totalAmount = cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
          }
        }
      );
  },
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
