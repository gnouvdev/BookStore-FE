"use client"

/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../redux/features/notifications/notificationsApi"
import { useSocket } from "../../context/SocketContext"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { FaBell } from "react-icons/fa"
import {
  Bell,
  Check,
  CheckCheck,
  Circle,
  Eye,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const getNotificationIcon = (type, status) => {
  if (type === "order") {
    switch (status) {
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }
  if (type === "promotion") {
    return <Sparkles className="w-5 h-5 text-orange-500" />
  }
  return <Bell className="w-5 h-5 text-blue-500" />
}

const getNotificationColor = (type, status) => {
  if (type === "order") {
    switch (status) {
      case "processing":
        return "from-blue-50 to-blue-100 border-blue-200"
      case "shipped":
        return "from-purple-50 to-purple-100 border-purple-200"
      case "delivered":
        return "from-green-50 to-green-100 border-green-200"
      case "cancelled":
        return "from-red-50 to-red-100 border-red-200"
      default:
        return "from-yellow-50 to-yellow-100 border-yellow-200"
    }
  }
  if (type === "promotion") {
    return "from-orange-50 to-orange-100 border-orange-200"
  }
  return "from-gray-50 to-gray-100 border-gray-200"
}

const Notifications = () => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState("all")
  const socket = useSocket()
  const navigate = useNavigate()

  const {
    data: notificationsData,
    isLoading,
    refetch,
    error: notificationsError,
  } = useGetNotificationsQuery(undefined, {
    pollingInterval: 5000,
  })

  const [markAsRead] = useMarkAsReadMutation()
  const [markAllAsRead] = useMarkAllAsReadMutation()

  const notifications = notificationsData?.data || []
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Handle socket connection status
  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected")
      return
    }

    const handleConnect = () => {
      console.log("Socket connected")
    }

    const handleDisconnect = () => {
      console.log("Socket disconnected")
      toast.error("Mất kết nối với máy chủ. Vui lòng tải lại trang.")
    }

    const handleError = (error) => {
      console.error("Socket error:", error)
      toast.error("Có lỗi xảy ra với kết nối. Vui lòng thử lại sau.")
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("error", handleError)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("error", handleError)
    }
  }, [socket])

  // Handle order status updates
  const handleOrderStatusUpdate = useCallback(
    (data) => {
      console.log("Received orderStatusUpdate:", data)
      const message = data.message || `Đơn hàng #${data.orderId} đã được cập nhật: ${data.status}`

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
                  <p className="mt-1 text-sm text-gray-500">Click để xem chi tiết</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  navigate("/notifications")
                  refetch()
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
        },
      )

      refetch()
    },
    [refetch, navigate],
  )

  useEffect(() => {
    if (!socket) return

    socket.on("orderStatusUpdate", handleOrderStatusUpdate)

    return () => {
      socket.off("orderStatusUpdate", handleOrderStatusUpdate)
    }
  }, [socket, handleOrderStatusUpdate])

  // Handle notifications error
  useEffect(() => {
    if (notificationsError) {
      toast.error("Không thể tải thông báo. Vui lòng thử lại sau.")
    }
  }, [notificationsError])

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.isRead
    if (filter === "read") return notification.isRead
    return true
  })

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap()
      toast.success("Đã đánh dấu thông báo đã đọc")
      refetch()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
      toast.error("Không thể đánh dấu thông báo đã đọc")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      toast.success("Đã đánh dấu tất cả thông báo đã đọc")
      refetch()
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast.error("Không thể đánh dấu tất cả thông báo đã đọc")
    }
  }

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
              >
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{t("notifications.title")}</h1>
                  <p className="text-gray-500">Quản lý tất cả thông báo của bạn</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40 bg-white/70 border-gray-200/50">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("notifications.filters.all")}</SelectItem>
                    <SelectItem value="unread">{t("notifications.filters.unread")}</SelectItem>
                    <SelectItem value="read">{t("notifications.filters.read")}</SelectItem>
                  </SelectContent>
                </Select>

                {unreadCount > 0 && (
                  <Button
                    onClick={handleMarkAllAsRead}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    <span>{t("notifications.mark_all_read")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <ScrollArea className="h-[600px]">
              <div className="p-6">
                <AnimatePresence>
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <Bell className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("notifications.no_notifications")}
                      </h3>
                      <p className="text-gray-500">{t("notifications.no_notifications_desc")}</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          className={`relative rounded-2xl border-2 p-6 transition-all duration-200 ${
                            notification.isRead
                              ? "bg-gray-50 border-gray-200"
                              : `bg-gradient-to-r ${getNotificationColor(notification.type, notification.data?.status)}`
                          }`}
                        >
                          {!notification.isRead && (
                            <div className="absolute top-4 right-4">
                              <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />
                            </div>
                          )}

                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                {getNotificationIcon(notification.type, notification.data?.status)}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-gray-900 font-medium leading-relaxed mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {format(new Date(notification.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}
                                    </span>
                                    {notification.type === "order" && (
                                      <Badge variant="secondary" className="text-xs">
                                        Đơn hàng #{notification.data?.orderId}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                  {notification.type === "order" && notification.data?.orderId && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewOrder(notification.data.orderId)}
                                      className="rounded-full hover:bg-white/50"
                                      title="Xem chi tiết đơn hàng"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification._id)}
                                      className="rounded-full hover:bg-white/50"
                                      title={t("notifications.mark_as_read")}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Notifications
