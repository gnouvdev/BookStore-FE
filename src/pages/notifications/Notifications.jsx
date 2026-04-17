import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../redux/features/notifications/notificationsApi";
import { useSocket } from "../../context/SocketContext";
import "../../styles/bookeco-desk.css";

const Notifications = () => {
  const { t } = useTranslation();
  const socket = useSocket();
  const { data: notificationsData, isLoading, refetch, error } = useGetNotificationsQuery(undefined, {
    pollingInterval: 5000,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    if (!socket) return undefined;
    const handleOrderStatusUpdate = () => refetch();
    socket.on("orderStatusUpdate", handleOrderStatusUpdate);
    return () => socket.off("orderStatusUpdate", handleOrderStatusUpdate);
  }, [refetch, socket]);

  useEffect(() => {
    if (error) {
      toast.error(t("bookeco.notifications.error", { defaultValue: "Không thể tải thông báo lúc này." }));
    }
  }, [error, t]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId).unwrap();
    refetch();
  };

  const handleMarkAll = async () => {
    await markAllAsRead().unwrap();
    refetch();
  };

  if (isLoading) {
    return <section className="bookeco-desk-shell"><div className="bookeco-desk-container">{t("bookeco.notifications.loading", { defaultValue: "Đang tải thông báo..." })}</div></section>;
  }

  return (
    <section className="bookeco-desk-shell">
      <div className="bookeco-desk-container">
        <header className="bookeco-desk-header">
          <span className="bookeco-kicker">BookEco</span>
          <h1>{t("common.notifications", { defaultValue: "Thông báo" })}</h1>
        </header>

        <div className="bookeco-desk-layout">
          <aside className="bookeco-desk-sidebar">
            <nav className="bookeco-desk-nav">
              <Link to="/profile">{t("common.profile", { defaultValue: "Hồ sơ" })} <ChevronRight size={14} /></Link>
              <Link to="/orders">{t("common.orders", { defaultValue: "Đơn hàng" })} <ChevronRight size={14} /></Link>
              <Link to="/notifications" className="is-active">{t("common.notifications", { defaultValue: "Thông báo" })} <ChevronRight size={14} /></Link>
              <Link to="/wishlist">{t("common.wishlist", { defaultValue: "Yêu thích" })} <ChevronRight size={14} /></Link>
            </nav>

            <div className="bookeco-desk-quote">
              <p>{t("bookeco.notifications.quote", { defaultValue: "Mọi thay đổi liên quan tới đơn hàng sẽ được lưu lại ở đây để bạn theo dõi dễ hơn." })}</p>
              <span>BookEco Notices</span>
            </div>
          </aside>

          <div className="bookeco-desk-main">
            <div className="bookeco-desk-section-head">
              <h2 className="bookeco-desk-section-title">{t("bookeco.notifications.inbox", { defaultValue: "Hộp thông báo" })}</h2>
              {unreadCount ? (
                <button type="button" className="bookeco-desk-inline-button" onClick={handleMarkAll}>
                  <Check size={14} /> {t("notifications.mark_all_read", { defaultValue: "Đánh dấu tất cả đã đọc" })}
                </button>
              ) : null}
            </div>

            <div className="bookeco-desk-notice-list">
              {notifications.length ? (
                notifications.map((notification) => (
                  <article key={notification._id} className="bookeco-desk-notice-card">
                    <div className="bookeco-desk-notice-head">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Bell size={18} />
                        <div>
                          <div className="bookeco-desk-notice-meta">
                            {new Date(notification.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                          <p>{notification.message}</p>
                        </div>
                      </div>
                      {!notification.isRead ? <span className="bookeco-desk-notice-badge">{t("notifications.filters.unread", { defaultValue: "Chưa đọc" })}</span> : null}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      {notification.type === "order" && notification.data?.orderId ? (
                        <Link to={`/orders/${notification.data.orderId}`} className="bookeco-desk-link-inline">
                          {t("cart.view_details", { defaultValue: "Xem chi tiết" })} <ChevronRight size={14} />
                        </Link>
                      ) : <span className="bookeco-desk-notice-meta">{notification.type || t("common.notifications", { defaultValue: "Thông báo" })}</span>}

                      {!notification.isRead ? (
                        <button type="button" className="bookeco-desk-inline-button" onClick={() => handleMarkAsRead(notification._id)}>
                          <Check size={14} /> {t("notifications.mark_as_read", { defaultValue: "Đánh dấu đã đọc" })}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))
              ) : (
                <div className="bookeco-desk-quote"><p>{t("notifications.no_notifications", { defaultValue: "Chưa có thông báo nào." })}</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Notifications;
