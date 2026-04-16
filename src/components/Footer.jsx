import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const exploreLinks = [
    { label: t("bookeco.footer.collection", { defaultValue: "Tất cả sách" }), href: "/product" },
    { label: t("common.collections", { defaultValue: "Tuyển chọn" }), href: "/product?sort=rating" },
    { label: t("common.profile", { defaultValue: "Tài khoản" }), href: "/profile" },
  ];
  const supportLinks = [
    { label: t("bookeco.footer.about", { defaultValue: "Giới thiệu" }), href: "/about" },
    { label: t("bookeco.footer.contact", { defaultValue: "Liên hệ" }), href: "/contact" },
    { label: t("bookeco.footer.terms", { defaultValue: "Điều khoản" }), href: "/term-policy" },
  ];

  return (
    <footer className="bookeco-footer">
      <div className="bookeco-footer-inner">
        <div className="bookeco-footer-intro">
          <span className="bookeco-kicker">BookEco</span>
          <p className="bookeco-footer-brand">Curated books for patient readers.</p>
          <p className="bookeco-footer-copy">{t("bookeco.footer.copy", { defaultValue: "Lưu giữ giá trị của từng trang sách, với một không gian chọn sách có chủ đích và đủ tĩnh." })}</p>
        </div>

        <div className="bookeco-footer-columns">
          <div className="bookeco-footer-column">
            <span className="bookeco-footer-heading">{t("bookeco.footer.explore", { defaultValue: "Khám phá" })}</span>
            <div className="bookeco-footer-links">
              {exploreLinks.map((item) => (
                <Link key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bookeco-footer-column">
            <span className="bookeco-footer-heading">{t("bookeco.footer.support", { defaultValue: "Hỗ trợ" })}</span>
            <div className="bookeco-footer-links">
              {supportLinks.map((item) => (
                <Link key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bookeco-footer-meta-block">
          <span className="bookeco-footer-heading">{t("bookeco.footer.contact", { defaultValue: "Liên hệ" })}</span>
          <p className="bookeco-footer-note">BookEco Archive</p>
          <p className="bookeco-footer-note">hello@bookeco.vn</p>
          <p className="bookeco-footer-meta">© 2026 BookEco. {t("bookeco.footer.rights", { defaultValue: "Đã đăng ký mọi quyền." })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
