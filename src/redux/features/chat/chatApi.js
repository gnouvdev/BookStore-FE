import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuth } from "firebase/auth";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: async (headers) => {
      try {
        // First try to get token from localStorage (for admin)
        const adminToken = localStorage.getItem("token");
        if (adminToken) {
          console.log("Using admin token from localStorage");
          headers.set("Authorization", `Bearer ${adminToken}`);
          return headers;
        }

        // If no admin token, try Firebase token
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          console.log("Using Firebase token for API request");
          headers.set("Authorization", `Bearer ${token}`);
        } else {
          console.log("No authentication token found");
        }
        return headers;
      } catch (error) {
        console.error("Error preparing headers:", error);
        return headers;
      }
    },
  }),
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (userId) => {
        console.log("Fetching chat history for user:", userId);
        return `/chat/history/${userId}`;
      },
      providesTags: (result, error, userId) => [{ type: "Chat", id: userId }],
    }),
    sendMessage: builder.mutation({
      query: (data) => {
        console.log("Sending message:", data);
        return {
          url: "/chat/send",
          method: "POST",
          body: data,
        };
      },
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
