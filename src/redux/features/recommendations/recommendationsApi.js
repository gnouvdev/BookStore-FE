import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

const recommendationsApi = createApi({
  reducerPath: "recommendationsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Recommendation"],
  endpoints: (builder) => ({
    getRecommendations: builder.query({
      query: (bookId) => ({
        url: `/recommendations/${bookId}`,
        method: 'GET'
      }),
      providesTags: ["Recommendation"],
    }),
    getRecommendationById: builder.query({
      query: (id) => `/recommendations/${id}`,
      providesTags: ["Recommendation"],
    }),
    addRecommendation: builder.mutation({
      query: (data) => ({
        url: "/recommendations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Recommendation"],
    }),
    updateRecommendation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/recommendations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Recommendation"],
    }),
    deleteRecommendation: builder.mutation({
      query: (id) => ({
        url: `/recommendations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Recommendation"],
    }),
  }),
});

export const {
  useGetRecommendationsQuery,
  useGetRecommendationByIdQuery,
  useAddRecommendationMutation,
  useUpdateRecommendationMutation,
  useDeleteRecommendationMutation,
} = recommendationsApi;

export default recommendationsApi; 