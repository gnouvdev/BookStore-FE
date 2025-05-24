import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Books"],
  endpoints: (builder) => ({
    getBooks: builder.query({
      query: () => "/books",
      providesTags: ["Books"],
    }),
    getBooksByAuthor: builder.query({
      query: (authorId) => `/books/author/${authorId}`,
      providesTags: (result, error, authorId) => [{ type: "Books", authorId }],
    }),
    getBooksByCategory: builder.query({
      query: (categoryId) => `/books/category/${categoryId}`,
      providesTags: (result, error, categoryId) => [
        { type: "Books", categoryId },
      ],
    }),
    getBookById: builder.query({
      query: (id) => `/books/${id}`,
      providesTags: (result, error, id) => [{ type: "Books", id }],
    }),
    searchBooks: builder.query({
      query: (title) => `/books/search?title=${title}`,
      providesTags: ["Books"],
    }),
    addBook: builder.mutation({
      query: (data) => ({
        url: "/books/create-book",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Books"],
    }),
    updateBook: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/books/edit/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Books"],
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/books/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Books"],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBooksByAuthorQuery,
  useGetBooksByCategoryQuery,
  useGetBookByIdQuery,
  useSearchBooksQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
} = booksApi;

export default booksApi;
