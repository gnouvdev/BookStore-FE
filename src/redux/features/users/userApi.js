import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseUrl from "../../../utils/baseURL";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: "/users",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response) => {
        console.log("API Response:", response);
        return response?.users || [];
      },
      transformErrorResponse: (response) => {
        console.error("API Error:", response);
        return response;
      },
      providesTags: ["Users"],
    }),
    getCurrentUser: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    searchUsers: builder.query({
      query: (query) => `/users/search?query=${query}`,
      providesTags: ["Users"],
    }),
    getUserProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["Users"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/users/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useSearchUsersQuery,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCurrentUserQuery,
} = userApi;

export default userApi;
