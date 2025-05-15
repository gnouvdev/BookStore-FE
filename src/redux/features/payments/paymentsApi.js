import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    getPaymentMethods: builder.query({
      query: () => "/payments",
      providesTags: ["Payment"],
    }),
    createVNPayUrl: builder.mutation({
      query: (data) => ({
        url: "/payments/vnpay/create",
        method: "POST",
        body: data,
      }),
    }),
    addPaymentMethod: builder.mutation({
      query: (data) => ({
        url: "/api/payments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    updatePaymentMethod: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    deletePaymentMethod: builder.mutation({
      query: (id) => ({
        url: `/api/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment"],
    }),
    verifyVNPayPayment: builder.mutation({
      query: (queryParams) => ({
        url: `/payments/vnpay/verify?${queryParams}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useCreateVNPayUrlMutation,
  useVerifyVNPayPaymentMutation,
} = paymentsApi;

export default paymentsApi;
