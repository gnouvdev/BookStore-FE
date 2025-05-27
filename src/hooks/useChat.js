/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export const useChat = (selectedUserId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const { currentUser } = useAuth();

  // Sử dụng ref để tránh re-render không cần thiết
  const optimisticMessagesRef = useRef({});
  const messageQueueRef = useRef([]);
  const processingRef = useRef(false);

  // Load tin nhắn cũ
  const loadMessages = useCallback(async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/chat/history/${selectedUserId}`);
      // Tin nhắn đã được sắp xếp từ backend
      setMessages(response.data.data);
    } catch (err) {
      setError(err.message);
      console.error("Error loading messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId]);

  // Xử lý queue tin nhắn
  const processMessageQueue = useCallback(async () => {
    if (processingRef.current || messageQueueRef.current.length === 0) return;

    processingRef.current = true;
    const message = messageQueueRef.current.shift();

    try {
      await axios.post("/api/chat/send", {
        receiverId: selectedUserId,
        message: message.content,
      });
    } catch (err) {
      // Xóa tin nhắn tạm nếu có lỗi
      setMessages((prev) => prev.filter((msg) => msg._id !== message.tempId));
      delete optimisticMessagesRef.current[message.tempId];
      setError(err.message);
      console.error("Error sending message:", err);
    } finally {
      processingRef.current = false;
      if (messageQueueRef.current.length > 0) {
        processMessageQueue();
      }
    }
  }, [selectedUserId]);

  // Gửi tin nhắn mới với optimistic update
  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !selectedUserId || !currentUser) return;

      const now = new Date();
      const tempId = now.getTime().toString();
      const tempMessage = {
        _id: tempId,
        message: content,
        senderId: currentUser.firebaseId,
        receiverId: selectedUserId,
        senderRole: currentUser.role,
        receiverRole: selectedUserId === "admin" ? "admin" : "user",
        createdAt: now,
        isOptimistic: true,
      };

      // Thêm tin nhắn mới vào cuối danh sách
      setMessages((prev) => [...prev, tempMessage]);
      optimisticMessagesRef.current[tempId] = tempMessage;

      // Thêm vào queue để xử lý
      messageQueueRef.current.push({ tempId, content });
      processMessageQueue();
    },
    [selectedUserId, currentUser, processMessageQueue]
  );

  // Xử lý socket events
  useEffect(() => {
    if (!socket || !selectedUserId) return;

    socket.emit("joinChat", selectedUserId);

    const handleNewMessage = ({ message }) => {
      // Kiểm tra xem tin nhắn đã tồn tại chưa
      const isDuplicate = messages.some((msg) => msg._id === message._id);
      if (!isDuplicate) {
        // Thêm tin nhắn mới vào cuối danh sách
        setMessages((prev) => {
          // Kiểm tra xem tin nhắn có phải là optimistic message không
          const optimisticMsg = Object.values(
            optimisticMessagesRef.current
          ).find(
            (msg) =>
              msg.message === message.message &&
              msg.senderId === message.senderId &&
              Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) <
                1000
          );

          if (optimisticMsg) {
            // Nếu là optimistic message, thay thế nó
            return prev.map((msg) =>
              msg._id === optimisticMsg._id ? message : msg
            );
          }

          // Nếu không phải, thêm vào cuối
          return [...prev, message];
        });
      }
    };

    const handleMessageSaved = ({ tempId, savedMessage }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? savedMessage : msg))
      );
      delete optimisticMessagesRef.current[tempId];
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSaved", handleMessageSaved);

    return () => {
      socket.emit("leaveChat", selectedUserId);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSaved", handleMessageSaved);
    };
  }, [socket, selectedUserId, messages]);

  // Load tin nhắn khi chọn user mới
  useEffect(() => {
    loadMessages();
    // Reset state khi chọn user mới
    optimisticMessagesRef.current = {};
    messageQueueRef.current = [];
    processingRef.current = false;
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
  };
};
