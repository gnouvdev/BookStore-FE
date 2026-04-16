import { Link, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import { useGetOrdersQuery, useCancelOrderMutation } from "../../redux/features/orders/ordersApi";
import { useAuth } from "../../context/AuthContext";
import "../../styles/bookeco-desk.css";

const OrderPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { data, isLoading, isError, error } = useGetOrdersQuery(currentUser?.email, {
    skip: !currentUser?.email,
  });
  const [cancelOrder] = useCancelOrderMutation();

  const orders = [...(data?.data || [])].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const statusLabel = (status) => {
    switch (status) {
      case "pending":
        return t("bookeco.orders.pending", { defaultValue: "Chờ xác nhận" });
      case "processing":
        return t("bookeco.orders.processing", { defaultValue: "Đang xử lý" });
      case "shipped":
        return t("bookeco.orders.shipped", { defaultValue: "Đang giao" });
      case "delivered":
        return t("bookeco.orders.delivered", { defaultValue: "Đã giao" });
      case "cancelled":
        return t("bookeco.orders.cancelled", { defaultValue: "Đã hủy" });
      default:
        return status || t("common.orders", { defaultValue: "Đơn hàng" });
    }
  };

  const handleCancel = async (orderId) => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("bookeco.orders.cancel_title", { defaultValue: "Hủy đơn hàng này?" }),
      text: t("bookeco.orders.cancel_copy", { defaultValue: "Trạng thái đơn sẽ được cập nhật ngay sau khi bạn xác nhận." }),
      showCancelButton: true,
      confirmButtonText: t("bookeco.orders.cancel_confirm", { defaultValue: "Hủy đơn" }),
      cancelButtonText: t("cart.cancel", { defaultValue: "Quay lại" }),
    });

    if (!result.isConfirmed) return;
    await cancelOrder(orderId).unwrap();
  };

  if (!currentUser?.email) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <section className="bookeco-desk-shell"><div className="bookeco-desk-container">{t("bookeco.orders.loading", { defaultValue: "Đang tải đơn hàng..." })}</div></section>;
  }

  if (isError) {
    return <section className="bookeco-desk-shell"><div className="bookeco-desk-container">{error?.data?.message || t("bookeco.orders.error", { defaultValue: "Không thể tải đơn hàng." })}</div></section>;
  }

  return (
    <section className="bookeco-desk-shell">
      <div className="bookeco-desk-container">
        <header className="bookeco-desk-header">
          <span className="bookeco-kicker">BookEco</span>
          <h1>{t("common.orders", { defaultValue: "Lịch sử đơn hàng" })}</h1>
        </header>

        <div className="bookeco-desk-layout">
          <aside className="bookeco-desk-sidebar">
            <nav className="bookeco-desk-nav">
              <Link to="/profile">{t("common.profile", { defaultValue: "Hồ sơ" })}</Link>
              <Link to="/orders" className="is-active">{t("common.orders", { defaultValue: "Đơn hàng" })}</Link>
              <Link to="/notifications">{t("common.notifications", { defaultValue: "Thông báo" })}</Link>
              <Link to="/wishlist">{t("common.wishlist", { defaultValue: "Yêu thích" })}</Link>
            </nav>

            <div className="bookeco-desk-quote">
              <p>{t("bookeco.orders.quote", { defaultValue: "Mỗi đơn hàng là một lần bạn bổ sung thêm một câu chuyện vào tủ sách cá nhân." })}</p>
              <span>BookEco Ledger</span>
            </div>
          </aside>

          <div className="bookeco-desk-main">
            <div className="bookeco-desk-section-head">
              <h2 className="bookeco-desk-section-title">{t("bookeco.orders.recent", { defaultValue: "Các đơn hàng gần đây" })}</h2>
            </div>

            <div className="bookeco-desk-orders-grid">
              {orders.length ? (
                orders.map((order) => {
                  const item = order.productIds?.[0];
                  const product = item?.productId;
                  return (
                    <article key={order._id} className="bookeco-desk-order-card">
                      <img className="bookeco-desk-order-cover" src={product?.coverImage || "https://via.placeholder.com/82x118?text=Book"} alt={product?.title || "Book"} />
                      <div className="bookeco-desk-order-copy">
                        <div className="bookeco-desk-order-meta">
                          <span>{statusLabel(order.status)} · {new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                          <h3 className="bookeco-desk-order-title">{product?.title || `#${order._id.slice(-6)}`}</h3>
                          <p>{product?.author?.name || `${order.productIds?.length || 0} ${t("cart.products", { defaultValue: "sản phẩm" })}`}</p>
                        </div>
                      </div>

                      <div className="bookeco-desk-order-actions">
                        <div className="bookeco-desk-status">{statusLabel(order.status)}</div>
                        <strong className="bookeco-desk-order-price">{Number(order.totalPrice || 0).toLocaleString("vi-VN")}đ</strong>
                        <Link to={`/orders/${order._id}`} className="bookeco-desk-order-link">{t("cart.view_details", { defaultValue: "Xem chi tiết" })}</Link>
                        {(order.status === "pending" || order.status === "processing") ? (
                          <button type="button" className="bookeco-desk-order-cancel" onClick={() => handleCancel(order._id)}>
                            {t("bookeco.orders.cancel_cta", { defaultValue: "Hủy đơn hàng" })}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="bookeco-desk-quote"><p>{t("bookeco.orders.empty", { defaultValue: "Bạn chưa có đơn hàng nào." })}</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderPage;
