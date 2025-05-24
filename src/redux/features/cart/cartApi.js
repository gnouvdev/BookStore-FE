import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      console.log("Sending token:", token); // Debug
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Cart"], // Định nghĩa tag cho giỏ hàng
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"], // Đánh dấu dữ liệu giỏ hàng
    }),
    addToCart: builder.mutation({
      query: ({ bookId, quantity }) => ({
        url: "/cart",
        method: "POST",
        body: { bookId, quantity },
      }),
      invalidatesTags: ["Cart"], // Làm mới giỏ hàng sau khi thêm
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"], // Làm mới giỏ hàng sau khi xóa
    }),
    removeFromCart: builder.mutation({
      query: (bookId) => ({
        url: `/cart/${bookId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"], // Làm mới giỏ hàng sau khi xóa item
    }),
    updateCartItemQuantity: builder.mutation({
      query: ({ bookId, quantity }) => ({
        url: `/cart/${bookId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useClearCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemQuantityMutation,
} = cartApi;
