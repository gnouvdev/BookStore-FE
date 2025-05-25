/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../redux/features/notifications/notificationsApi";
import { useSocket } from "../../context/SocketContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaCircle,
  FaEye,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const socket = useSocket();
  const navigate = useNavigate();

  const {
    data: notificationsData,
    isLoading,
    refetch,
    error: notificationsError,
  } = useGetNotificationsQuery(undefined, {
    pollingInterval: 5000,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle socket connection status
  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }

    const handleConnect = () => {
      console.log("Socket connected");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      toast.error("Mất kết nối với máy chủ. Vui lòng tải lại trang.");
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
      toast.error("Có lỗi xảy ra với kết nối. Vui lòng thử lại sau.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("error", handleError);
    };
  }, [socket]);

  // Handle order status updates
  const handleOrderStatusUpdate = useCallback(
    (data) => {
      console.log("Received orderStatusUpdate:", data);
      const message =
        data.message ||
        `Đơn hàng #${data.orderId} đã được cập nhật: ${data.status}`;

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <FaBell className="h-10 w-10 text-blue-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{message}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Click để xem chi tiết
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/notifications");
                  refetch();
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Xem
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-right",
        }
      );

      refetch();
    },
    [refetch, navigate]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("orderStatusUpdate", handleOrderStatusUpdate);

    return () => {
      socket.off("orderStatusUpdate", handleOrderStatusUpdate);
    };
  }, [socket, handleOrderStatusUpdate]);

  // Handle notifications error
  useEffect(() => {
    if (notificationsError) {
      toast.error("Không thể tải thông báo. Vui lòng thử lại sau.");
    }
  }, [notificationsError]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap();
      toast.success("Đã đánh dấu thông báo đã đọc");
      refetch();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Không thể đánh dấu thông báo đã đọc");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("Đã đánh dấu tất cả thông báo đã đọc");
      refetch();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Không thể đánh dấu tất cả thông báo đã đọc");
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FaBell className="text-3xl text-blue-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("notifications.title")}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t("notifications.filters.all")}</option>
              <option value="unread">
                {t("notifications.filters.unread")}
              </option>
              <option value="read">{t("notifications.filters.read")}</option>
            </select>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <FaCheckDouble />
                <span>{t("notifications.mark_all_read")}</span>
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm"
            >
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("notifications.no_notifications")}
              </h3>
              <p className="text-gray-500">
                {t("notifications.no_notifications_desc")}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                    notification.isRead ? "border-gray-200" : "border-blue-500"
                  } relative hover:shadow-md transition-shadow duration-200`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-4 right-4">
                      <FaCircle className="text-blue-500 text-xs" />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(notification.createdAt),
                          "HH:mm - dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.type === "order" &&
                        notification.data?.orderId && (
                          <button
                            onClick={() =>
                              handleViewOrder(notification.data.orderId)
                            }
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                            title="Xem chi tiết đơn hàng"
                          >
                            <FaEye />
                          </button>
                        )}
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                          title={t("notifications.mark_as_read")}
                        >
                          <FaCheck />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
