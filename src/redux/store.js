import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import booksApi from "./features/books/booksApi";
import ordersApi from "./features/orders/ordersApi";
import { categoriesApi } from "./features/categories/categoriesApi";
import { authorsApi } from "./features/Author/authorApi";
import { usersApi } from "./features/users/userApi";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [authorsApi.reducerPath]: authorsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      booksApi.middleware,
      ordersApi.middleware,
      categoriesApi.middleware,
      authorsApi.middleware,
      usersApi.middleware
    ),
});
