import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { clearCart } from "../../redux/features/cart/cartSlice";
import { useClearCartMutation, useGetCartQuery } from "../../redux/features/cart/cartApi";
import { useCreateOrderMutation } from "../../redux/features/orders/ordersApi";
import { useCreateVNPayUrlMutation, useGetPaymentMethodsQuery } from "../../redux/features/payments/paymentsApi";
import { useGetCurrentUserQuery, useGetUserProfileQuery } from "../../redux/features/users/userApi";
import { useApplyVoucherMutation, useValidateVoucherMutation } from "../../redux/features/voucher/voucherApi";
import baseUrl from "../../utils/baseURL";
import "../../styles/bookeco-commerce.css";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const Checkout = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const reduxCart = useSelector((state) => state.cart.cartItems || []);
  const { data: remoteCart } = useGetCartQuery(currentUser?.uid || null, { skip: !currentUser?.uid });
  const cartItems = remoteCart?.data?.items?.length
    ? remoteCart.data.items.map((item) => ({ ...item.book, quantity: item.quantity, linePrice: item.price }))
    : reduxCart;

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    country: "Việt Nam",
    zip: "",
    note: "",
  });

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [clearCartApi] = useClearCartMutation();
  const [createVNPayUrl] = useCreateVNPayUrlMutation();
  const [validateVoucher] = useValidateVoucherMutation();
  const [applyVoucher] = useApplyVoucherMutation();
  const { data: paymentMethodsData, isLoading: isLoadingPayments } = useGetPaymentMethodsQuery();
  const { isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const { data: userProfileData } = useGetUserProfileQuery(undefined, { skip: !currentUser });

  useEffect(() => {
    const user = userProfileData?.user;
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || currentUser?.displayName || "",
        email: user.email || currentUser?.email || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        country: user.address?.country || "Việt Nam",
        zip: user.address?.zip || "",
      }));
      return;
    }
    if (currentUser) {
      setFormData((prev) => ({ ...prev, name: currentUser.displayName || "", email: currentUser.email || "" }));
    }
  }, [currentUser, userProfileData]);

  const paymentMethods = paymentMethodsData?.data?.filter((item) => item.isActive) || [];

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => {
      const price = Number(item.linePrice || item.price?.newPrice || item.price?.oldPrice || item.price || 0);
      return sum + price * Number(item.quantity || 1);
    }, 0),
    [cartItems]
  );
  const shippingFee = subtotal > 500000 || subtotal === 0 ? 0 : 35000;
  const voucherDiscount = Number(appliedVoucher?.discount || 0);
  const total = Math.max(subtotal + shippingFee - voucherDiscount, 0);

  const validateStock = async () => {
    for (const item of cartItems) {
      const bookId = item._id || item.bookId;
      const response = await fetch(`${baseUrl}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const payload = await response.json();
      const book = payload.data || payload;
      if (!response.ok || Number(book.quantity || 0) < Number(item.quantity || 1)) {
        throw new Error(`${item.title || t("common.books", { defaultValue: "Sách" })} ${t("bookeco.checkout.stock_error", { defaultValue: "không còn đủ số lượng trong kho." })}`);
      }
    }
  };

  const handleVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const validation = await validateVoucher({ code: voucherCode, orderAmount: subtotal }).unwrap();
      setAppliedVoucher({ ...validation.data.voucher, discount: validation.data.discount });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("cart.invalid_voucher", { defaultValue: "Mã ưu đãi không hợp lệ" }),
        text: error?.data?.message || t("bookeco.checkout.voucher_error", { defaultValue: "Vui lòng kiểm tra lại mã ưu đãi." }),
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!cartItems.length) {
      Swal.fire({ icon: "warning", title: t("cart.your_cart_is_empty", { defaultValue: "Giỏ hàng đang trống" }) });
      return;
    }

    if (!selectedPayment) {
      Swal.fire({ icon: "warning", title: t("cart.please_select_a_payment_method", { defaultValue: "Hãy chọn phương thức thanh toán" }) });
      return;
    }

    try {
      await validateStock();

      let finalDiscount = voucherDiscount;
      if (appliedVoucher) {
        const applyResult = await applyVoucher({ code: appliedVoucher.code, orderAmount: subtotal }).unwrap();
        finalDiscount = Number(applyResult.data.discount || finalDiscount);
      }

      const orderItems = cartItems.map((item) => ({
        productId: item._id || item.bookId,
        quantity: item.quantity || 1,
      }));

      const shippingInfo = {
        name: formData.name,
        email: currentUser?.email,
        address: {
          street: formData.street,
          city: formData.city,
          country: formData.country,
          zip: formData.zip,
          zipcode: formData.zip,
        },
        phone: formData.phone,
      };

      const orderPayload = {
        name: formData.name,
        email: currentUser?.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          country: formData.country,
          zip: formData.zip,
        },
        productIds: orderItems,
        paymentMethod: selectedPayment._id,
        note: formData.note,
        voucherCode: appliedVoucher?.code,
        voucherDiscount: finalDiscount,
      };

      if (selectedPayment.code === "VNPAY") {
        const vnpayRes = await createVNPayUrl({
          orderItems,
          shippingInfo,
          paymentMethodId: selectedPayment._id,
          voucherCode: appliedVoucher?.code,
        }).unwrap();
        if (vnpayRes?.paymentUrl) {
          await clearCartApi();
          dispatch(clearCart());
          window.location.href = vnpayRes.paymentUrl;
          return;
        }
      }

      await createOrder(orderPayload).unwrap();
      await clearCartApi();
      dispatch(clearCart());
      window.location.href = "/orders/thanks";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("bookeco.checkout.submit_error_title", { defaultValue: "Không thể hoàn tất thanh toán" }),
        text: error?.data?.message || error?.message || t("filter.pleaseTryAgainLater", { defaultValue: "Vui lòng thử lại sau." }),
      });
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (isCreatingOrder || isLoadingPayments || isLoadingUser) {
    return (
      <section className="bookeco-commerce-shell">
        <div className="bookeco-empty-state">
          <div className="bookeco-single-spinner" />
          <p>{t("bookeco.checkout.loading", { defaultValue: "Đang chuẩn bị thanh toán..." })}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bookeco-commerce-shell">
      <div className="bookeco-commerce-container">
        <div className="bookeco-commerce-header">
          <div>
            <span className="bookeco-section-kicker">BookEco</span>
            <h1>{t("bookeco.checkout.title", { defaultValue: "Hoàn tất đơn hàng" })}</h1>
            <p>{t("bookeco.checkout.subtitle", { defaultValue: "Hoàn tất thông tin nhận hàng và rà lại đơn trước khi xác nhận." })}</p>
          </div>
        </div>

        <div className="bookeco-commerce-steps">
          <span>{t("bookeco.cart.step_selection", { defaultValue: "Chọn sách" })}</span>
          <span className="is-active">{t("bookeco.cart.step_review", { defaultValue: "Xác nhận" })}</span>
          <span>{t("bookeco.cart.step_payment", { defaultValue: "Thanh toán" })}</span>
        </div>

        <div className="bookeco-commerce-layout">
          <form className="bookeco-checkout-form" onSubmit={handleSubmit}>
            <div className="bookeco-checkout-card">
              <span className="bookeco-checkout-label">{t("cart.shipping_information", { defaultValue: "Thông tin giao hàng" })}</span>
              <h2>{t("bookeco.checkout.delivery_title", { defaultValue: "Địa chỉ nhận sách" })}</h2>
              <div className="bookeco-field-grid">
                <label><span>{t("cart.full_name", { defaultValue: "Họ và tên" })}</span><input value={formData.name} placeholder={t("bookeco.checkout.placeholder_name", { defaultValue: "Nguyễn Văn A" })} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></label>
                <label><span>{t("cart.email_address", { defaultValue: "Email" })}</span><input value={formData.email} placeholder={t("bookeco.checkout.placeholder_email", { defaultValue: "email@example.com" })} disabled /></label>
                <label><span>{t("cart.phone_number", { defaultValue: "Số điện thoại" })}</span><input value={formData.phone} placeholder={t("bookeco.checkout.placeholder_phone", { defaultValue: "09xx xxx xxx" })} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} required /></label>
                <label className="is-wide"><span>{t("cart.address", { defaultValue: "Địa chỉ" })}</span><input value={formData.street} placeholder={t("bookeco.checkout.placeholder_address", { defaultValue: "Số nhà, tên đường, phường/xã" })} onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))} required /></label>
                <label><span>{t("cart.city", { defaultValue: "Thành phố" })}</span><input value={formData.city} placeholder={t("bookeco.checkout.placeholder_city", { defaultValue: "Thành phố" })} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} required /></label>
                <label><span>{t("cart.country", { defaultValue: "Quốc gia" })}</span><input value={formData.country} placeholder={t("bookeco.checkout.placeholder_country", { defaultValue: "Việt Nam" })} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} /></label>
                <label><span>{t("cart.zipcode", { defaultValue: "Mã bưu chính" })}</span><input value={formData.zip} placeholder={t("bookeco.checkout.placeholder_zip", { defaultValue: "700000" })} onChange={(e) => setFormData((p) => ({ ...p, zip: e.target.value }))} /></label>
                <label className="is-wide"><span>{t("bookeco.checkout.note", { defaultValue: "Ghi chú cho đơn hàng" })}</span><textarea value={formData.note} placeholder={t("bookeco.checkout.placeholder_note", { defaultValue: "Bạn có thể bổ sung ghi chú cho người giao hàng hoặc cửa hàng tại đây." })} onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))} /></label>
              </div>
            </div>

            <div className="bookeco-checkout-card">
              <span className="bookeco-checkout-label">{t("cart.payment_method", { defaultValue: "Phương thức thanh toán" })}</span>
              <h2>{t("bookeco.checkout.payment_title", { defaultValue: "Chọn cách thanh toán" })}</h2>
              <div className="bookeco-payment-list">
                {paymentMethods.map((method) => (
                  <button
                    key={method._id}
                    type="button"
                    className={`bookeco-payment-item ${selectedPayment?._id === method._id ? "is-selected" : ""}`}
                    onClick={() => setSelectedPayment(method)}
                  >
                    <strong>{method.name}</strong>
                    <span>{method.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bookeco-checkout-card">
              <span className="bookeco-checkout-label">{t("cart.enter_voucher", { defaultValue: "Mã ưu đãi" })}</span>
              <h2>{t("bookeco.checkout.voucher_title", { defaultValue: "Áp dụng ưu đãi" })}</h2>
              <div className="bookeco-voucher-row">
                <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder={t("cart.enter_voucher", { defaultValue: "Nhập mã ưu đãi" })} />
                <button type="button" className="bookeco-button-secondary" onClick={handleVoucher}>{t("cart.apply", { defaultValue: "Áp dụng" })}</button>
              </div>
              {appliedVoucher ? <p>{t("bookeco.checkout.voucher_ok", { defaultValue: "Mã ưu đãi đã được áp dụng vào đơn hàng." })}</p> : null}
            </div>

            <div className="bookeco-checkout-card">
              <span className="bookeco-checkout-label">{t("cart.shopping_items", { defaultValue: "Sản phẩm" })}</span>
              <h2>{t("bookeco.checkout.review_title", { defaultValue: "Rà lại các đầu sách" })}</h2>
              <div className="bookeco-accessory-list">
                {cartItems.map((item) => {
                  const price = Number(item.linePrice || item.price?.newPrice || item.price?.oldPrice || item.price || 0);
                  return (
                    <div key={item._id || item.bookId} className="bookeco-accessory-card">
                      <small>{item.category?.name || t("books.category", { defaultValue: "Danh mục" })}</small>
                      <strong>{item.title}</strong>
                      <p>{t("books.quantity", { defaultValue: "Số lượng" })}: {item.quantity || 1} · {formatPrice(price)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>

          <aside className="bookeco-summary-card">
            <small>{t("cart.order_summary", { defaultValue: "Tóm tắt đơn hàng" })}</small>
            <h2>{t("bookeco.checkout.summary_title", { defaultValue: "Tóm tắt thanh toán" })}</h2>
            <div className="bookeco-summary-table">
              <div><span>{t("cart.subtotal", { defaultValue: "Tạm tính" })}</span><strong>{formatPrice(subtotal)}</strong></div>
              <div><span>{t("cart.shipping", { defaultValue: "Vận chuyển" })}</span><strong>{shippingFee ? formatPrice(shippingFee) : t("cart.free", { defaultValue: "Miễn phí" })}</strong></div>
              <div><span>{t("cart.apply", { defaultValue: "Ưu đãi" })}</span><strong>{voucherDiscount ? `- ${formatPrice(voucherDiscount)}` : formatPrice(0)}</strong></div>
            </div>
            <div className="bookeco-summary-total">
              <span>{t("cart.total", { defaultValue: "Tổng thanh toán" })}</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="bookeco-summary-buttons">
              <button type="submit" className="is-primary" onClick={handleSubmit}>
                <CreditCard size={18} />
                {t("cart.place_order", { defaultValue: "Xác nhận thanh toán" })}
              </button>
              <a href="/cart">{t("common.cart", { defaultValue: "Quay lại giỏ hàng" })}</a>
            </div>
            <div className="bookeco-accessory-list" style={{ marginTop: 20 }}>
              <div className="bookeco-accessory-card"><small><Truck size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />{t("cart.shipping", { defaultValue: "Vận chuyển" })}</small><p>{t("bookeco.checkout.shipping_note", { defaultValue: "Giao nhanh toàn quốc, miễn phí với đơn đủ điều kiện." })}</p></div>
              <div className="bookeco-accessory-card"><small><ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />{t("cart.secure_payment", { defaultValue: "Thanh toán an toàn" })}</small><p>{t("bookeco.checkout.security_note", { defaultValue: "Thông tin thanh toán được mã hóa trước khi gửi tới hệ thống." })}</p></div>
            </div>
            <p className="bookeco-summary-note">{t("bookeco.checkout.note_small", { defaultValue: "Thông tin đơn hàng sẽ được lưu trong lịch sử để bạn theo dõi sau khi xác nhận." })}</p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
