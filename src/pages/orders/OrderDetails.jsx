import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCancelOrderMutation } from "../../redux/features/orders/ordersApi";
import "../../styles/bookeco-desk.css";
import Swal from "sweetalert2";

const OrderDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelOrder] = useCancelOrderMutation();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || t("bookeco.orders.detail_error", { defaultValue: "Không thể tải đơn hàng." }));
        setOrder(payload.data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, t]);

  const timeline = useMemo(() => {
    const status = order?.status;
    return [
      { title: t("bookeco.orders.timeline_created", { defaultValue: "Đơn hàng được tạo" }), description: t("bookeco.orders.timeline_created_copy", { defaultValue: "Yêu cầu mua sách đã được ghi nhận trong hệ thống." }), date: t("bookeco.orders.timeline_recorded", { defaultValue: "Đã ghi nhận" }), active: true },
      { title: t("bookeco.orders.timeline_confirm", { defaultValue: "Kiểm tra và xác nhận" }), description: t("bookeco.orders.timeline_confirm_copy", { defaultValue: "BookEco đang kiểm tra tồn kho và xác nhận thanh toán." }), date: status === "pending" ? t("bookeco.orders.waiting", { defaultValue: "Đang chờ" }) : t("bookeco.orders.updated", { defaultValue: "Đã cập nhật" }), active: status !== "cancelled" },
      { title: t("bookeco.orders.timeline_ship", { defaultValue: "Chuẩn bị giao hàng" }), description: t("bookeco.orders.timeline_ship_copy", { defaultValue: "Đơn hàng được đóng gói và chuyển qua đơn vị vận chuyển." }), date: ["shipped", "delivered"].includes(status) ? t("bookeco.orders.updated", { defaultValue: "Đã cập nhật" }) : t("bookeco.orders.waiting", { defaultValue: "Đang chờ" }), active: ["shipped", "delivered"].includes(status) },
      { title: status === "cancelled" ? t("bookeco.orders.timeline_cancelled", { defaultValue: "Đơn hàng đã hủy" }) : t("bookeco.orders.timeline_completed", { defaultValue: "Hoàn tất giao hàng" }), description: status === "cancelled" ? t("bookeco.orders.timeline_cancelled_copy", { defaultValue: "Đơn hàng đã được hủy theo yêu cầu của bạn." }) : t("bookeco.orders.timeline_completed_copy", { defaultValue: "Đơn hàng đã được giao tới địa chỉ nhận hàng." }), date: status === "delivered" ? t("bookeco.orders.done", { defaultValue: "Hoàn tất" }) : status === "cancelled" ? t("bookeco.orders.cancelled", { defaultValue: "Đã hủy" }) : t("bookeco.orders.waiting", { defaultValue: "Đang chờ" }), active: ["delivered", "cancelled"].includes(status) },
    ];
  }, [order?.status, t]);

  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, fee: 0, total: 0 };
    const subtotal = order.productIds.reduce((sum, item) => {
      const product = item.productId || {};
      const price = Number(product.price?.newPrice || product.price?.oldPrice || item.price || 0);
      return sum + price * Number(item.quantity || 1);
    }, 0);
    const total = Number(order.totalPrice || subtotal);
    return { subtotal, fee: Math.max(total - subtotal, 0), total };
  }, [order]);

  const handleCancel = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("bookeco.orders.cancel_title", { defaultValue: "Hủy đơn hàng này?" }),
      showCancelButton: true,
      confirmButtonText: t("bookeco.orders.cancel_confirm", { defaultValue: "Hủy đơn" }),
      cancelButtonText: t("cart.cancel", { defaultValue: "Quay lại" }),
    });
    if (!result.isConfirmed) return;
    await cancelOrder(id).unwrap();
    navigate("/orders");
  };

  if (loading) {
    return <section className="bookeco-desk-shell"><div className="bookeco-desk-container">{t("bookeco.orders.detail_loading", { defaultValue: "Đang tải chi tiết đơn hàng..." })}</div></section>;
  }

  if (error || !order) {
    return <section className="bookeco-desk-shell"><div className="bookeco-desk-container">{error || t("bookeco.orders.detail_missing", { defaultValue: "Không tìm thấy đơn hàng." })}</div></section>;
  }

  return (
    <section className="bookeco-desk-shell">
      <div className="bookeco-desk-container">
        <header className="bookeco-desk-header">
          <span className="bookeco-kicker">BookEco</span>
          <h1>{t("bookeco.orders.detail_title", { defaultValue: "Chi tiết đơn hàng" })}</h1>
        </header>

        <div className="bookeco-desk-order-layout">
          <div className="bookeco-desk-order-detail-shell">
            <div className="bookeco-desk-section-head">
              <div>
                <span className="bookeco-kicker">{t("bookeco.orders.order_code", { defaultValue: "Mã đơn hàng" })}</span>
                <h2 className="bookeco-desk-order-heading">#{order._id.slice(-8)}</h2>
              </div>
              <Link to="/orders" className="bookeco-desk-link-inline">{t("bookeco.orders.back_to_list", { defaultValue: "Quay lại lịch sử đơn" })}</Link>
            </div>

            <div className="bookeco-desk-order-items">
              {order.productIds.map((item) => {
                const product = item.productId || {};
                const price = Number(product.price?.newPrice || product.price?.oldPrice || item.price || 0);
                return (
                  <div key={item._id || product._id} className="bookeco-desk-order-row">
                    <img src={product.coverImage || "https://via.placeholder.com/120x172?text=Book"} alt={product.title || "Book"} />
                    <div className="bookeco-desk-detail-copy">
                      <span>{product.category?.name || t("books.category", { defaultValue: "Danh mục" })}</span>
                      <h3>{product.title || t("common.books", { defaultValue: "Sách trong đơn hàng" })}</h3>
                      <p>{product.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
                      <p>{t("books.quantity", { defaultValue: "Số lượng" })}: {item.quantity || 1}</p>
                    </div>
                    <div className="bookeco-desk-detail-price">
                      <small>{t("books.price", { defaultValue: "Giá" })}</small>
                      <strong>{price.toLocaleString("vi-VN")}đ</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <section style={{ marginTop: 48 }}>
              <div className="bookeco-desk-section-head">
                <h2 className="bookeco-desk-section-title">{t("bookeco.orders.timeline", { defaultValue: "Tiến trình đơn hàng" })}</h2>
              </div>
              <div className="bookeco-desk-detail-timeline">
                {timeline.map((item) => (
                  <div key={item.title} className="bookeco-desk-timeline-item" style={{ opacity: item.active ? 1 : 0.45 }}>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <span>{item.date}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="bookeco-desk-summary-card">
            <h3>{t("cart.order_summary", { defaultValue: "Tóm tắt đơn hàng" })}</h3>
            <div className="bookeco-desk-summary-table">
              <div><span>{t("cart.subtotal", { defaultValue: "Tạm tính" })}</span><strong>{totals.subtotal.toLocaleString("vi-VN")}đ</strong></div>
              <div><span>{t("cart.shipping", { defaultValue: "Phí giao hàng" })}</span><strong>{totals.fee.toLocaleString("vi-VN")}đ</strong></div>
            </div>
            <div className="bookeco-desk-summary-total">
              <span>{t("cart.total", { defaultValue: "Tổng thanh toán" })}</span>
              <strong>{totals.total.toLocaleString("vi-VN")}đ</strong>
            </div>

            <div className="bookeco-desk-summary-buttons">
              <Link to="/notifications" className="is-primary">{t("common.notifications", { defaultValue: "Xem thông báo" })}</Link>
              <Link to="/contact">{t("books.delivery.contact", { defaultValue: "Liên hệ hỗ trợ" })}</Link>
              {(order.status === "pending" || order.status === "processing") ? <button type="button" onClick={handleCancel}>{t("bookeco.orders.cancel_cta", { defaultValue: "Hủy đơn hàng" })}</button> : null}
            </div>

            <p className="bookeco-desk-summary-note">{t("bookeco.orders.note_small", { defaultValue: "Mọi cập nhật của đơn hàng sẽ tiếp tục xuất hiện trong phần thông báo và lịch sử đơn hàng." })}</p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;
