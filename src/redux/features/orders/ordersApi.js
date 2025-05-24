import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (email) => `/orders/email/${email}`,
      providesTags: ["Orders"],
    }),
    getAllOrders: builder.query({
      query: () => `/orders`,
      transformResponse: (response) => {
        console.log("API Response:", response);
        // Handle both possible response structures
        if (response?.data) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      transformErrorResponse: (response) => {
        console.error("API Error:", response);
        return response;
      },
      providesTags: ["Orders"],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),
    createOrder: builder.mutation({
      query: (newOrder) => {
        console.log("Creating order with data:", newOrder);
        return {
          url: "/orders",
          method: "POST",
          body: newOrder,
        };
      },
      transformErrorResponse: (response) => {
        console.error("Order creation error:", response);
        return response;
      },
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;

export default ordersApi;
