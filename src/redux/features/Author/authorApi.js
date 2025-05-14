import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const authorsApi = createApi({
  reducerPath: "authorsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Authors'],
  endpoints: (builder) => ({
    getAuthors: builder.query({
      query: () => "/authors",
      providesTags: ["Authors"]
    }),
    getAuthorById: builder.query({
      query: (id) => `/authors/${id}`,
      providesTags: (result, error, id) => [{ type: "Authors", id }]
    }),
    addAuthor: builder.mutation({
      query: (newAuthor) => ({
        url: "/authors/create",
        method: "POST",
        body: newAuthor,
      }),
      invalidatesTags: ["Authors"]
    }),
    updateAuthor: builder.mutation({
      query: ({ id, ...updatedAuthor }) => ({
        url: `/authors/${id}`,
        method: "PUT",
        body: updatedAuthor,
      }),
      invalidatesTags: ["Authors"]
    }),
    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Authors"]
    }),
  }),
});

export const {
  useGetAuthorsQuery,
  useGetAuthorByIdQuery,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorsApi;

export default authorsApi;