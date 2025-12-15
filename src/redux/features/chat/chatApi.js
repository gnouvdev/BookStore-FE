import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuth } from "firebase/auth";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: async (headers) => {
      try {
        // Ưu tiên Firebase token cho user (không phải admin)
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          console.log("Using Firebase token for API request");
          headers.set("Authorization", `Bearer ${token}`);
          return headers;
        }

        // Chỉ dùng admin token nếu không có Firebase user (admin login)
        const adminToken = localStorage.getItem("token");
        if (adminToken) {
          console.log("Using admin token from localStorage (no Firebase user)");
          headers.set("Authorization", `Bearer ${adminToken}`);
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
      providesTags: (result, error, userId) => [
        { type: "Chat", id: userId },
        { type: "Chat", id: "chatbot" }, // Thêm chatbot tag để invalidate khi cần
      ],
      // Force refetch mỗi lần, không cache
      keepUnusedDataFor: 0,
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
        { type: "Chat", id: "chatbot" }, // Invalidate chatbot tag nếu gửi đến chatbot
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
