import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSearchSuggestions: builder.query({
      query: (query) => ({
        url: `/books/search/suggestions?query=${encodeURIComponent(query)}`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),
    searchBooks: builder.query({
      query: ({ query, type }) => ({
        url: `/books/search?query=${encodeURIComponent(query)}&type=${
          type || ""
        }`,
        method: "GET",
      }),
      keepUnusedDataFor: 60,
    }),
    getSearchHistory: builder.query({
      query: () => ({
        url: "/searchHistory",
        method: "GET",
      }),
      providesTags: ["SearchHistory"],
    }),
    addSearchHistory: builder.mutation({
      query: (data) => ({
        url: "/searchHistory",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SearchHistory"],
    }),
    deleteSearchHistory: builder.mutation({
      query: (id) => ({
        url: `/searchHistory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SearchHistory"],
    }),
  }),
});

export const {
  useGetSearchSuggestionsQuery,
  useSearchBooksQuery,
  useGetSearchHistoryQuery,
  useAddSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
} = searchApi;
