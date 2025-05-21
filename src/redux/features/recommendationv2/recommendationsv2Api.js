import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../../../utils/baseQueryWithAuth";

export const recommendationsv2Api = createApi({
  reducerPath: "recommendationsv2Api",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    getCollaborativeRecommendations: builder.query({
      query: () => ({
        url: "/recommendationv2/collaborative",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetCollaborativeRecommendationsQuery } = recommendationsv2Api;