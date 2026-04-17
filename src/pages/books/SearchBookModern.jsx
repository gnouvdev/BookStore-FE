import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchBooksQuery } from "../../redux/features/search/searchApi";
import "../../styles/bookeco-catalog.css";
import "../../styles/bookeco-search-results.css";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50];

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
  }).format(value || 0);

const SearchBookModern = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: books = [],
    isLoading,
    error,
  } = useSearchBooksQuery(
    { query, type: "all" },
    { skip: !query }
  );

  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(books.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = books.slice(startIndex, startIndex + itemsPerPage);

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let index = Math.max(2, currentPage - delta);
      index <= Math.min(totalPages - 1, currentPage + delta);
      index += 1
    ) {
      range.push(index);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  const renderResultState = () => {
    if (isLoading) {
      return (
        <div className="bookeco-catalog-loading">
          Đang tìm các đầu sách phù hợp...
        </div>
      );
    }

    if (error) {
      return (
        <div className="bookeco-catalog-error">
          {error.data?.message ||
            "Không thể tải kết quả tìm kiếm lúc này. Vui lòng thử lại sau."}
        </div>
      );
    }

    if (!books.length) {
      return (
        <div className="bookeco-catalog-empty">
          Không tìm thấy cuốn sách nào phù hợp với từ khóa bạn vừa nhập.
        </div>
      );
    }

    return (
      <>
        <div className="bookeco-catalog-grid bookeco-search-results-grid">
          {currentBooks.map((book) => (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              className="bookeco-catalog-card"
            >
              <div className="bookeco-catalog-image-shell">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="bookeco-catalog-image"
                />
              </div>
              <div className="bookeco-catalog-copy">
                <div className="bookeco-catalog-meta">
                  <small>
                    {book.category?.name ||
                      t("books.category", { defaultValue: "Danh mục" })}
                  </small>
                  <span className="bookeco-catalog-rating">
                    <Star size={14} fill="currentColor" />
                    {Number(book.rating || 0).toFixed(1)}
                  </span>
                </div>
                <h3 title={book.title}>{book.title}</h3>
                <p>
                  {book.author?.name ||
                    t("books.author", { defaultValue: "Tác giả" })}
                </p>
                <div className="bookeco-catalog-price-row">
                  <strong>{formatPrice(getBookPrice(book))}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {books.length > itemsPerPage ? (
          <div className="bookeco-search-pagination">
            <div className="bookeco-search-pagination-copy">
              <span>
                Hiển thị {startIndex + 1} đến{" "}
                {Math.min(startIndex + itemsPerPage, books.length)} trong tổng
                số {books.length} kết quả
              </span>
              <label className="bookeco-search-page-size">
                <span>Mỗi trang</span>
                <select
                  value={itemsPerPage}
                  onChange={(event) => {
                    setItemsPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bookeco-search-pagination-controls">
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              {pageNumbers.map((page, index) => (
                <button
                  key={`${page}-${index}`}
                  type="button"
                  disabled={page === "..."}
                  className={page === currentPage ? "is-active" : ""}
                  onClick={() =>
                    typeof page === "number" && setCurrentPage(page)
                  }
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <section className="bookeco-catalog-shell bookeco-search-shell">
      <div className="bookeco-catalog-container">
        <Link to="/product" className="bookeco-search-backlink">
          <ArrowLeft size={16} />
          Quay lại tủ sách
        </Link>

        <div className="bookeco-catalog-hero bookeco-search-hero">
          <div className="bookeco-catalog-hero-copy">
            <span className="bookeco-catalog-label">Kết quả tìm kiếm</span>
            <h1>
              {query
                ? `Từ khóa: "${query}"`
                : "Nhập từ khóa để bắt đầu tìm sách"}
            </h1>
            <p>
              Tìm lại các đầu sách theo tên, tác giả, danh mục hoặc từ khóa liên
              quan đang có trong cửa hàng.
            </p>
          </div>

          <div className="bookeco-search-hero-card">
            <SearchIcon size={18} />
            <div>
              <span>Tra cứu hiện tại</span>
              <strong>{query || "Chưa có từ khóa"}</strong>
            </div>
          </div>
        </div>

        <div className="bookeco-catalog-results-head">
          <span>{books.length} kết quả</span>
          <h2>Kết quả phù hợp với yêu cầu của bạn</h2>
          <p>
            Nhấn vào một đầu sách để mở trang chi tiết, hoặc tiếp tục tìm kiếm
            bằng từ khóa khác ở thanh điều hướng phía trên.
          </p>
        </div>

        {renderResultState()}
      </div>
    </section>
  );
};

export default SearchBookModern;
