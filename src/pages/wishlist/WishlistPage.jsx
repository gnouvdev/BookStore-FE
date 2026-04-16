import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Heart, Search, ShoppingBag, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { fetchWishlist, removeFromWishlist } from "../../redux/features/wishlist/wishlistSlice";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import "../../styles/bookeco-desk.css";

const getBookPrice = (book) => {
  if (!book?.price) return 0;
  if (typeof book.price === "number") return book.price;
  return book.price.newPrice || book.price.oldPrice || 0;
};

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const WishlistPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const [query, setQuery] = useState("");
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const sorted = [...wishlistItems].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (!keyword) return sorted;
    return sorted.filter((book) =>
      [book.title, book.author?.name, book.category?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [query, wishlistItems]);

  const handleRemove = async (bookId) => {
    dispatch(removeFromWishlist(bookId));
  };

  const handleAddToCart = async (book) => {
    try {
      await addToCart({ bookId: book._id, quantity: 1 }).unwrap();
      Swal.fire({
        icon: "success",
        title: t("bookeco.cart.added_title", { defaultValue: "Đã thêm vào giỏ hàng" }),
        text: `"${book.title}" ${t("bookeco.cart.added_copy", { defaultValue: "đã sẵn sàng trong giỏ của bạn." })}`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (submitError) {
      Swal.fire({
        icon: "error",
        title: t("bookeco.cart.add_error", { defaultValue: "Không thể thêm vào giỏ" }),
        text: submitError?.data?.message || t("filter.pleaseTryAgainLater", { defaultValue: "Vui lòng thử lại sau." }),
      });
    }
  };

  return (
    <section className="bookeco-desk-shell">
      <div className="bookeco-desk-container">
        <header className="bookeco-desk-header">
          <span className="bookeco-kicker">BookEco</span>
          <h1>{t("common.wishlist", { defaultValue: "Tủ sách yêu thích" })}</h1>
        </header>

        <div className="bookeco-desk-layout">
          <aside className="bookeco-desk-sidebar">
            <nav className="bookeco-desk-nav">
              <Link to="/profile">{t("common.profile", { defaultValue: "Hồ sơ" })} <ChevronRight size={14} /></Link>
              <Link to="/orders">{t("common.orders", { defaultValue: "Đơn hàng" })} <ChevronRight size={14} /></Link>
              <Link to="/notifications">{t("common.notifications", { defaultValue: "Thông báo" })} <ChevronRight size={14} /></Link>
              <Link to="/wishlist" className="is-active">{t("common.wishlist", { defaultValue: "Yêu thích" })} <ChevronRight size={14} /></Link>
            </nav>

            <div className="bookeco-desk-quote">
              <p>{t("bookeco.wishlist.quote", { defaultValue: "Giữ lại những tựa sách bạn muốn quay lại, để mỗi lần chọn mua đều rõ ràng và có chủ đích hơn." })}</p>
              <span>BookEco Archive</span>
            </div>
          </aside>

          <div className="bookeco-desk-main">
            <div className="bookeco-desk-section-head">
              <h2 className="bookeco-desk-section-title">{t("bookeco.wishlist.saved_title", { defaultValue: "Những cuốn sách bạn đã lưu" })}</h2>
            </div>

            <div className="bookeco-desk-toolbar">
              <label className="bookeco-desk-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("bookeco.wishlist.search_placeholder", { defaultValue: "Tìm trong danh sách yêu thích" })}
                />
              </label>
              <div className="bookeco-desk-toolbar-note">
                <span>{wishlistItems.length}</span>
                <p>{t("bookeco.wishlist.toolbar_copy", { defaultValue: "tựa sách đang được lưu để xem lại sau" })}</p>
              </div>
            </div>

            {loading ? <div className="bookeco-desk-quote"><p>{t("bookeco.wishlist.loading", { defaultValue: "Đang tải danh sách yêu thích..." })}</p></div> : null}
            {error ? <div className="bookeco-desk-quote"><p>{error}</p></div> : null}

            {!loading && !error ? (
              filteredItems.length ? (
                <div className="bookeco-desk-shelf-grid">
                  {filteredItems.map((book) => (
                    <article key={book._id} className="bookeco-desk-shelf-card">
                      <Link to={`/books/${book._id}`} className="bookeco-desk-shelf-link">
                        <div className="bookeco-desk-shelf-cover">
                          <img src={book.coverImage} alt={book.title} />
                        </div>
                        <div className="bookeco-desk-shelf-copy">
                          <span>{book.category?.name || t("books.category", { defaultValue: "Danh mục" })}</span>
                          <h3 title={book.title}>{book.title}</h3>
                          <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
                          <strong>{formatPrice(getBookPrice(book))}</strong>
                        </div>
                      </Link>

                      <div className="bookeco-desk-shelf-actions">
                        <button type="button" className="bookeco-button-primary" onClick={() => handleAddToCart(book)} disabled={isAdding}>
                          <ShoppingBag size={15} /> {t("books.addToCart", { defaultValue: "Thêm vào giỏ hàng" })}
                        </button>
                        <button type="button" className="bookeco-desk-inline-button is-danger" onClick={() => handleRemove(book._id)}>
                          <Trash2 size={14} /> {t("wishlist.remove", { defaultValue: "Xóa khỏi yêu thích" })}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bookeco-desk-empty-panel">
                  <Heart size={28} />
                  <h3>{t("wishlist.empty", { defaultValue: "Danh sách yêu thích đang trống" })}</h3>
                  <p>{t("bookeco.wishlist.empty_copy", { defaultValue: "Hãy lưu lại những cuốn sách bạn muốn quay lại sau, rồi tiếp tục chọn mua khi đã sẵn sàng." })}</p>
                  <Link to="/product" className="bookeco-button-primary">{t("common.view_all", { defaultValue: "Xem tất cả" })}</Link>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WishlistPage;
