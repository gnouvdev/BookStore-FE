import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuth } from "firebase/auth";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: async (headers) => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
          return headers;
        }

        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
      } catch (error) {
        console.error("Error preparing chat headers:", error);
        return headers;
      }
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
