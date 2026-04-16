import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Gift, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemQuantityMutation,
} from "../../redux/features/cart/cartApi";
import "../../styles/bookeco-commerce.css";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const CartPage = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const reduxUser = useSelector((state) => state.auth.user);
  const user = currentUser || reduxUser;

  const { data: cart, isLoading, isError, error } = useGetCartQuery(user?.uid || null, {
    skip: !user?.uid,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [updateCartItemQuantity] = useUpdateCartItemQuantityMutation();

  const cartItems = cart?.data?.items || [];
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cartItems]
  );
  const shipping = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleChangeQuantity = async (bookId, nextQuantity) => {
    if (nextQuantity < 1) {
      await handleRemoveItem(bookId);
      return;
    }

    try {
      await updateCartItemQuantity({ bookId, quantity: nextQuantity }).unwrap();
    } catch (submitError) {
      Swal.fire({
        icon: "error",
        title: t("cart.error", { defaultValue: "Lỗi" }),
        text: submitError?.data?.message || t("bookeco.cart.update_error", { defaultValue: "Không thể cập nhật giỏ hàng lúc này." }),
      });
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      await removeFromCart(bookId).unwrap();
    } catch (submitError) {
      Swal.fire({
        icon: "error",
        title: t("cart.error", { defaultValue: "Lỗi" }),
        text: submitError?.data?.message || t("bookeco.cart.remove_error", { defaultValue: "Không thể xóa sách khỏi giỏ hàng." }),
      });
    }
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("cart.confirm_clear", { defaultValue: "Xóa toàn bộ giỏ hàng?" }),
      text: t("bookeco.cart.clear_copy", { defaultValue: "Thao tác này sẽ gỡ toàn bộ đầu sách đang chờ thanh toán." }),
      showCancelButton: true,
      confirmButtonText: t("cart.clear_cart", { defaultValue: "Xóa giỏ hàng" }),
      cancelButtonText: t("cart.cancel", { defaultValue: "Quay lại" }),
    });

    if (!result.isConfirmed) return;
    await clearCart().unwrap();
  };

  if (!user) {
    return (
      <section className="bookeco-commerce-shell">
        <div className="bookeco-empty-state">
          <span className="bookeco-section-kicker">BookEco</span>
          <h1>{t("bookeco.cart.login_title", { defaultValue: "Đăng nhập để mở tủ sách đang chọn" })}</h1>
          <p>{t("bookeco.cart.login_copy", { defaultValue: "Giỏ hàng được lưu theo tài khoản để bạn tiếp tục chọn sách trên mọi thiết bị." })}</p>
          <Link to="/login" className="bookeco-primary-link">{t("common.login", { defaultValue: "Đăng nhập" })}</Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="bookeco-commerce-shell">
        <div className="bookeco-empty-state">
          <div className="bookeco-single-spinner" />
          <p>{t("bookeco.cart.loading", { defaultValue: "Đang mở giỏ hàng của bạn..." })}</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bookeco-commerce-shell">
        <div className="bookeco-empty-state">
          <span className="bookeco-section-kicker">BookEco</span>
          <h1>{t("bookeco.cart.error_title", { defaultValue: "Không tải được giỏ hàng" })}</h1>
          <p>{error?.data?.message || error?.message || t("filter.pleaseTryAgainLater", { defaultValue: "Vui lòng thử lại sau." })}</p>
        </div>
      </section>
    );
  }

  if (!cartItems.length) {
    return (
      <section className="bookeco-commerce-shell">
        <div className="bookeco-empty-state">
          <span className="bookeco-section-kicker">BookEco</span>
          <h1>{t("cart.cart_empty", { defaultValue: "Giỏ hàng của bạn đang trống" })}</h1>
          <p>{t("cart.cart_empty_description", { defaultValue: "Chọn vài đầu sách bạn muốn giữ lại cho đơn hàng tiếp theo." })}</p>
          <Link to="/product" className="bookeco-primary-link">{t("cart.continue_shopping", { defaultValue: "Tiếp tục mua sắm" })}</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bookeco-commerce-shell">
      <div className="bookeco-commerce-container">
        <Link to="/product" className="bookeco-single-backlink">
          <ArrowLeft size={16} />
          {t("cart.continue_shopping", { defaultValue: "Tiếp tục mua sắm" })}
        </Link>

        <div className="bookeco-commerce-header">
          <div>
            <span className="bookeco-section-kicker">BookEco</span>
            <h1>{t("bookeco.cart.title", { defaultValue: "Bộ sưu tập đang chọn" })}</h1>
            <p>{t("bookeco.cart.subtitle", { defaultValue: "Rà lại các đầu sách trước khi chuyển sang bước thanh toán." })}</p>
          </div>
          <button type="button" className="bookeco-ghost-action" onClick={handleClearCart} disabled={isClearing}>
            <Trash2 size={16} />
            {isClearing ? t("bookeco.cart.clearing", { defaultValue: "Đang xóa" }) : t("cart.clear_cart", { defaultValue: "Xóa giỏ hàng" })}
          </button>
        </div>

        <div className="bookeco-commerce-steps">
          <span className="is-active">{t("bookeco.cart.step_selection", { defaultValue: "Selection" })}</span>
          <span>{t("bookeco.cart.step_review", { defaultValue: "Review" })}</span>
          <span>{t("bookeco.cart.step_payment", { defaultValue: "Authentication" })}</span>
        </div>

        <div className="bookeco-commerce-layout">
          <div className="bookeco-cart-list">
            {cartItems.map((item) => (
              <article key={item.book?._id || item._id} className="bookeco-cart-card">
                <Link to={`/books/${item.book._id}`} className="bookeco-cart-cover-link">
                  <img src={item.book.coverImage} alt={item.book.title} className="bookeco-cart-cover" />
                </Link>

                <div className="bookeco-cart-copy">
                  <span className="bookeco-cart-category">{item.book.category?.name || t("books.category", { defaultValue: "Danh mục" })}</span>
                  <Link to={`/books/${item.book._id}`} className="bookeco-cart-title">{item.book.title}</Link>
                  <p>{item.book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
                  <strong className="bookeco-cart-price">{formatPrice(item.price)}</strong>
                </div>

                <div className="bookeco-cart-actions">
                  <div className="bookeco-quantity-picker">
                    <button type="button" onClick={() => handleChangeQuantity(item.book._id, item.quantity - 1)}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => handleChangeQuantity(item.book._id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <button type="button" className="bookeco-inline-remove" onClick={() => handleRemoveItem(item.book._id)}>
                    {t("cart.remove", { defaultValue: "Xóa" })}
                  </button>
                </div>
              </article>
            ))}

            <div className="bookeco-giftwrap-card">
              <Gift size={22} />
              <div className="bookeco-giftwrap-copy">
                <span className="bookeco-cart-category">{t("bookeco.cart.gift_label", { defaultValue: "Gói quà" })}</span>
                <strong>{t("bookeco.cart.gift_title", { defaultValue: "Thêm lời nhắn và cách gói trang nhã cho đơn hàng" })}</strong>
                <p>{t("bookeco.cart.gift_copy", { defaultValue: "Bạn có thể bổ sung ghi chú ở bước thanh toán nếu muốn đơn hàng được chuẩn bị như một món quà." })}</p>
              </div>
            </div>

            <div className="bookeco-accessory-card">
              <small>{t("bookeco.cart.more_title", { defaultValue: "Khám phá thêm" })}</small>
              <strong>{t("bookeco.cart.more_copy", { defaultValue: "Sau khi hoàn tất đơn này, bạn có thể quay lại để tìm thêm các đầu sách đồng điệu." })}</strong>
              <p>{t("bookeco.cart.more_note", { defaultValue: "Giữ bố cục gọn như thiết kế và không chen quá nhiều khối phụ vào màn hình giỏ hàng." })}</p>
            </div>
          </div>

          <aside className="bookeco-summary-card">
            <small>{t("cart.order_summary", { defaultValue: "Tóm tắt đơn hàng" })}</small>
            <h2>{t("bookeco.cart.summary_title", { defaultValue: "Order Summary" })}</h2>
            <div className="bookeco-summary-table">
              <div><span>{t("cart.subtotal", { defaultValue: "Tạm tính" })}</span><strong>{formatPrice(subtotal)}</strong></div>
              <div><span>{t("cart.shipping", { defaultValue: "Vận chuyển" })}</span><strong>{shipping === 0 ? t("cart.free", { defaultValue: "Miễn phí" }) : formatPrice(shipping)}</strong></div>
            </div>
            <div className="bookeco-summary-total">
              <span>{t("cart.total", { defaultValue: "Tổng cộng" })}</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="bookeco-summary-buttons">
              <Link to="/checkout" className="is-primary">
                <ShoppingBag size={18} />
                {t("cart.checkout", { defaultValue: "Thanh toán" })}
              </Link>
              <Link to="/product">{t("cart.continue_shopping", { defaultValue: "Tiếp tục mua sắm" })}</Link>
            </div>
            <p className="bookeco-summary-note">{t("bookeco.cart.note", { defaultValue: "Đơn từ 500.000đ được áp dụng giao hàng miễn phí toàn quốc." })}</p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
