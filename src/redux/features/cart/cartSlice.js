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
      state.cartItems = action.payload.items;
      state.totalAmount = action.payload.totalAmount;
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
            state.cartItems = action.payload.items;
            state.totalAmount = action.payload.totalAmount;
          }
        }
      )
      .addMatcher(
        (action) => action.type.includes("cartApi/executeMutation/fulfilled"),
        (state, action) => {
          if (action.meta.arg.endpointName === "addToCart") {
            state.cartItems = action.payload.cart.items.map((item) => ({
              bookId: item.bookId._id,
              title: item.bookId.title,
              coverImage: item.bookId.coverImage,
              price: item.price,
              quantity: item.quantity,
            }));
            state.totalAmount = action.payload.cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
            Swal.fire({
              position: "center",
              icon: "success",
              title: action.payload.cart.items.some(
                (item) => item.quantity > 1
              )
                ? "Increased Quantity in Cart"
                : "Product Added to Cart",
              showConfirmButton: false,
              timer: 1000,
            });
          }
          if (action.meta.arg.endpointName === "removeFromCart") {
            state.cartItems = action.payload.cart.items.map((item) => ({
              bookId: item.bookId._id,
              title: item.bookId.title,
              coverImage: item.bookId.coverImage,
              price: item.price,
              quantity: item.quantity,
            }));
            state.totalAmount = action.payload.cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
          }
          if (action.meta.arg.endpointName === "updateCartItemQuantity") {
            state.cartItems = action.payload.cart.items.map((item) => ({
              bookId: item.bookId._id,
              title: item.bookId.title,
              coverImage: item.bookId.coverImage,
              price: item.price,
              quantity: item.quantity,
            }));
            state.totalAmount = action.payload.cart.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );
          }
          if (action.meta.arg.endpointName === "clearCart") {
            state.cartItems = [];
            state.totalAmount = 0;
          }
        }
      );
  },
});

export const { setCart, clearCart, updateCartItemQuantity, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;