/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  MessageCircle,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "../../../context/SocketContext";
import {
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useGetChatUsersQuery,
} from "../../../redux/features/chat/chatApi";

const ChatContent = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const userListRef = useRef(null);
  const socket = useSocket();

  // Lấy thông tin admin từ localStorage
  const adminUser = JSON.parse(localStorage.getItem("user") || "{}");
  const adminToken = localStorage.getItem("token");

  // Debug logs
  useEffect(() => {
    console.log("Admin chat - Admin user:", adminUser);
  }, [adminUser]);

  // Fetch chat users with token
  const {
    data: chatUsersData,
    isLoading: isLoadingUsers,
    error: chatUsersError,
  } = useGetChatUsersQuery(undefined, {
    skip: !adminToken,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (chatUsersError) {
      console.error("Error fetching chat users:", chatUsersError);
    }
  }, [chatUsersError]);

  const chatUsers = chatUsersData?.data || [];

  // Fetch chat history when a user is selected
  const {
    data: chatHistoryData,
    refetch: refetchChatHistory,
    error: chatHistoryError,
  } = useGetChatHistoryQuery(selectedUser?._id, {
    skip: !selectedUser || !adminToken,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (chatHistoryError) {
      console.error("Error fetching chat history:", chatHistoryError);
    }
  }, [chatHistoryError]);

  const chatHistory = chatHistoryData?.data || [];

  // Send message mutation
  const [sendMessage, { error: sendMessageError }] = useSendMessageMutation();

  useEffect(() => {
    if (sendMessageError) {
      console.error("Error sending message:", sendMessageError);
    }
  }, [sendMessageError]);

  // Filter users based on search query
  const filteredUsers = chatUsers.filter((user) =>
    (user.fullName || user.email || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Handle socket events for real-time messages
  useEffect(() => {
    if (!socket || !selectedUser) return;

    socket.emit("joinChat", selectedUser._id);

    const handleNewMessage = (data) => {
      if (
        data.message.senderId === selectedUser._id ||
        data.message.receiverId === selectedUser._id
      ) {
        refetchChatHistory();
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveChat", selectedUser._id);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, refetchChatHistory]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !adminToken) {
      console.error("Cannot send message:", {
        message: message.trim(),
        selectedUser,
        adminToken: !!adminToken,
      });
      return;
    }

    try {
      const result = await sendMessage({
        receiverId: selectedUser._id,
        message: message.trim(),
      }).unwrap();

      console.log("Message sent successfully:", result);
      setMessage("");
      await refetchChatHistory();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  if (!adminToken || adminUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vui lòng đăng nhập để tiếp tục
          </h2>
          <p className="text-gray-500">
            Bạn cần đăng nhập với tài khoản admin để sử dụng tính năng này
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={chatContainerRef}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex h-[700px]">
            {/* User List Sidebar */}
            <div className="w-80 border-r border-gray-200/50 bg-gray-50/50">
              {/* Header */}
              <div className="p-6 border-b border-gray-200/50 bg-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-blue-500" />
                    Tin nhắn
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700"
                  >
                    {filteredUsers.length}
                  </Badge>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 border-gray-200/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* User List */}
              <ScrollArea className="h-[calc(100%-140px)]">
                <div ref={userListRef} className="p-2">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">
                        {searchQuery
                          ? "Không tìm thấy cuộc trò chuyện"
                          : "Chưa có cuộc trò chuyện nào"}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((chatUser, index) => (
                      <motion.div
                        key={chatUser._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => handleUserSelect(chatUser)}
                          className={`w-full p-4 h-auto justify-start mb-2 rounded-xl transition-all duration-200 ${
                            selectedUser?._id === chatUser._id
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3 w-full">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage
                                  src={chatUser.avatar || "/placeholder.svg"}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                                  {(chatUser.fullName || chatUser.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="font-medium text-gray-900 truncate">
                                {chatUser.fullName ||
                                  chatUser.email ||
                                  "Người dùng"}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {chatUser.lastMessage?.message ||
                                  "Chưa có tin nhắn"}
                              </p>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={selectedUser.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                            {(
                              selectedUser.fullName ||
                              selectedUser.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedUser.fullName ||
                              selectedUser.email ||
                              "Người dùng"}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4 chat-messages">
                    <div className="space-y-4">
                      {chatHistory.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <p className="text-gray-500">Chưa có tin nhắn nào</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {chatHistory.map((msg) => (
                            <motion.div
                              key={msg._id}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -20, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              className={`flex ${
                                msg.senderRole === "admin"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                                  msg.senderRole === "admin"
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900 border border-gray-200"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {msg.message}
                                </p>
                                <p
                                  className={`text-xs mt-2 ${
                                    msg.senderRole === "admin"
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {format(new Date(msg.createdAt), "HH:mm", {
                                    locale: vi,
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-end space-x-3"
                    >
                      <div className="flex-1 relative">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Nhập tin nhắn..."
                          className="pr-20 py-3 rounded-2xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={!message.trim()}
                        className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chọn cuộc trò chuyện
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                      Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
                      nhắn tin
                    </p>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Chat = () => {
  return <ChatContent />;
};

export default Chat;
