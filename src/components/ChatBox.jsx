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
  ChevronDown,
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
import ChatBookCard from "./ChatBookCard";
import "../styles/bookeco-chat.css";

const createOptimisticMessage = ({
  senderId,
  receiverId,
  message,
  senderRole = "user",
  receiverRole = "bot",
}) => ({
  _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  senderId,
  receiverId,
  message,
  senderRole,
  receiverRole,
  isRead: true,
  books: [],
  actionButtons: [],
  createdAt: new Date().toISOString(),
  __optimistic: true,
});

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
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const chatBoxRef = useRef(null);
  const buttonRef = useRef(null);
  const [adminId, setAdminId] = useState(null);
  const [chatMode, setChatMode] = useState("bot"); // "bot" hoặc "admin"


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

  const getScrollViewport = () =>
    scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]");

  const scrollToBottom = (behavior = "smooth") => {
    const viewport = getScrollViewport();
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior,
      });
      setShowScrollToBottom(false);
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollToBottom(false);
  };

  useEffect(() => {
    if (Array.isArray(chatHistoryData?.data)) {
      setMessages(chatHistoryData.data);
    }
  }, [chatHistoryData]);

  useEffect(() => {
    if (!isOpen || !chatTargetId || !currentUser?.uid) {
      return;
    }

    refetchChatHistory();
  }, [isOpen, chatTargetId, currentUser?.uid, refetchChatHistory]);



  // Debug log cho lỗi gửi tin nhắn
  const [sendMessage, { error: sendMessageError, isLoading: isSending }] =
    useSendMessageMutation();
  useEffect(() => {
    if (sendMessageError) {
      console.error("Send message error details:", sendMessageError);
    }
  }, [sendMessageError]);

  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        if (chatMode !== "admin" || !currentUser?.uid) {
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/admin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.data && data.data.firebaseId) {
          setAdminId(data.data.firebaseId);
        }
      } catch (error) {
        console.error("Error fetching admin ID:", error);
      }
    };

    fetchAdminId();
  }, [chatMode, currentUser]);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [isOpen, chatTargetId]);

  useEffect(() => {
    if (!isOpen || messages.length === 0) {
      return;
    }

    if (!showScrollToBottom) {
      scrollToBottom("smooth");
    }
  }, [messages.length, isOpen, showScrollToBottom]);

  useEffect(() => {
    const viewport = getScrollViewport();
    if (!viewport || !isOpen) {
      return;
    }

    const handleScroll = () => {
      const distanceFromBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setShowScrollToBottom(distanceFromBottom > 160);
    };

    handleScroll();
    viewport.addEventListener("scroll", handleScroll);

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, messages.length, chatTargetId]);

  // Handle socket events
  useEffect(() => {
    // Chỉ setup socket events khi socket đã connected và các điều kiện đủ
    if (
      !socket ||
      !socket.connected ||
      !isOpen ||
      !chatTargetId ||
      !currentUser?.uid
    ) {
      console.log("Socket setup skipped:", {
        hasSocket: !!socket,
        isConnected: socket?.connected,
        isOpen,
        chatTargetId,
        userId: currentUser?.uid,
      });
      return;
    }

    const userId = currentUser.uid;
    const expectedRoom = `chat:${userId}`;
    console.log("Setting up socket events for room:", expectedRoom);

    // Đảm bảo socket connected trước khi emit
    if (!socket.connected) {
      console.warn("Socket not connected, waiting for connection...");
      const connectHandler = () => {
        console.log("Socket connected, joining chat room:", userId);
        socket.emit("joinChat", userId);
      };
      socket.once("connect", connectHandler);

      return () => {
        socket.off("connect", connectHandler);
      };
    }

    // Join chat room (backend sẽ tự thêm prefix "chat:")
    socket.emit("joinChat", userId, (response) => {
      if (response && response.error) {
        console.error("Error joining chat room:", response.error);
      } else {
        console.log("Successfully joined chat room:", expectedRoom);
      }
    });

    const handleNewMessage = (data) => {
      // Kiểm tra xem có redirectTo trong message không (từ bot response)
      if (data?.message?.redirectTo && data.message.senderId === "chatbot") {
        const redirectPath = data.message.redirectTo;
        console.log("Redirecting to:", redirectPath);
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1500); // Delay 1.5s để user đọc thông báo
      }
      console.log("New message received:", data);
      if (data.message) {
        if (data.message.senderId === "chatbot") {
          setIsThinking(false);
        }

        setMessages((prevMessages) => {
          if (prevMessages.some((msg) => msg._id === data.message._id)) {
            return prevMessages;
          }

          const nextMessages = [
            ...prevMessages.filter(
              (msg) =>
                !(
                  msg.__optimistic &&
                  msg.senderId === data.message.senderId &&
                  msg.receiverId === data.message.receiverId &&
                  msg.message === data.message.message
                )
            ),
            data.message,
          ];

          return nextMessages;
        });

        // Kiểm tra xem tin nhắn có liên quan đến chat hiện tại không
        const message = data.message;
        console.log("Message books:", message.books);
        if (!isOpen) {
          setIsMinimized(true);
        }
      }
    };

    // Xử lý lỗi socket
    const handleError = (error) => {
      console.error("Socket error in ChatBox:", error);
    };

    // Xử lý disconnect
    const handleDisconnect = (reason) => {
      console.log("Socket disconnected in ChatBox:", reason);
    };

    // Xử lý reconnect
    const handleReconnect = () => {
      console.log("Socket reconnected, rejoining chat room:", userId);
      socket.emit("joinChat", userId);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);

    return () => {
      console.log("Cleaning up socket events, leaving chat room:", userId);
      // Chỉ leave nếu socket vẫn connected
      if (socket.connected) {
        socket.emit("leaveChat", userId);
      }
      socket.off("newMessage", handleNewMessage);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
    };
  }, [
    socket,
    socket?.connected,
    isOpen,
    chatTargetId,
    currentUser?.uid,
    refetchChatHistory,
    chatMode,
    adminId,
  ]);

  const sendMessageToBot = async (messageText) => {
    const receiverId = chatMode === "bot" ? "chatbot" : adminId;
    if (!messageText.trim() || !receiverId || !currentUser?.uid) {
      console.error("Cannot send message:", {
        message: messageText.trim(),
        receiverId,
        userId: currentUser?.uid,
      });
      return;
    }

    try {
      if (chatMode === "bot") {
        setIsThinking(true);
      }

      const optimisticUserMessage = createOptimisticMessage({
        senderId: currentUser.uid,
        receiverId,
        message: messageText.trim(),
        senderRole: "user",
        receiverRole: chatMode === "bot" ? "bot" : "admin",
      });

      setMessages((prevMessages) => [...prevMessages, optimisticUserMessage]);
      setMessage("");
      setTimeout(() => scrollToBottom(), 0);

      const messageData = {
        receiverId: receiverId,
        message: messageText.trim(),
      };

      const result = await sendMessage(messageData).unwrap();
      console.log("Message sent successfully:", result);

      if (result?.data?.userMessage || result?.data?.botMessage) {
        setMessages((prevMessages) => {
          const nextMessages = prevMessages.filter(
            (msg) => msg._id !== optimisticUserMessage._id
          );

          [result.data.userMessage, result.data.botMessage]
            .filter(Boolean)
            .forEach((newMessage) => {
              if (!nextMessages.some((msg) => msg._id === newMessage._id)) {
                nextMessages.push(newMessage);
              }
            });

          return nextMessages;
        });
      }
      setIsThinking(false);

      // Kiểm tra xem có redirectTo trong response không
      if (result?.data?.botMessage?.redirectTo) {
        const redirectPath = result.data.botMessage.redirectTo;
        console.log("Redirecting to:", redirectPath);
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1500); // Delay 1.5s để user đọc thông báo
      }
      setTimeout(() => scrollToBottom(), 0);
    } catch (error) {
      setIsThinking(false);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== undefined && !msg.__optimistic)
      );
      console.error("Error sending message:", error);
      toast.error("Gui tin nhan that bai. Vui long thu lai.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await sendMessageToBot(message);
  };

  const handleButtonClick = async (buttonValue) => {
    await sendMessageToBot(buttonValue);
  };

  const handleOpen = async () => {
    console.log("Opening chat box");
    setIsOpen(true);
    setIsMinimized(false);

    if (chatTargetId && currentUser?.uid) {
      try {
        await refetchChatHistory();
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
        className="bookeco-chat-launcher fixed bottom-6 right-6 z-50"
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          onClick={handleOpen}
          className="relative w-14 h-14 rounded-full bg-[#2F3C7E] hover:opacity-90 shadow-2xl border-4 border-white"
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
            className={`bookeco-chat-shell fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm flex flex-col ${
              isMaximized
                ? "inset-4 w-auto h-auto"
                : "bottom-24 right-6 w-96 h-[500px]"
            } ${isMinimized ? "h-16" : ""}`}
          >
            {/* Header */}
            <div className="bookeco-chat-header p-4 bg-[#2F3C7E] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8 border-2 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {chatMode === "bot" ? "🤖" : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {chatMode === "bot" ? "BookEco Assistant" : "BookEco Support"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-blue-100">
                      <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                      {chatMode === "bot"
                        ? "Luôn sẵn sàng"
                        : isThinking
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
                <div className="bookeco-chat-body relative flex-1 min-h-0">
                  <ScrollArea
                    ref={scrollAreaRef}
                    className="bookeco-chat-scroll bookeco-chat-scroll-area bg-gray-50/50 h-full"
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
                    ) : messages.length === 0 ? (
                      <motion.div
                        variants={welcomeVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-center py-8"
                      >
                        <div className="bookeco-chat-welcome-icon w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-blue-500" />
                        </div>
                        <h4 className="bookeco-chat-welcome-title font-medium text-gray-900 mb-2">
                          Chào mừng!
                        </h4>
                        <p className="bookeco-chat-welcome-copy text-sm text-gray-500">
                          {chatMode === "bot"
                            ? "Hãy gửi tin nhắn để bắt đầu trò chuyện với chatbot AI. Tôi có thể giúp bạn tìm sách, tư vấn sách phù hợp, hoặc trả lời các câu hỏi!"
                            : "Hãy gửi tin nhắn để bắt đầu cuộc trò chuyện với admin"}
                        </p>
                      </motion.div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {messages.map((msg) => {
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
                                  msg.senderRole === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <motion.div
                                  layout
                                  className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                                    msg.senderRole === "user"
                                      ? "bg-[#2F3C7E] text-white"
                                      : "bg-white text-gray-900 border border-gray-200"
                                  }`}
                                >
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.message}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      msg.senderRole === "user"
                                        ? "text-blue-100"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {format(new Date(msg.createdAt), "HH:mm", {
                                      locale: vi,
                                    })}
                                  </p>
                                  {/* Action Buttons */}
                                  {msg.actionButtons &&
                                    Array.isArray(msg.actionButtons) &&
                                    msg.actionButtons.length > 0 &&
                                    msg.senderRole !== "user" && (
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {msg.actionButtons.map(
                                          (button, idx) => (
                                            <Button
                                              key={idx}
                                              variant={
                                                button.variant === "primary"
                                                  ? "default"
                                                  : button.variant === "danger"
                                                  ? "destructive"
                                                  : "outline"
                                              }
                                              size="sm"
                                              onClick={() =>
                                                handleButtonClick(button.value)
                                              }
                                              className={`text-xs ${
                                                button.variant === "primary"
                                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                  : button.variant === "danger"
                                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                              }`}
                                            >
                                              {button.label}
                                            </Button>
                                          )
                                        )}
                                      </div>
                                    )}
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

                    {isThinking && chatMode === "bot" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white rounded-2xl px-4 py-2 border border-gray-200">
                          <div className="mb-2 text-xs text-gray-500">
                            BookEco dang suy nghi...
                          </div>
                          <div className="bookeco-chat-thinking-dots flex space-x-1">
                            <div className="bookeco-chat-thinking-dot w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div
                              className="bookeco-chat-thinking-dot w-2 h-2 bg-gray-400 rounded-full"
                              style={{ animationDelay: "0.16s" }}
                            ></div>
                            <div
                              className="bookeco-chat-thinking-dot w-2 h-2 bg-gray-400 rounded-full"
                              style={{ animationDelay: "0.32s" }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  {showScrollToBottom && (
                    <Button
                      type="button"
                      onClick={() => scrollToBottom("smooth")}
                      className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full bg-[#2F3C7E] p-0 text-white shadow-lg hover:opacity-90"
                      aria-label="Scroll to latest messages"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {/* Input */}
                <div className="bookeco-chat-inputbar p-4 bg-white border-t border-gray-200/50">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end space-x-2"
                  >
                    <div className="flex-1 relative">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn..."
                        className="bookeco-chat-input pr-16 rounded-2xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
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
                      className="w-10 h-10 rounded-full bg-[#2F3C7E] hover:opacity-90 p-0"
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





