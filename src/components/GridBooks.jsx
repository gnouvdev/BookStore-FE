import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useAddToCartMutation } from "../redux/features/cart/cartApi";
import { useGetBooksQuery } from "../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../redux/features/categories/categoriesApi";
import "../styles/bookeco-catalog.css";

const normalizeText = (value = "") => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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

const genreMatches = (book, genre) => {
  if (!genre || genre === "full") return true;
  const category = normalizeText(book.category?.name || "");
  const target = normalizeText(genre);
  if (target === "bussines" || target === "business") return category.includes("kinh") || category.includes("business");
  return category.includes(target);
};

const CatalogBookCard = ({ book, t }) => {
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
    <article className="bookeco-catalog-card">
      <Link to={`/books/${book._id}`} className="bookeco-catalog-card-link">
        <div className="bookeco-catalog-image-shell">
          <img src={book.coverImage} alt={book.title} className="bookeco-catalog-image" loading="lazy" />
        </div>
        <div className="bookeco-catalog-copy">
          <div className="bookeco-catalog-meta">
            <small>{book.category?.name || t("books.category", { defaultValue: "Danh mục" })}</small>
            <span className="bookeco-catalog-rating"><Star size={14} />{Number(book.rating || book.averageRating || 0).toFixed(1)}</span>
          </div>
          <h3 title={book.title}>{book.title}</h3>
          <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
          <div className="bookeco-catalog-price-row">
            <strong>{formatPrice(getBookPrice(book))}</strong>
          </div>
        </div>
      </Link>

      <button type="button" className="bookeco-catalog-add" onClick={handleAddToCart} disabled={isLoading}>
        {isLoading ? t("bookeco.cart.adding", { defaultValue: "Đang thêm..." }) : t("books.addToCart", { defaultValue: "Thêm vào giỏ hàng" })}
      </button>
    </article>
  );
};

const GridBooks = ({ genre }) => {
  const { t } = useTranslation();
  const { data: books = [], isLoading, error } = useGetBooksQuery();
  const { data: categoriesData = [] } = useGetCategoriesQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [maxPrice, setMaxPrice] = useState(1200000);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(15);
  const categories = categoriesData?.data || categoriesData || [];

  useEffect(() => {
    const currentSort = searchParams.get("sort") || "newest";
    setSortBy(currentSort);
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    const matched = books.filter((book) => {
      const matchGenre = genreMatches(book, genre);
      const matchCategory = selectedCategory === "all" || normalizeText(book.category?.name || "") === normalizeText(selectedCategory);
      const matchPrice = getBookPrice(book) <= maxPrice;
      return matchGenre && matchCategory && matchPrice;
    });

    switch (sortBy) {
      case "priceAsc":
        return [...matched].sort((a, b) => getBookPrice(a) - getBookPrice(b));
      case "priceDesc":
        return [...matched].sort((a, b) => getBookPrice(b) - getBookPrice(a));
      case "rating":
        return [...matched].sort((a, b) => Number(b.rating || b.averageRating || 0) - Number(a.rating || a.averageRating || 0));
      default:
        return [...matched].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [books, genre, maxPrice, selectedCategory, sortBy]);

  const pageTitle = (() => {
    if (sortBy === "rating" && !genre) {
      return t("common.collections", { defaultValue: "Tuyển chọn" });
    }

    switch (genre) {
      case "fiction": return t("books.fictionBooks", { defaultValue: "Sách văn học" });
      case "horror": return t("books.horrorBooks", { defaultValue: "Sách kinh dị" });
      case "adventure": return t("books.adventureBooks", { defaultValue: "Sách phiêu lưu" });
      case "bussines":
      case "business": return t("books.bussinesBooks", { defaultValue: "Sách kinh doanh" });
      case "manga": return t("books.mangaBooks", { defaultValue: "Manga" });
      default: return t("books.allBooks", { defaultValue: "Tất cả sách" });
    }
  })();

  const handleSortChange = (value) => {
    setSortBy(value);
    const next = new URLSearchParams(searchParams);
    next.set("sort", value);
    setSearchParams(next);
  };

  if (isLoading) return <section className="bookeco-catalog-shell"><div className="bookeco-catalog-container"><div className="bookeco-catalog-loading">{t("filter.loadingBooks", { defaultValue: "Đang tải sách..." })}</div></div></section>;
  if (error) return <section className="bookeco-catalog-shell"><div className="bookeco-catalog-container"><div className="bookeco-catalog-error">{t("filter.errorLoadingBooks", { defaultValue: "Không thể tải sách." })}</div></div></section>;

  return (
    <section className="bookeco-catalog-shell">
      <div className="bookeco-catalog-container">
        <div className="bookeco-catalog-hero">
          <div className="bookeco-catalog-hero-copy">
            <span className="bookeco-catalog-label">{t("common.books", { defaultValue: "Sách" })}</span>
            <h1>{pageTitle}</h1>
            <p>{t("bookeco.catalog.hero", { defaultValue: "Khám phá những đầu sách nổi bật, được đánh giá cao và được sắp lại gọn theo từng nhu cầu tìm đọc." })}</p>
          </div>
        </div>

        <div className="bookeco-catalog-layout">
          <aside className="bookeco-catalog-sidebar">
            <div className="bookeco-catalog-filter-group"><span className="bookeco-catalog-filter-title">{t("filter.filters", { defaultValue: "Bộ lọc" })}</span></div>
            <div className="bookeco-catalog-filter-group">
              <span className="bookeco-catalog-filter-title">{t("books.category", { defaultValue: "Danh mục" })}</span>
              <label><input type="radio" name="category" value="all" checked={selectedCategory === "all"} onChange={() => setSelectedCategory("all")} />{t("books.allBooks", { defaultValue: "Tất cả sách" })}</label>
              {categories.map((category) => <label key={category._id || category.name}><input type="radio" name="category" value={category.name} checked={selectedCategory === category.name} onChange={() => setSelectedCategory(category.name)} />{category.name}</label>)}
            </div>
            <div className="bookeco-catalog-filter-group bookeco-catalog-range">
              <span className="bookeco-catalog-filter-title">{t("filter.priceRange", { defaultValue: "Khoảng giá" })}</span>
              <div className="bookeco-catalog-range-value">{t("filter.maxPrice", { defaultValue: "Giá tối đa" })}: {formatPrice(maxPrice)}</div>
              <input type="range" min="50000" max="1200000" step="25000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
            </div>
          </aside>

          <div className="bookeco-catalog-main">
            <div className="bookeco-catalog-toolbar">
              <div className="bookeco-catalog-results-head">
                <h2>{filteredBooks.length} {t("filter.results", { defaultValue: "kết quả" })}</h2>
                <p>{t("bookeco.catalog.subtitle", { defaultValue: "Danh sách bên dưới thay đổi theo bộ lọc bên trái và cách sắp xếp bạn chọn ở phía trên." })}</p>
              </div>
              <label className="bookeco-catalog-select">
                <span>{t("filter.sortBy", { defaultValue: "Sắp xếp" })}</span>
                <select value={sortBy} onChange={(event) => handleSortChange(event.target.value)}>
                  <option value="newest">{t("filter.newest", { defaultValue: "Mới nhất" })}</option>
                  <option value="rating">{t("filter.highestRated", { defaultValue: "Đánh giá cao" })}</option>
                  <option value="priceAsc">{t("filter.priceLowToHigh", { defaultValue: "Giá tăng dần" })}</option>
                  <option value="priceDesc">{t("filter.priceHighToLow", { defaultValue: "Giá giảm dần" })}</option>
                </select>
              </label>
            </div>

            {filteredBooks.length ? (
              <>
                <div className="bookeco-catalog-grid">{filteredBooks.slice(0, visibleCount).map((book) => <CatalogBookCard key={book._id} book={book} t={t} />)}</div>
                {visibleCount < filteredBooks.length ? <div className="bookeco-catalog-more"><button type="button" onClick={() => setVisibleCount((count) => count + 10)}>{t("common.view_all", { defaultValue: "Xem thêm" })}</button></div> : null}
              </>
            ) : <div className="bookeco-catalog-empty">{t("filter.noBooksFound", { defaultValue: "Chưa có đầu sách phù hợp với bộ lọc hiện tại." })}</div>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GridBooks;
