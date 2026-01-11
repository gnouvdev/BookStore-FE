import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../../../utils/baseQueryWithAuth";

export const recommendationsv2Api = createApi({
  reducerPath: "recommendationsv2Api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["CollaborativeRecommendations", "ContextualRecommendations"],
  endpoints: (builder) => ({
    getCollaborativeRecommendations: builder.query({
      query: () => ({
        url: "/api/recommendationv2/collaborative",
        method: "GET",
      }),
      providesTags: ["CollaborativeRecommendations"],
    }),
    getContextualRecommendations: builder.query({
      query: () => ({
        url: "/api/recommendationv2/contextual",
        method: "GET",
      }),
      providesTags: ["ContextualRecommendations"],
    }),
  }),
});

export const {
  useGetCollaborativeRecommendationsQuery,
  useGetContextualRecommendationsQuery,
} = recommendationsv2Api;
