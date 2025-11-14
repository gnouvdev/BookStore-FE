/* eslint-disable no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageCircle,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Circle,
  Smile,
  Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import {
  useGetChatHistoryQuery,
  useSendMessageMutation,
} from "../redux/features/chat/chatApi";
import { toast } from "react-hot-toast";
import { FaPaperPlane, FaUser, FaTimes, FaComments } from "react-icons/fa";
import { auth } from "../firebase/firebase.config";
import ChatBookCard from "./ChatBookCard";

// Animation variants
const buttonVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 1,
    },
  },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

const chatBoxVariants = {
  hidden: { scale: 0, opacity: 0, y: 50 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    y: 50,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

const welcomeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
};

const ChatBox = () => {
  const { currentUser } = useAuth();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [message, setMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const buttonRef = useRef(null);
  const [adminId, setAdminId] = useState(null);
  const [chatMode, setChatMode] = useState("bot"); // "bot" hoặc "admin"

  console.log("ChatBox render:", {
    currentUser,
    isOpen,
    socket: !!socket,
  });

  // Debug logs
  useEffect(() => {
    console.log("Current user context:", currentUser);
    console.log("Admin ID state:", adminId);
  }, [currentUser, adminId]);

  // Lấy lịch sử chat với admin hoặc bot
  const chatTargetId = chatMode === "bot" ? "chatbot" : adminId;
  const {
    data: chatHistoryData,
    isLoading: isLoadingHistory,
    error: chatHistoryError,
    refetch: refetchChatHistory,
  } = useGetChatHistoryQuery(chatTargetId, {
    skip: !chatTargetId || !currentUser?.uid,
    refetchOnMountOrArgChange: true,
  });

  // Reload chat history khi chuyển đổi giữa bot và admin
  useEffect(() => {
    if (isOpen && chatTargetId && currentUser?.uid) {
      refetchChatHistory();
    }
  }, [chatMode, isOpen, chatTargetId, currentUser?.uid, refetchChatHistory]);

  // Debug log cho chat history
  useEffect(() => {
    console.log("Chat history data:", chatHistoryData);
  }, [chatHistoryData]);

  // Debug log cho lỗi gửi tin nhắn
  const [sendMessage, { error: sendMessageError, isLoading: isSending }] =
    useSendMessageMutation();
  useEffect(() => {
    if (sendMessageError) {
      console.error("Send message error details:", sendMessageError);
    }
  }, [sendMessageError]);

  // Lấy admin ID khi component mount
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        if (!currentUser?.uid) {
          console.log("No current user, skipping admin fetch");
          return;
        }

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          console.error("No Firebase user found");
          return;
        }

        const token = await firebaseUser.getIdToken();
        if (!token) {
          console.error("No token available");
          return;
        }

        console.log(
          "Fetching admin with token:",
          token.substring(0, 10) + "..."
        );

        const response = await fetch("http://localhost:5000/api/users/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Admin API response:", data);

        if (data.data && data.data.firebaseId) {
          console.log("Setting admin ID:", data.data.firebaseId);
          setAdminId(data.data.firebaseId);
        } else {
          console.error("Admin data missing firebaseId:", data.data);
        }
      } catch (error) {
        console.error("Error fetching admin ID:", error);
      }
    };

    fetchAdminId();
  }, [currentUser]);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && chatHistoryData?.data) {
      scrollToBottom();
    }
  }, [chatHistoryData, isOpen]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !isOpen || !chatTargetId || !currentUser?.uid) return;

    const userRoom = `chat:${currentUser.uid}`;
    console.log("Joining chat room:", userRoom);

    socket.emit("joinChat", userRoom, (response) => {
      console.log("Join chat room response:", response);
    });

    const handleNewMessage = (data) => {
      console.log("New message received:", data);
      if (data.message) {
        // Kiểm tra xem tin nhắn có liên quan đến chat hiện tại không
        const message = data.message;
        console.log("Message books:", message.books);
        const isRelevant =
          (chatMode === "bot" &&
            (message.senderId === "chatbot" ||
              message.receiverId === "chatbot")) ||
          (chatMode === "admin" &&
            (message.senderId === adminId || message.receiverId === adminId));

        if (isRelevant && chatTargetId) {
          refetchChatHistory();
        }
        if (!isOpen) {
          setIsMinimized(true);
        }
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      console.log("Leaving chat room:", userRoom);
      socket.emit("leaveChat", userRoom);
      socket.off("newMessage", handleNewMessage);
    };
  }, [
    socket,
    isOpen,
    chatTargetId,
    currentUser?.uid,
    refetchChatHistory,
    chatMode,
    adminId,
  ]);

  // Simulate typing indicator
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const receiverId = chatMode === "bot" ? "chatbot" : adminId;
    if (!message.trim() || !receiverId || !currentUser?.uid) {
      console.error("Cannot send message:", {
        message: message.trim(),
        receiverId,
        userId: currentUser?.uid,
      });
      return;
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error("No Firebase user found");
      }

      const token = await firebaseUser.getIdToken();
      if (!token) {
        throw new Error("No token available");
      }

      const messageData = {
        receiverId: receiverId,
        message: message.trim(),
      };

      console.log(
        "Sending message with token:",
        token.substring(0, 10) + "..."
      );
      const result = await sendMessage(messageData).unwrap();
      console.log("Message sent successfully:", result);

      setMessage("");
      if (chatTargetId) {
        await refetchChatHistory();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleOpen = async () => {
    console.log("Opening chat box");
    setIsOpen(true);
    setIsMinimized(false);

    if (chatTargetId && currentUser?.uid) {
      try {
        await refetchChatHistory();
        console.log("Chat history refetched after opening");
      } catch (error) {
        console.error("Error refetching chat history:", error);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMaximized(false);
  };

  const handleToggleSize = () => {
    setIsMaximized(!isMaximized);
  };

  if (!currentUser?.uid) {
    return null; // Không hiển thị chat box nếu chưa đăng nhập
  }

  return (
    <>
      {/* Chat Button */}
      <motion.div
        ref={buttonRef}
        className="fixed bottom-6 right-6 z-50"
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          onClick={handleOpen}
          className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-2xl border-4 border-white"
        >
          <FaComments className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatBoxRef}
            variants={chatBoxVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm ${
              isMaximized
                ? "inset-4 w-auto h-auto"
                : "bottom-24 right-6 w-96 h-[500px]"
            } ${isMinimized ? "h-16" : ""}`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 border-2 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {chatMode === "bot" ? "🤖" : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {chatMode === "bot" ? "Chatbot AI" : "Admin Support"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-blue-100">
                      <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                      {chatMode === "bot"
                        ? "Luôn sẵn sàng"
                        : isTyping
                        ? "Đang nhập..."
                        : "Trực tuyến"}
                    </div>
                  </div>
                </div>
                {/* Toggle between bot and admin */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setChatMode(chatMode === "bot" ? "admin" : "bot");
                    }}
                    className="text-white hover:bg-white/20 text-xs px-2 py-1 h-auto"
                    title={
                      chatMode === "bot"
                        ? "Chuyển sang Admin"
                        : "Chuyển sang Bot"
                    }
                  >
                    {chatMode === "bot" ? "👤" : "🤖"}
                  </Button>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0 rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleSize}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0 rounded-full"
                    >
                      {isMaximized ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea
                  className={`bg-gray-50/50 ${
                    isMaximized ? "h-[calc(100%-140px)]" : "h-80"
                  }`}
                >
                  <div className="p-4 space-y-4">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : chatHistoryError ? (
                      <div className="text-center py-8 text-red-500">
                        <p>Không thể tải tin nhắn. Vui lòng thử lại sau.</p>
                        <Button
                          variant="ghost"
                          onClick={() => refetchChatHistory()}
                          className="mt-2"
                        >
                          Thử lại
                        </Button>
                      </div>
                    ) : !chatHistoryData?.data ||
                      chatHistoryData.data.length === 0 ? (
                      <motion.div
                        variants={welcomeVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-8"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Chào mừng!
                        </h4>
                        <p className="text-sm text-gray-500">
                          {chatMode === "bot"
                            ? "Hãy gửi tin nhắn để bắt đầu trò chuyện với chatbot AI. Tôi có thể giúp bạn tìm sách, tư vấn sách phù hợp, hoặc trả lời các câu hỏi!"
                            : "Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện với admin"}
                        </p>
                      </motion.div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {chatHistoryData.data.map((msg) => {
                          console.log("Rendering message:", {
                            id: msg._id,
                            hasBooks: !!msg.books,
                            booksCount: msg.books?.length || 0,
                            books: msg.books,
                          });
                          return (
                            <div key={msg._id} className="space-y-2">
                              {/* Message text */}
                              <motion.div
                                variants={messageVariants}
                                initial="hidden"
                                animate="visible"
                                layout
                                className={`flex ${
                                  msg.senderId === currentUser.uid
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <motion.div
                                  layout
                                  className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                                    msg.senderId === currentUser.uid
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                      : "bg-white text-gray-900 border border-gray-200"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.message}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      msg.senderId === currentUser.uid
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {format(new Date(msg.createdAt), "HH:mm", {
                                      locale: vi,
                                    })}
                                  </p>
                                </motion.div>
                              </motion.div>

                              {/* Hiển thị book cards bên ngoài message bubble */}
                              {msg.books &&
                                Array.isArray(msg.books) &&
                                msg.books.length > 0 && (
                                  <motion.div
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={`flex ${
                                      msg.senderId === currentUser.uid
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                                  >
                                    <div className="w-full max-w-[90%] space-y-2">
                                      {msg.books.map((book) => (
                                        <ChatBookCard
                                          key={book._id}
                                          book={book}
                                        />
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                            </div>
                          );
                        })}
                      </AnimatePresence>
                    )}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-2xl px-4 py-2 border border-gray-200">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200/50">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end space-x-2"
                  >
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="pr-16 rounded-2xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                        disabled={isSending}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 rounded-full"
                        >
                          <Paperclip className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 rounded-full"
                        >
                          <Smile className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={!message.trim() || isSending}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;
