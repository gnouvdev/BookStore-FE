import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { booksApi } from "./features/books/booksApi";
import { ordersApi } from "./features/orders/ordersApi";
import { authorsApi } from "./features/authors/authorsApi";
import { categoriesApi } from "./features/categories/categoriesApi";
import { usersApi } from "./features/users/usersApi_ko";
import authReducer from "./features/auth/authSlice";
import cartReducer from "./features/cart/cartSlice";
import { userApi } from "./features/users/userApi";
import recommendationsApi from "./features/recommendations/recommendationsApi";
import wishlistReducer from './features/wishlist/wishlistSlice';
import paymentsApi from "./features/payments/paymentsApi";
import { cartApi } from './features/cart/cartApi';
import { reviewsApi } from './features/reviews/reviewsApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [authorsApi.reducerPath]: authorsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [recommendationsApi.reducerPath]: recommendationsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      booksApi.middleware,
      ordersApi.middleware,
      authorsApi.middleware,
      categoriesApi.middleware,
      usersApi.middleware,
      userApi.middleware,
      recommendationsApi.middleware,
      paymentsApi.middleware,
      cartApi.middleware,
      reviewsApi.middleware
    ),
});

setupListeners(store.dispatch);
