import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const authorsApi = createApi({
  reducerPath: "authorsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Authors"],
  endpoints: (builder) => ({
    getAuthors: builder.query({
      query: () => "/authors",
      providesTags: ["Authors"],
    }),
    getAuthorById: builder.query({
      query: (id) => `/authors/${id}`,
      providesTags: ["Authors"],
    }),
    searchAuthors: builder.query({
      query: (name) => `/authors/search?name=${name}`,
      providesTags: ["Authors"],
    }),
    addAuthor: builder.mutation({
      query: (data) => ({
        url: "/authors/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Authors"],
    }),
    updateAuthor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/authors/edit/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Authors"],
    }),
    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Authors"],
    }),
  }),
});

export const {
  useGetAuthorsQuery,
  useGetAuthorByIdQuery,
  useSearchAuthorsQuery,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorsApi; 