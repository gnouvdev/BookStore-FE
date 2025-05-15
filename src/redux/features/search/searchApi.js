import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const searchApi = createApi({
  reducerPath: "searchApi",
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
  }),
});

export const { useGetSearchSuggestionsQuery, useSearchBooksQuery } = searchApi;
