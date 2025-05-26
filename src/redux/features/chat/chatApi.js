import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (userId) => `/chat/history/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Chat", id: userId }],
    }),
    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/chat/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { receiverId }) => [
        { type: "Chat", id: receiverId },
      ],
    }),
    getChatUsers: builder.query({
      query: () => "/chat/users",
      providesTags: ["Chat"],
    }),
  }),
});

export const {
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useGetChatUsersQuery,
} = chatApi;
