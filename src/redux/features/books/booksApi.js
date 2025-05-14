import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const booksApi = createApi({
    reducerPath: 'booksApi',
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrl,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Books'],
    endpoints: (builder) => ({
        getBooks: builder.query({
            query: () => "/books",
            providesTags: ["Books"]
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
                body: data
            }),
            invalidatesTags: ["Books"]
        }),
        updateBook: builder.mutation({
            query: ({id, ...data}) => ({
                url: `/books/edit/${id}`,
                method: "PUT",
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ["Books"]
        }),
        deleteBook: builder.mutation({
            query: (id) => ({
                url: `/books/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Books"]
        }),
    })
})

export const {
    useGetBooksQuery,
    useGetBookByIdQuery,
    useSearchBooksQuery,
    useAddBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation
} = booksApi;

export default booksApi;