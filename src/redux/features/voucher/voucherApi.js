import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const voucherApi = createApi({
  reducerPath: "voucherApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api/vouchers`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Voucher"],
  endpoints: (builder) => ({
    validateVoucher: builder.mutation({
      query: (data) => ({
        url: "/validate",
        method: "POST",
        body: data,
      }),
    }),
    applyVoucher: builder.mutation({
      query: (data) => ({
        url: "/apply",
        method: "POST",
        body: data,
      }),
    }),
    getAllVouchers: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Voucher"],
    }),
    updateVoucher: builder.mutation({
      query: ({ voucherId, ...data }) => ({
        url: `/${voucherId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Voucher"],
    }),
    deleteVoucher: builder.mutation({
      query: (voucherId) => ({
        url: `/${voucherId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Voucher"],
    }),
    createVoucher: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Voucher"],
    }),
  }),
});

export const {
  useValidateVoucherMutation,
  useApplyVoucherMutation,
  useGetAllVouchersQuery,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useCreateVoucherMutation,
} = voucherApi;
