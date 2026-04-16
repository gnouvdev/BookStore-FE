import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock3, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useGetOrdersQuery } from "../../redux/features/orders/ordersApi";
import "../../styles/bookeco-thanks.css";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ThanksPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { data } = useGetOrdersQuery(currentUser?.email, {
    skip: !currentUser?.email,
  });

  const latestOrder = [...(data?.data || [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  )[0];

  const timeline = [
    {
      icon: Check,
      title: t("bookeco.thanks.timeline_received", { defaultValue: "Đơn hàng đã được ghi nhận" }),
      body: t("bookeco.thanks.timeline_received_copy", {
        defaultValue: "BookEco đã tiếp nhận yêu cầu và lưu lại đầy đủ thông tin cho đơn hàng của bạn.",
      }),
    },
    {
      icon: PackageCheck,
      title: t("bookeco.thanks.timeline_verified", { defaultValue: "Kiểm tra và xác nhận" }),
      body: t("bookeco.thanks.timeline_verified_copy", {
        defaultValue: "Cửa hàng sẽ rà lại tồn kho và chuẩn bị các đầu sách trong đơn của bạn.",
      }),
    },
    {
      icon: Truck,
      title: t("bookeco.thanks.timeline_shipping", { defaultValue: "Chuẩn bị giao hàng" }),
      body: t("bookeco.thanks.timeline_shipping_copy", {
        defaultValue: "Bạn sẽ nhận thêm cập nhật trong lịch sử đơn hàng và phần thông báo khi trạng thái thay đổi.",
      }),
    },
  ];

  return (
    <section className="bookeco-thanks-shell">
      <div className="bookeco-thanks-container">
        <div className="bookeco-thanks-hero">
          <div className="bookeco-thanks-copy">
            <span className="bookeco-kicker">BookEco</span>
            <h1>{t("bookeco.thanks.title", { defaultValue: "Đặt hàng thành công" })}</h1>
            <p>
              {t("bookeco.thanks.subtitle", {
                defaultValue: "Cảm ơn bạn đã hoàn tất đơn hàng. Tủ sách của bạn đang được chuẩn bị để sớm tiếp tục hành trình đọc.",
              })}
            </p>

            <div className="bookeco-thanks-meta">
              <article>
                <small>{t("bookeco.thanks.order_code", { defaultValue: "Mã đơn hàng" })}</small>
                <strong>{latestOrder?._id ? `#${latestOrder._id.slice(-8)}` : "#BOOKECO"}</strong>
              </article>
              <article>
                <small>{t("bookeco.thanks.order_date", { defaultValue: "Ngày ghi nhận" })}</small>
                <strong>{formatDate(latestOrder?.createdAt) || formatDate(new Date())}</strong>
              </article>
            </div>

            <div className="bookeco-thanks-actions">
              <Link to="/orders" className="bookeco-button-primary">
                <PackageCheck size={17} />
                {t("thank.View Orders", { defaultValue: "Xem đơn hàng" })}
              </Link>
              <Link to="/" className="bookeco-button-secondary">
                {t("thank.Return to Home", { defaultValue: "Quay lại trang chủ" })}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="bookeco-thanks-card">
            <div className="bookeco-thanks-badge">
              <Check size={22} />
            </div>
            <span className="bookeco-kicker">
              {t("bookeco.thanks.status_label", { defaultValue: "Trạng thái hiện tại" })}
            </span>
            <h2>{t("bookeco.thanks.status_title", { defaultValue: "Đơn hàng đang chờ xác nhận" })}</h2>
            <p>
              {t("bookeco.thanks.status_copy", {
                defaultValue: "BookEco sẽ kiểm tra lại đơn và cập nhật tiếp ở lịch sử đơn hàng ngay khi có thay đổi.",
              })}
            </p>
          </div>
        </div>

        <div className="bookeco-thanks-grid">
          <div className="bookeco-thanks-timeline">
            <div className="bookeco-thanks-section-head">
              <span className="bookeco-kicker">
                {t("bookeco.thanks.next_steps", { defaultValue: "Tiến trình tiếp theo" })}
              </span>
              <h2>{t("bookeco.thanks.next_title", { defaultValue: "Những gì sẽ diễn ra tiếp theo" })}</h2>
            </div>

            <div className="bookeco-thanks-steps">
              {timeline.map((item) => (
                <article key={item.title} className="bookeco-thanks-step">
                  <div className="bookeco-thanks-step-icon">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="bookeco-thanks-aside">
            <div className="bookeco-thanks-note-card">
              <small>
                <Clock3 size={14} />
                {t("bookeco.thanks.processing_label", { defaultValue: "Thời gian xử lý" })}
              </small>
              <p>
                {t("bookeco.thanks.processing_copy", {
                  defaultValue: "Đơn hàng thường được xác nhận trong vòng 1 đến 2 ngày làm việc, tùy thời điểm đặt mua.",
                })}
              </p>
            </div>

            <div className="bookeco-thanks-note-card">
              <small>
                <ShieldCheck size={14} />
                {t("bookeco.thanks.support_label", { defaultValue: "Theo dõi và hỗ trợ" })}
              </small>
              <p>
                {t("bookeco.thanks.support_copy", {
                  defaultValue: "Bạn có thể xem lại trạng thái đơn trong lịch sử đơn hàng hoặc đợi thông báo mới khi đơn được cập nhật.",
                })}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ThanksPage;
