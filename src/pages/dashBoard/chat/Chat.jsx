/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../../context/SocketContext";
import {
  useGetChatHistoryQuery,
  useSendMessageMutation,
  useGetChatUsersQuery,
} from "../../../redux/features/chat/chatApi";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FaPaperPlane, FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ChatContent = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const token = localStorage.getItem("token");

  const { data: chatUsersData, isLoading: isLoadingUsers } =
    useGetChatUsersQuery();
  const { data: chatHistory, refetch: refetchChatHistory } =
    useGetChatHistoryQuery(selectedUser?._id, {
      skip: !selectedUser,
    });
  const [sendMessage] = useSendMessageMutation();

  const chatUsers = chatUsersData?.data || [];

  // Debug log để kiểm tra dữ liệu
  useEffect(() => {
    console.log("Chat Users Data:", chatUsersData);
    console.log("Selected User:", selectedUser);
    console.log("Token:", token);
  }, [chatUsersData, selectedUser, token]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Handle socket events
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !token) {
      console.error("Cannot send message:", {
        message: message.trim(),
        selectedUser,
        token,
      });
      return;
    }

    try {
      await sendMessage({
        receiverId: selectedUser._id,
        message: message.trim(),
      }).unwrap();
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600">
              Vui lòng đăng nhập để sử dụng tính năng chat
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* User List */}
            <div className="w-1/3 border-r border-gray-200">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Danh sách chat
                </h2>
              </div>
              <div className="overflow-y-auto h-full">
                {isLoadingUsers ? (
                  <div className="p-4 text-center text-gray-500">
                    Đang tải...
                  </div>
                ) : chatUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  chatUsers.map((chatUser) => (
                    <button
                      key={chatUser._id}
                      onClick={() => setSelectedUser(chatUser)}
                      className={`w-full p-4 text-left hover:bg-gray-50 ${
                        selectedUser?._id === chatUser._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
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
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Chat với{" "}
                      {selectedUser.fullName ||
                        selectedUser.email ||
                        "Người dùng"}
                    </h3>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {chatHistory?.data?.map((msg) => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${
                            msg.senderRole === "admin"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.senderRole === "admin"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={`text-xs mt-1 ${
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
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-gray-200 bg-white"
                  >
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!message.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FaUser className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Chọn người dùng để bắt đầu chat
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  return <ChatContent />;
};

export default Chat;
