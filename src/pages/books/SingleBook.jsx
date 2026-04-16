import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import BookRecommendations from "../../components/BookRecommendations";
import { useAuth } from "../../context/AuthContext";
import { useAddToCartMutation } from "../../redux/features/cart/cartApi";
import { useGetBookByIdQuery } from "../../redux/features/books/booksApi";
import { useCreateReviewMutation, useGetReviewsQuery } from "../../redux/features/reviews/reviewsApi";
import "../../styles/bookeco-single-book.css";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getCurrentPrice = (book) => Number(book?.price?.newPrice ?? book?.price ?? 0);
const getOriginalPrice = (book) => Number(book?.price?.oldPrice ?? 0);
const getReviewerId = (user) => user?._id || user?.id || user?.uid || user?.userId;

const StarRow = ({ value }) => (
  <div className="bookeco-single-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} size={16} fill={star <= value ? "currentColor" : "none"} />
    ))}
  </div>
);

const SingleBook = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: book, isLoading, error } = useGetBookByIdQuery(id, {
    skip: !id || id === "undefined",
  });
  const { data: reviewsData } = useGetReviewsQuery(id, {
    skip: !id || id === "undefined",
  });
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const reviews = useMemo(() => {
    if (Array.isArray(reviewsData?.data)) return reviewsData.data;
    if (Array.isArray(reviewsData?.reviews)) return reviewsData.reviews;
    if (Array.isArray(reviewsData)) return reviewsData;
    if (Array.isArray(book?.reviews)) return book.reviews;
    return [];
  }, [book?.reviews, reviewsData]);

  const stock = Number(book?.quantity || 0);
  const currentPrice = getCurrentPrice(book);
  const originalPrice = getOriginalPrice(book);
  const ratingValue = useMemo(() => {
    if (reviews.length) {
      return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
    }
    return Number(book?.rating || book?.averageRating || 0);
  }, [book?.averageRating, book?.rating, reviews]);
  const reviewCount = Number(book?.numReviews || book?.reviewCount || reviews.length || 0);
  const currentUserId = getReviewerId(currentUser);
  const canReview = currentUserId && !reviews.some((review) => getReviewerId(review.user) === currentUserId);

  const details = [
    { label: t("bookeco.book.pages", { defaultValue: "Số trang" }), value: book?.pages || t("bookeco.common.updating", { defaultValue: "Đang cập nhật" }) },
    { label: t("bookeco.book.binding", { defaultValue: "Bìa sách" }), value: book?.binding || t("bookeco.book.hardcover", { defaultValue: "Bìa cứng" }) },
    { label: t("bookeco.book.publish_date", { defaultValue: "Ngày xuất bản" }), value: book?.publish || t("bookeco.common.updating", { defaultValue: "Đang cập nhật" }) },
    { label: t("bookeco.book.size", { defaultValue: "Kích thước" }), value: book?.dimensions || "14 x 20.5 cm" },
  ];

  const handleAddToCart = async () => {
    if (!book?._id) return;
    try {
      await addToCart({ bookId: book._id, quantity }).unwrap();
      Swal.fire({
        icon: "success",
        title: t("bookeco.cart.added_title", { defaultValue: "Đã thêm vào giỏ hàng" }),
        text: `"${book.title}" ${t("bookeco.cart.added_copy", { defaultValue: "đã sẵn sàng trong giỏ của bạn." })}`,
        timer: 1600,
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

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      Swal.fire({ icon: "warning", title: t("bookeco.review.login_required", { defaultValue: "Bạn cần đăng nhập để đánh giá." }) });
      return;
    }

    if (!rating) {
      Swal.fire({ icon: "warning", title: t("bookeco.review.pick_rating", { defaultValue: "Hãy chọn số sao trước khi gửi." }) });
      return;
    }

    try {
      await createReview({ bookId: id, rating, comment }).unwrap();
      setRating(0);
      setComment("");
      Swal.fire({
        icon: "success",
        title: t("bookeco.review.thanks", { defaultValue: "Cảm ơn bạn đã để lại đánh giá" }),
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (submitError) {
      Swal.fire({
        icon: "error",
        title: t("bookeco.review.submit_error", { defaultValue: "Không thể gửi đánh giá" }),
        text: submitError?.data?.message || t("filter.pleaseTryAgainLater", { defaultValue: "Vui lòng thử lại sau." }),
      });
    }
  };

  if (isLoading) {
    return (
      <section className="bookeco-single-shell">
        <div className="bookeco-single-loading">
          <div className="bookeco-single-spinner" />
          <p>{t("books.loading", { defaultValue: "Đang tải..." })}</p>
        </div>
      </section>
    );
  }

  if (error || !book?._id) {
    return (
      <section className="bookeco-single-shell">
        <div className="bookeco-single-error">
          <span className="bookeco-kicker">{t("common.books", { defaultValue: "Sách" })}</span>
          <h1>{t("bookeco.book.not_found", { defaultValue: "Không tìm thấy cuốn sách này" })}</h1>
          <p>{error?.data?.message || t("bookeco.book.not_found_copy", { defaultValue: "Liên kết có thể đã thay đổi hoặc sản phẩm hiện không còn khả dụng." })}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bookeco-single-shell">
      <div className="bookeco-single-container">
        <Link to="/product" className="bookeco-single-backlink">
          <ArrowLeft size={16} />
          {t("bookeco.book.back_to_list", { defaultValue: "Quay lại danh sách sách" })}
        </Link>

        <div className="bookeco-single-hero-figma">
          <div className="bookeco-single-artifact">
            <div className="bookeco-single-cover-frame">
              <img src={book.coverImage} alt={book.title} className="bookeco-single-cover" />
            </div>
            <div className="bookeco-single-miniatures">
              {[book.coverImage, book.coverImage, book.coverImage].map((src, index) => (
                <div className="bookeco-single-miniature" key={`${src}-${index}`}>
                  <img src={src} alt={`${book.title} ${index + 1}`} />
                </div>
              ))}
            </div>
            <span className="bookeco-single-note">{t("bookeco.book.archived_note", { defaultValue: "Tựa sách được lưu trữ trong bộ chọn lọc của BookEco." })}</span>
          </div>

          <div className="bookeco-single-info">
            <div className="bookeco-single-breadcrumbs">
              <span>{t("common.home", { defaultValue: "Trang chủ" })}</span>
              <span />
              <span>{book.category?.name || t("common.books", { defaultValue: "Sách" })}</span>
            </div>

            <h1>{book.title}</h1>
            <div className="bookeco-single-author-line">{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</div>

            <div className="bookeco-single-price-row">
              <div>
                <strong>{formatPrice(currentPrice)}</strong>
                {originalPrice > currentPrice ? <span>{formatPrice(originalPrice)}</span> : null}
              </div>
              <div className="bookeco-single-rating-chip">
                <StarRow value={Math.round(ratingValue)} />
                <em>{ratingValue.toFixed(1)} · {reviews.length} {t("books.tabs.reviews", { defaultValue: "đánh giá" }).toLowerCase()}</em>
              </div>
            </div>

            <div className="bookeco-single-buy-row">
              <div className="bookeco-single-quantity">
                <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                  <Minus size={15} />
                </button>
                <span>{quantity}</span>
                <button type="button" disabled={stock > 0 && quantity >= stock} onClick={() => setQuantity((prev) => prev + 1)}>
                  <Plus size={15} />
                </button>
              </div>

              <button type="button" className="bookeco-button-primary bookeco-single-cta" onClick={handleAddToCart} disabled={isAddingToCart || stock === 0}>
                <ShoppingBag size={18} />
                {stock === 0
                  ? t("books.out_of_stock", { defaultValue: "Tạm hết hàng" })
                  : isAddingToCart
                    ? t("bookeco.cart.adding", { defaultValue: "Đang thêm..." })
                    : t("books.addToCart", { defaultValue: "Thêm vào giỏ hàng" })}
              </button>
            </div>

            <div className="bookeco-single-details-grid">
              {details.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bookeco-single-tabs">
          {[
            { id: "description", label: t("books.tabs.description", { defaultValue: "Mô tả" }) },
            { id: "details", label: t("books.tabs.specifications", { defaultValue: "Thông tin sách" }) },
            { id: "reviews", label: `${t("books.tabs.reviews", { defaultValue: "Đánh giá" })} (${reviews.length})` },
          ].map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? "is-active" : ""} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bookeco-single-panel">
          {activeTab === "description" ? (
            <div className="bookeco-single-panel-copy">
              <h2>{t("bookeco.book.story_title", { defaultValue: "Mô tả sách" })}</h2>
              <p>{book.description || t("bookeco.common.updating", { defaultValue: "Nội dung đang được cập nhật." })}</p>
            </div>
          ) : null}

          {activeTab === "details" ? (
            <div className="bookeco-single-spec-grid">
              {details.map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          ) : null}

          {activeTab === "reviews" ? (
            <div className="bookeco-single-reviews-layout">
              <div>
                {canReview ? (
                  <form className="bookeco-review-form" onSubmit={handleReviewSubmit}>
                    <span className="bookeco-kicker">{t("bookeco.review.kicker", { defaultValue: "Gửi nhận xét" })}</span>
                    <h2>{t("bookeco.review.title", { defaultValue: "Đánh giá cuốn sách này" })}</h2>
                    <div className="bookeco-review-picker">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setRating(star)} className={star <= rating ? "is-active" : ""}>
                          <Star size={18} fill={star <= rating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={5} placeholder={t("bookeco.review.placeholder", { defaultValue: "Cảm nhận của bạn về cuốn sách này" })} required />
                    <button type="submit" className="bookeco-button-primary" disabled={isSubmittingReview}>
                      {isSubmittingReview ? t("bookeco.review.sending", { defaultValue: "Đang gửi..." }) : t("bookeco.review.submit", { defaultValue: "Gửi đánh giá" })}
                    </button>
                  </form>
                ) : (
                  <div className="bookeco-review-form bookeco-review-form-static">
                    <span className="bookeco-kicker">{t("books.tabs.reviews", { defaultValue: "Đánh giá" })}</span>
                    <h2>{currentUser ? t("bookeco.review.already_reviewed", { defaultValue: "Bạn đã đánh giá cuốn sách này" }) : t("bookeco.review.login_prompt", { defaultValue: "Đăng nhập để đánh giá" })}</h2>
                    <p>{currentUser ? t("bookeco.review.already_reviewed_copy", { defaultValue: "Bạn có thể xem lại các nhận xét khác ở cột bên cạnh." }) : t("bookeco.review.login_prompt_copy", { defaultValue: "Đăng nhập để chia sẻ cảm nhận và giúp người đọc khác chọn sách dễ hơn." })}</p>
                  </div>
                )}
              </div>

              <div className="bookeco-review-list">
                {reviews.length ? (
                  reviews.map((review) => (
                    <article key={review._id} className="bookeco-review-card">
                      <div className="bookeco-review-head">
                        <img src={review.user?.photoURL || "https://via.placeholder.com/56x56?text=U"} alt={review.user?.displayName || "User"} />
                        <div>
                          <strong>{review.user?.displayName || t("bookeco.review.reader_name", { defaultValue: "Độc giả BookEco" })}</strong>
                          <span>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                      <StarRow value={review.rating} />
                      <p>{review.comment}</p>
                    </article>
                  ))
                ) : (
                  <div className="bookeco-review-empty">
                    <span className="bookeco-kicker">{t("books.tabs.reviews", { defaultValue: "Đánh giá" })}</span>
                    <h2>{t("bookeco.review.empty_title", { defaultValue: "Chưa có nhận xét nào" })}</h2>
                    <p>{t("bookeco.review.empty_copy", { defaultValue: "Hãy là người đầu tiên để lại cảm nhận cho cuốn sách này." })}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <BookRecommendations bookId={book._id} />
      </div>
    </section>
  );
};

export default SingleBook;
