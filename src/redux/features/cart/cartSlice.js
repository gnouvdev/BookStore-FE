import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

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
            Swal.fire({
              position: "center",
              icon: "success",
              title: cart.items.some((item) => item.quantity > 1)
                ? "Increased Quantity in Cart"
                : "Product Added to Cart",
              showConfirmButton: false,
              timer: 1000,
            });
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
