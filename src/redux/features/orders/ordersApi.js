import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        console.log(
          "Setting Authorization header with token:",
          token.substring(0, 10) + "..."
        );
      } else {
        console.log("No token found in localStorage");
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
      query: (id) => ({
        url: `/orders/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log("Order details response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("Order details error:", response);
        return response;
      },
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
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: "PUT",
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
  useCancelOrderMutation,
} = ordersApi;

export default ordersApi;
