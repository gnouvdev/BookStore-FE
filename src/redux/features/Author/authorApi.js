import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authorsApi = createApi({
  reducerPath: "authorsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000/api" }), // Thay đổi URL nếu cần
  endpoints: (builder) => ({
    fetchAllAuthors: builder.query({
      query: () => "/authors",
    }),
    fetchAuthorById: builder.query({
      query: (id) => `/authors/${id}`,
    }),
    addAuthor: builder.mutation({
      query: (newAuthor) => ({
        url: "/authors/create",
        method: "POST",
        body: newAuthor,
      }),
    }),
    updateAuthor: builder.mutation({
      query: ({ id, ...updatedAuthor }) => ({
        url: `/authors/${id}`,
        method: "PUT",
        body: updatedAuthor,
      }),
    }),
    deleteAuthor: builder.mutation({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useFetchAllAuthorsQuery,
  useFetchAuthorByIdQuery,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorsApi;