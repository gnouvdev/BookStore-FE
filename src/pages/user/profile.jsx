import { Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Camera, ChevronRight, PencilLine, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { uploadToCloudinary } from "../../utils/uploadService";
import { useGetUserProfileQuery, useUpdateProfileMutation } from "../../redux/features/users/userApi";
import { useGetOrdersQuery } from "../../redux/features/orders/ordersApi";
import "../../styles/bookeco-desk.css";
import "../../styles/bookeco-commerce.css";

const Profile = () => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser, loading, token } = useAuth();
  const { data: profileResponse, isLoading: isLoadingProfile } = useGetUserProfileQuery(undefined, {
    skip: !token,
  });
  const { data: ordersResponse } = useGetOrdersQuery(currentUser?.email, {
    skip: !currentUser?.email,
  });
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const profile = profileResponse?.user || {};
  const orders = ordersResponse?.data || [];
  const recentAcquisitions = orders.slice(0, 3);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: { street: "", city: "", country: "", zip: "" },
    photoURL: "",
  });

  useEffect(() => {
    if (!profile || !Object.keys(profile).length) return;
    setFormData({
      fullName: profile.fullName || currentUser?.displayName || "",
      email: profile.email || currentUser?.email || "",
      phone: profile.phone || "",
      address: {
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        country: profile.address?.country || "",
        zip: profile.address?.zip || "",
      },
      photoURL: profile.photoURL || currentUser?.photoURL || "",
    });
  }, [profile, currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFormData((prev) => ({ ...prev, photoURL: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let nextPhotoURL = formData.photoURL;
      if (selectedFile) {
        nextPhotoURL = await uploadToCloudinary(selectedFile);
      }
      const response = await updateProfile({ ...formData, photoURL: nextPhotoURL }).unwrap();
      const updatedUser = {
        ...currentUser,
        ...response.user,
        displayName: response.user.fullName || currentUser?.displayName,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify({ ...updatedUser, token: localStorage.getItem("token") }));
      setIsEditing(false);
      toast.success(t("bookeco.profile.saved", { defaultValue: "Đã cập nhật hồ sơ người dùng." }));
    } catch (submitError) {
      toast.error(submitError?.data?.message || t("bookeco.profile.save_error", { defaultValue: "Không thể cập nhật hồ sơ lúc này." }));
    }
  };

  if (!loading && (!currentUser || !token)) {
    return <Navigate to="/login" replace />;
  }

  if ((loading || isLoadingProfile) && !profile.email) {
    return (
      <section className="bookeco-desk-shell">
        <div className="bookeco-desk-container">{t("bookeco.profile.loading", { defaultValue: "Đang tải hồ sơ..." })}</div>
      </section>
    );
  }

  return (
    <section className="bookeco-desk-shell">
      <div className="bookeco-desk-container">
        <header className="bookeco-desk-header">
          <span className="bookeco-kicker">BookEco</span>
          <h1>{t("bookeco.profile.title", { defaultValue: "Không gian độc giả" })}</h1>
        </header>

        <div className="bookeco-desk-layout">
          <aside className="bookeco-desk-sidebar">
            <nav className="bookeco-desk-nav">
              <Link to="/profile" className="is-active">{t("common.profile", { defaultValue: "Hồ sơ" })} <ChevronRight size={14} /></Link>
              <Link to="/orders">{t("common.orders", { defaultValue: "Đơn hàng" })} <ChevronRight size={14} /></Link>
              <Link to="/notifications">{t("common.notifications", { defaultValue: "Thông báo" })} <ChevronRight size={14} /></Link>
              <Link to="/wishlist">{t("common.wishlist", { defaultValue: "Yêu thích" })} <ChevronRight size={14} /></Link>
            </nav>

            <div className="bookeco-desk-quote">
              <p>{t("bookeco.profile.quote", { defaultValue: "Một tủ sách đẹp không chỉ nằm ở số lượng, mà ở cách nó phản chiếu gu đọc của người sở hữu." })}</p>
              <span>BookEco Notes</span>
            </div>
          </aside>

          <div className="bookeco-desk-main">
            <section className="bookeco-desk-profile-hero">
              <div className="bookeco-desk-portrait-frame">
                <img src={formData.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} alt={formData.fullName || "User"} />
              </div>

              <div className="bookeco-desk-profile-copy">
                <div className="bookeco-desk-profile-line">{t("bookeco.profile.badge", { defaultValue: "Reader Profile" })}</div>
                <div className="bookeco-desk-profile-name">{formData.fullName || t("bookeco.profile.fallback_name", { defaultValue: "Độc giả BookEco" })}</div>
                <div className="bookeco-desk-profile-role">{formData.phone ? `${t("cart.phone_number", { defaultValue: "Số điện thoại" })}: ${formData.phone}` : t("bookeco.profile.role", { defaultValue: "Độc giả đang xây dựng tủ sách cá nhân" })}</div>
                <div className="bookeco-desk-profile-sub">{t("bookeco.profile.subline", { defaultValue: "Thông tin tài khoản được đồng bộ cho các đơn hàng tiếp theo" })}</div>

                <div className="bookeco-desk-badges">
                  <div>
                    <span>{t("bookeco.profile.member_rank", { defaultValue: "Hạng thành viên" })}</span>
                    <strong>{t("bookeco.profile.member_value", { defaultValue: "Reader's Circle" })}</strong>
                  </div>
                  <div>
                    <span>{t("bookeco.profile.account_status", { defaultValue: "Trạng thái tài khoản" })}</span>
                    <strong>{t("bookeco.profile.account_value", { defaultValue: "Đã xác thực" })}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="bookeco-desk-section-head">
                <h2 className="bookeco-desk-section-title">{t("bookeco.profile.stats_title", { defaultValue: "Tổng quan hồ sơ" })}</h2>
                <button type="button" className="bookeco-desk-inline-button" onClick={() => setIsEditing((prev) => !prev)}>
                  <PencilLine size={14} /> {isEditing ? t("bookeco.profile.close_edit", { defaultValue: "Đóng chỉnh sửa" }) : t("bookeco.profile.edit", { defaultValue: "Chỉnh sửa hồ sơ" })}
                </button>
              </div>

              <div className="bookeco-desk-stats">
                <article className="bookeco-desk-stat-card">
                  <span>{t("common.orders", { defaultValue: "Đơn hàng" })}</span>
                  <strong>{orders.length}</strong>
                  <p>{t("bookeco.profile.stats_orders", { defaultValue: "Số đơn bạn đã tạo và theo dõi trong hệ thống BookEco." })}</p>
                </article>
                <article className="bookeco-desk-stat-card">
                  <span>{t("bookeco.profile.address_status", { defaultValue: "Địa chỉ giao hàng" })}</span>
                  <strong>{formData.address.street ? t("bookeco.profile.ready", { defaultValue: "Sẵn sàng" }) : t("bookeco.profile.missing", { defaultValue: "Thiếu" })}</strong>
                  <p>{t("bookeco.profile.stats_address", { defaultValue: "Hoàn thiện địa chỉ giúp lần thanh toán tiếp theo diễn ra nhanh hơn." })}</p>
                </article>
                <article className="bookeco-desk-stat-card is-dark">
                  <span>{t("bookeco.profile.profile_state", { defaultValue: "Trạng thái hồ sơ" })}</span>
                  <strong>{profile.email ? t("bookeco.profile.active", { defaultValue: "Active" }) : t("bookeco.profile.draft", { defaultValue: "Draft" })}</strong>
                  <p>{profile.email ? t("bookeco.profile.stats_active", { defaultValue: "Thông tin đã đủ để sẵn sàng cho các đơn hàng tiếp theo." }) : t("bookeco.profile.stats_draft", { defaultValue: "Hồ sơ đang chờ được bổ sung thêm thông tin." })}</p>
                </article>
              </div>
            </section>

            <section>
              <div className="bookeco-desk-section-head">
                <h2 className="bookeco-desk-section-title">{t("bookeco.profile.info_title", { defaultValue: "Thông tin cá nhân" })}</h2>
              </div>

              <form className="bookeco-account-form" onSubmit={handleSubmit}>
                <div className="bookeco-desk-form-shell">
                  <div className="bookeco-field-grid">
                    <label className="is-wide"><span>{t("cart.full_name", { defaultValue: "Họ và tên" })}</span><input name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} /></label>
                    <label><span>{t("cart.email_address", { defaultValue: "Email" })}</span><input name="email" value={formData.email} disabled /></label>
                    <label><span>{t("cart.phone_number", { defaultValue: "Số điện thoại" })}</span><input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} /></label>
                    <label className="is-wide"><span>{t("cart.address", { defaultValue: "Địa chỉ" })}</span><input name="address.street" value={formData.address.street} onChange={handleChange} disabled={!isEditing} /></label>
                    <label><span>{t("cart.city", { defaultValue: "Thành phố" })}</span><input name="address.city" value={formData.address.city} onChange={handleChange} disabled={!isEditing} /></label>
                    <label><span>{t("cart.country", { defaultValue: "Quốc gia" })}</span><input name="address.country" value={formData.address.country} onChange={handleChange} disabled={!isEditing} /></label>
                    <label><span>{t("cart.zipcode", { defaultValue: "Mã bưu chính" })}</span><input name="address.zip" value={formData.address.zip} onChange={handleChange} disabled={!isEditing} /></label>
                    {isEditing ? (
                      <label>
                        <span>{t("bookeco.profile.avatar", { defaultValue: "Ảnh đại diện" })}</span>
                        <label className="bookeco-button-secondary" style={{ cursor: "pointer" }}>
                          <Camera size={14} /> {t("bookeco.profile.choose_image", { defaultValue: "Chọn ảnh" })}
                          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                        </label>
                      </label>
                    ) : null}
                  </div>
                </div>

                {isEditing ? (
                  <div className="bookeco-account-actions">
                    <button type="submit" className="bookeco-button-primary" disabled={isSaving}>
                      <Save size={14} /> {isSaving ? t("bookeco.profile.saving", { defaultValue: "Đang lưu..." }) : t("bookeco.profile.save", { defaultValue: "Lưu thay đổi" })}
                    </button>
                  </div>
                ) : null}
              </form>
            </section>

            <section>
              <div className="bookeco-desk-section-head">
                <h2 className="bookeco-desk-section-title">{t("bookeco.profile.recent_orders", { defaultValue: "Đơn hàng gần đây" })}</h2>
                <Link to="/orders" className="bookeco-desk-link-inline">{t("common.view_all", { defaultValue: "Xem toàn bộ" })}</Link>
              </div>

              <div className="bookeco-desk-list">
                {recentAcquisitions.length ? (
                  recentAcquisitions.map((order) => {
                    const item = order.productIds?.[0];
                    const product = item?.productId;
                    return (
                      <Link key={order._id} to={`/orders/${order._id}`} className="bookeco-desk-list-item bookeco-link-reset">
                        <img src={product?.coverImage || "https://via.placeholder.com/76x106?text=Book"} alt={product?.title || "Book"} />
                        <div className="bookeco-desk-list-copy">
                          <small>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</small>
                          <h3>{product?.title || `#${order._id.slice(-6)}`}</h3>
                          <p>{product?.author?.name || t("bookeco.profile.order_fallback", { defaultValue: "Đơn hàng trong tủ sách của bạn" })}</p>
                        </div>
                        <div className="bookeco-desk-list-price">
                          <strong>{Number(order.totalPrice || 0).toLocaleString("vi-VN")}đ</strong>
                          <small>#{order._id.slice(-8)}</small>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="bookeco-desk-quote"><p>{t("bookeco.profile.no_orders", { defaultValue: "Bạn chưa có đơn hàng nào để hiển thị ở đây." })}</p></div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
