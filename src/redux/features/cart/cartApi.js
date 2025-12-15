import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      // Lấy token từ localStorage hoặc Firebase
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        // Nếu không có token trong localStorage, thử lấy từ Firebase
        // (sẽ được xử lý trong component nếu cần)
      }
      return headers;
    },
  }),
  tagTypes: ["Cart"], // Định nghĩa tag cho giỏ hàng
  endpoints: (builder) => ({
    getCart: builder.query({
      // eslint-disable-next-line no-unused-vars
      query: (userId) => {
        // Sử dụng userId trong query để cache riêng biệt cho mỗi user
        return "/cart";
      },
      // eslint-disable-next-line no-unused-vars
      providesTags: (result, error, userId) => [
        { type: "Cart", id: userId || "default" },
      ], // Đánh dấu dữ liệu giỏ hàng với user ID
      keepUnusedDataFor: 0, // Không giữ cache khi không sử dụng
      refetchOnMountOrArgChange: true, // Force refetch khi mount hoặc arg thay đổi
    }),
    addToCart: builder.mutation({
      query: ({ bookId, quantity }) => ({
        url: "/cart",
        method: "POST",
        body: { bookId, quantity },
      }),
      // eslint-disable-next-line no-unused-vars
      invalidatesTags: (result, error, arg, meta) => {
        // Invalidate tất cả cart tags để đảm bảo refetch
        return [{ type: "Cart" }];
      },
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/cart",
        method: "DELETE",
      }),
      // eslint-disable-next-line no-unused-vars
      invalidatesTags: (result, error, arg, meta) => {
        // Invalidate tất cả cart tags
        return [{ type: "Cart" }];
      },
    }),
    removeFromCart: builder.mutation({
      query: (bookId) => ({
        url: `/cart/${bookId}`,
        method: "DELETE",
      }),
      // eslint-disable-next-line no-unused-vars
      invalidatesTags: (result, error, arg, meta) => {
        // Invalidate tất cả cart tags
        return [{ type: "Cart" }];
      },
    }),
    updateCartItemQuantity: builder.mutation({
      query: ({ bookId, quantity }) => ({
        url: `/cart/${bookId}`,
        method: "PATCH",
        body: { quantity },
      }),
      // eslint-disable-next-line no-unused-vars
      invalidatesTags: (result, error, arg, meta) => {
        // Invalidate tất cả cart tags
        return [{ type: "Cart" }];
      },
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
