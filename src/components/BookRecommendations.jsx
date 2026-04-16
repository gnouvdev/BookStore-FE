import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useAddToCartMutation } from "../redux/features/cart/cartApi";
import { useGetRecommendationsQuery } from "../redux/features/recommendations/recommendationsApi";
import "../styles/bookeco-related.css";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const RelatedCard = ({ book, t }) => {
  const [addToCart, { isLoading }] = useAddToCartMutation();

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await addToCart({ bookId: book._id, quantity: 1 }).unwrap();
      Swal.fire({
        icon: "success",
        title: t("bookeco.cart.added_title", { defaultValue: "Đã thêm vào giỏ hàng" }),
        text: `"${book.title}" ${t("bookeco.cart.added_copy", { defaultValue: "đã sẵn sàng trong giỏ của bạn." })}`,
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("bookeco.cart.add_error", { defaultValue: "Không thể thêm vào giỏ" }),
        text: error?.data?.message || t("filter.pleaseTryAgainLater", { defaultValue: "Vui lòng thử lại sau." }),
      });
    }
  };

  return (
    <article className="bookeco-related-card">
      <Link to={`/books/${book._id}`} className="bookeco-related-card-link">
        <div className="bookeco-related-cover-wrap">
          <img src={book.coverImage} alt={book.title} className="bookeco-related-cover" />
        </div>
        <h3 title={book.title}>{book.title}</h3>
        <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
        <strong>{formatPrice(book.price?.newPrice || book.price?.oldPrice || 0)}</strong>
      </Link>
      <button type="button" className="bookeco-related-add" onClick={handleAddToCart} disabled={isLoading}>
        {isLoading ? t("bookeco.cart.adding", { defaultValue: "Đang thêm..." }) : t("books.addToCart", { defaultValue: "Thêm vào giỏ hàng" })}
      </button>
    </article>
  );
};

const BookRecommendations = ({ bookId }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetRecommendationsQuery(bookId, { skip: !bookId });
  const [startIndex, setStartIndex] = useState(0);

  const recommendations = data?.recommendations || [];
  const visibleBooks = recommendations.slice(startIndex, startIndex + 5);

  if (isLoading) {
    return (
      <section className="bookeco-related-shell">
        <div className="bookeco-single-loading">
          <div className="bookeco-single-spinner" />
          <p>{t("bookeco.related.loading", { defaultValue: "Đang tìm sách liên quan..." })}</p>
        </div>
      </section>
    );
  }

  if (isError || !recommendations.length) return null;

  return (
    <section className="bookeco-related-shell">
      <div className="bookeco-related-head">
        <div>
          <span className="bookeco-kicker">{t("bookeco.related.label", { defaultValue: "Gợi ý tương đồng" })}</span>
          <h2>{t("bookeco.related.title", { defaultValue: "Những cuốn sách có thể bạn sẽ muốn xem tiếp" })}</h2>
        </div>

        <div className="bookeco-related-actions">
          <button type="button" onClick={() => setStartIndex((value) => Math.max(0, value - 1))} disabled={startIndex === 0}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={() => setStartIndex((value) => (value + 5 < recommendations.length ? value + 1 : value))} disabled={startIndex + 5 >= recommendations.length}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="bookeco-related-grid">
        {visibleBooks.map((book) => <RelatedCard key={book._id} book={book} t={t} />)}
      </div>
    </section>
  );
};

export default BookRecommendations;
