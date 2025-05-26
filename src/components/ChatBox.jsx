import { useState, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import {
  useGetChatHistoryQuery,
  useSendMessageMutation,
} from "../redux/features/chat/chatApi";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { FaPaperPlane, FaUser, FaTimes, FaComments } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [adminId, setAdminId] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const { currentUser } = useAuth();

  // Debug logs
  useEffect(() => {
    console.log("Current user context:", currentUser);
    console.log("Admin ID state:", adminId);
  }, [currentUser, adminId]);

  // Lấy lịch sử chat với admin
  const { data: chatHistory, refetch: refetchChatHistory } =
    useGetChatHistoryQuery(adminId, {
      skip: !isOpen || !adminId,
    });
  const [sendMessage, { error: sendMessageError }] = useSendMessageMutation();

  // Debug log cho lỗi gửi tin nhắn
  useEffect(() => {
    if (sendMessageError) {
      console.error("Send message error details:", sendMessageError);
    }
  }, [sendMessageError]);

  // Lấy admin ID khi component mount
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

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

    if (currentUser?.uid) {
      // Chỉ fetch khi có user
      fetchAdminId();
    }
  }, [currentUser]); // Thêm currentUser vào dependencies

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isOpen]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !isOpen || !adminId) return;

    socket.emit("joinChat", adminId);

    const handleNewMessage = (data) => {
      if (
        data.message.senderId === adminId ||
        data.message.receiverId === adminId
      ) {
        refetchChatHistory();
        // Hiển thị thông báo khi có tin nhắn mới và chat box đang đóng
        if (!isOpen) {
          setIsMinimized(true);
        }
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveChat", adminId);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, isOpen, adminId, refetchChatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !adminId || !currentUser?.uid) {
      console.error("Cannot send message:", {
        message: message.trim(),
        adminId,
        userId: currentUser?.uid,
        userContext: currentUser,
        token: localStorage.getItem("token"),
      });
      return;
    }

    try {
      const messageData = {
        receiverId: adminId,
        message: message.trim(),
      };

      console.log("Attempting to send message:", {
        messageData,
        currentUser,
        token: localStorage.getItem("token"),
      });

      const result = await sendMessage(messageData).unwrap();

      console.log("Message sent successfully:", result);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", {
        error,
        messageData: {
          receiverId: adminId,
          message: message.trim(),
        },
        currentUser,
        token: localStorage.getItem("token"),
      });
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <FaComments className="w-6 h-6" />
      </button>

      {/* Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <div
            className={`fixed bottom-20 right-4 z-50 w-80 bg-white rounded-lg shadow-xl overflow-hidden ${
              isMinimized ? "h-12" : "h-96"
            } transition-all duration-300`}
          >
            {/* Chat Header */}
            <div
              className="p-3 bg-blue-500 text-white flex items-center justify-between cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaUser className="text-blue-500" />
                </div>
                <span className="font-medium">Chat với Admin</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1 hover:bg-blue-600 rounded"
                >
                  {isMinimized ? "▼" : "▲"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="p-1 hover:bg-blue-600 rounded"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-64 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {chatHistory?.data?.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${
                        msg.senderId === currentUser?.uid
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.senderId === currentUser?.uid
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderId === currentUser?.uid
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {format(new Date(msg.createdAt), "HH:mm", {
                            locale: vi,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-gray-200 bg-white"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;
