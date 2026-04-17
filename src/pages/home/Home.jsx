import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoveRight, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetBooksQuery } from "../../redux/features/books/booksApi";
import { useGetCategoriesQuery } from "../../redux/features/categories/categoriesApi";
import {
  useGetCollaborativeRecommendationsQuery,
  useGetContextualRecommendationsQuery,
} from "../../redux/features/recommendationv2/recommendationsv2Api";
import { useAuth } from "../../context/AuthContext";
import bannerOne from "../../assets/banner/banner-1.png";
import bannerTwo from "../../assets/banner/banner-2.png";
import bannerThree from "../../assets/banner/banner-3.png";
import bannerFour from "../../assets/banner/banner-4.png";
import bannerFive from "../../assets/banner/banner-5.png";
import "../../styles/bookeco-home.css";
import { useEffect } from "react";

const CATEGORY_ROUTE_MAP = {
  "van hoc": "/product/fiction",
  fiction: "/product/fiction",
  "kinh te": "/product/business",
  business: "/product/business",
  "ky nang": "/product/adventure",
  manga: "/product/manga",
  "thieu nhi": "/product",
};

const HERO_QUOTES = [
  { key: "quote_1", image: bannerOne },
  { key: "quote_2", image: bannerTwo },
  { key: "quote_3", image: bannerThree },
  { key: "quote_4", image: bannerFour },
  { key: "quote_5", image: bannerFive },
];

const normalizeText = (value = "") =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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

const getSpotlightNarrative = (book, t) => {
  if (!book) {
    return {
      intro: t("bookeco.home.spotlight_intro_fallback", {
        defaultValue: "Một lựa chọn đang được giữ chỗ trong bộ sưu tập nổi bật hôm nay.",
      }),
      details: [],
    };
  }

  const categoryName = book.category?.name || t("common.books", { defaultValue: "sách" });
  const authorName = book.author?.name || t("books.author", { defaultValue: "tác giả đang cập nhật" });
  const tags = Array.isArray(book.tags) ? book.tags.filter(Boolean).slice(0, 2) : [];

  const intro = t("bookeco.home.spotlight_intro", {
    defaultValue: `${book.title} là lựa chọn nổi bật cho những ai đang tìm một cuốn ${categoryName.toLowerCase()} có nhịp kể cuốn hút và cá tính rõ ràng trong tủ sách hiện tại.`,
  });

  const details = [
    t("bookeco.home.spotlight_detail_author", {
      defaultValue: `Tên tuổi ${authorName} giúp cuốn sách giữ được cảm giác có trọng lượng, đủ để trở thành điểm nhấn ngay từ lần chạm đầu tiên.`,
    }),
    tags.length
      ? t("bookeco.home.spotlight_detail_tags", {
          defaultValue: `Không khí gợi mở từ ${tags.join(" và ")} khiến cuốn này hợp để đặt ở vị trí trung tâm của một bộ sưu tập đang cần thêm dấu ấn.`,
        })
      : t("bookeco.home.spotlight_detail_category", {
          defaultValue: `Nếu bạn đang tìm một đầu sách có bản sắc rõ trong nhóm ${categoryName.toLowerCase()}, đây là lựa chọn đáng để mở xem ngay.`,
        }),
  ];

  return { intro, details };
};

const getCategoryRoute = (categoryName) => CATEGORY_ROUTE_MAP[normalizeText(categoryName)] || "/product";
const pickHeroBook = (books) => [...books].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0] || null;
const getReviewScore = (book) => Number(book?.rating || book?.averageRating || 0) * 100 + Number(book?.numReviews || book?.reviewCount || 0);

const BookTile = ({ book, compact = false, className = "", t }) => {
  if (!book) return null;
  return (
    <Link to={`/books/${book._id}`} className={`bookeco-book-tile ${compact ? "bookeco-book-tile-compact" : ""} ${className}`.trim()}>
      <div className="bookeco-book-image-shell">
        <img src={book.coverImage} alt={book.title} className="bookeco-book-image" loading="lazy" />
      </div>
      <div className="bookeco-book-copy">
        <h3>{book.title}</h3>
        <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
        <span>{formatPrice(getBookPrice(book))}</span>
      </div>
    </Link>
  );
};

const ContextualSwapTile = ({ book, active = false, onSelect, t }) => {
  if (!book) return null;

  return (
    <button
      type="button"
      className={`bookeco-book-tile bookeco-book-tile-atmospheric bookeco-book-tile-selector ${active ? "is-active" : ""}`.trim()}
      onClick={() => onSelect?.(book._id)}
    >
      <div className="bookeco-book-image-shell">
        <img src={book.coverImage} alt={book.title} className="bookeco-book-image" loading="lazy" />
      </div>
      <div className="bookeco-book-copy">
        <h3>{book.title}</h3>
        <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
        <span>{formatPrice(getBookPrice(book))}</span>
      </div>
    </button>
  );
};

const SpotlightRecommendation = ({ book, t }) => {
  if (!book) return null;
  const narrative = getSpotlightNarrative(book, t);

  return (
    <Link to={`/books/${book._id}`} className="bookeco-spotlight-card">
      <div className="bookeco-spotlight-media">
        <img src={book.coverImage} alt={book.title} className="bookeco-spotlight-image" loading="lazy" />
        <div className="bookeco-spotlight-overlay" />
      </div>
      <div className="bookeco-spotlight-copy">
        <div className="bookeco-spotlight-head">
          <h3>{book.title}</h3>
          <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
        </div>
        <div className="bookeco-spotlight-body">
          <p className="bookeco-spotlight-intro">{narrative.intro}</p>
          <div className="bookeco-spotlight-details">
            {narrative.details.map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </div>
        </div>
        <div className="bookeco-spotlight-footer">
          <span>{formatPrice(getBookPrice(book))}</span>
          <span className="bookeco-spotlight-link">
            {t("bookeco.home.discover_now", { defaultValue: "Khám phá ngay" })}
            <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

const CategoryCard = ({ category, featured = false, t }) => {
  if (!category) return null;
  return (
    <Link
      to={category.route}
      className={`bookeco-category-card ${featured ? "bookeco-category-featured" : ""}`}
      style={
        category.coverImage
          ? { backgroundImage: `linear-gradient(180deg, rgba(66, 4, 9, 0.1), rgba(66, 4, 9, 0.72)), url(${category.coverImage})` }
          : undefined
      }
    >
      <div className="bookeco-category-card-copy">
        <h3>{category.name}</h3>
        <p>{category.countLabel}</p>
      </div>
      {featured ? (
        <span className="bookeco-category-cta">
          {t("common.view_all", { defaultValue: "Xem danh mục" })}
          <MoveRight size={16} />
        </span>
      ) : null}
    </Link>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { data: books = [], isLoading } = useGetBooksQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: collaborativeData } = useGetCollaborativeRecommendationsQuery(undefined, { skip: !currentUser });
  const { data: contextualData } = useGetContextualRecommendationsQuery(undefined, { skip: !currentUser });
  const [visiblePersonalizedCount, setVisiblePersonalizedCount] = useState(4);
  const [selectedContextualLeadId, setSelectedContextualLeadId] = useState("");

  const featuredBook = useMemo(() => pickHeroBook(books), [books]);
  const mood = useMemo(() => {
    if (!featuredBook) return HERO_QUOTES[0];
    const seed = [...String(featuredBook._id || featuredBook.title || "bookeco")].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return HERO_QUOTES[seed % HERO_QUOTES.length];
  }, [featuredBook]);

  const popularBooks = useMemo(() => [...books].sort((a, b) => {
    const diff = getReviewScore(b) - getReviewScore(a);
    return diff !== 0 ? diff : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  }).slice(0, 5), [books]);
  const curatedFeaturedBook = popularBooks[1] || popularBooks[0] || null;
  const curatedSideBooks = popularBooks.filter((book) => book?._id !== curatedFeaturedBook?._id).slice(0, 4);

  const latestBooks = useMemo(() => [...books].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 6), [books]);

  const personalizedBooks = useMemo(() => {
    const source = Array.isArray(collaborativeData?.data) ? collaborativeData.data : [];
    return source.slice(0, visiblePersonalizedCount);
  }, [collaborativeData, visiblePersonalizedCount]);

  const contextualBooks = useMemo(() => {
    const source = Array.isArray(contextualData?.data) ? contextualData.data : [];
    return source.slice(0, 4);
  }, [contextualData]);
  const contextualLeadBook = useMemo(() => {
    if (!contextualBooks.length) return null;
    return contextualBooks.find((book) => book._id === selectedContextualLeadId) || contextualBooks[0];
  }, [contextualBooks, selectedContextualLeadId]);
  const contextualSideBooks = useMemo(
    () => contextualBooks.filter((book) => book?._id !== contextualLeadBook?._id),
    [contextualBooks, contextualLeadBook]
  );

  useEffect(() => {
    if (!contextualBooks.length) {
      setSelectedContextualLeadId("");
      return;
    }

    if (!selectedContextualLeadId || !contextualBooks.some((book) => book._id === selectedContextualLeadId)) {
      setSelectedContextualLeadId(contextualBooks[0]._id);
    }
  }, [contextualBooks, selectedContextualLeadId]);

  const contextualLabel = useMemo(() => {
    const context = contextualData?.context;
    if (!context) return "";

    if (context.holidayName) {
      if (context.isHoliday) {
        return t("bookeco.home.contextual_today_holiday", {
          defaultValue: `Hôm nay dành cho ${context.holidayName}`,
        });
      }

      if (typeof context.daysUntil === "number" && context.daysUntil > 0) {
        return t("bookeco.home.contextual_upcoming_holiday", {
          defaultValue: `${context.holidayName} đang đến gần`,
        });
      }

      return context.holidayName;
    }

    return "";
  }, [contextualData, t]);

  const contextualKicker = useMemo(() => {
    const context = contextualData?.context;
    if (!context) return "";
    if (context.isHoliday) {
      return t("bookeco.home.contextual_kicker_today", { defaultValue: "Dành cho dịp hôm nay" });
    }
    return t("bookeco.home.contextual_kicker_upcoming", { defaultValue: "Đón dịp sắp tới" });
  }, [contextualData, t]);

  const categoryCards = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) return [];
    return categories.slice(0, 4).map((category, index) => {
      const relatedBooks = books.filter((book) => normalizeText(book.category?.name || "") === normalizeText(category.name));
      return {
        id: category._id || category.name,
        name: category.name,
        countLabel: `${relatedBooks.length || 0} ${t("bookeco.home.book_titles", { defaultValue: "đầu sách" })}`,
        route: getCategoryRoute(category.name),
        coverImage: relatedBooks[0]?.coverImage || books[index]?.coverImage || "",
      };
    });
  }, [books, categories, t]);

  if (isLoading && books.length === 0) {
    return (
      <div className="bookeco-home-shell">
        <section className="bookeco-loading-state">
          <div className="bookeco-loading-card" />
          <div className="bookeco-loading-card" />
          <div className="bookeco-loading-card" />
        </section>
      </div>
    );
  }

  return (
    <div className="bookeco-home-shell">
      <section className="bookeco-hero">
        <div className="bookeco-hero-backdrop" style={{ backgroundImage: `linear-gradient(90deg, rgba(254, 249, 240, 0.92), rgba(254, 249, 240, 0.24)), url(${mood.image})` }} />

        <div className="bookeco-hero-copy">
          <span className="bookeco-kicker">{t("common.new_arrivals", { defaultValue: "Mới cập nhật" })}</span>
          <h1 className="bookeco-hero-title">
            <span>{t("bookeco.home.hero_line_one", { defaultValue: "Nơi dành cho" })}</span>
            <span className="bookeco-hero-title-italic">{t("bookeco.home.hero_line_two", { defaultValue: "những cuốn sách đáng giữ lại" })}</span>
          </h1>
          <p className="bookeco-hero-description">“{t(`bookeco.home.${mood.key}`, { defaultValue: "Một cuốn sách hay không cần ồn ào, chỉ cần đến đúng lúc và ở lại đủ lâu." })}”</p>
          <p className="bookeco-hero-attribution">BookEco Selection</p>
          <div className="bookeco-hero-actions">
            <Link to={featuredBook ? `/books/${featuredBook._id}` : "/product?sort=newest"} className="bookeco-primary-button">
              {t("bookeco.home.cta_newest", { defaultValue: "Xem sách mới nhất" })}
            </Link>
            <Link to="/product" className="bookeco-secondary-link">
              {t("common.view_all", { defaultValue: "Xem toàn bộ sản phẩm" })}
            </Link>
          </div>
        </div>

        <div className="bookeco-hero-visual">
          <div className="bookeco-hero-card">
            <div className="bookeco-hero-book-frame">
              {featuredBook?.coverImage ? <img src={featuredBook.coverImage} alt={featuredBook.title} className="bookeco-hero-book-image" /> : <div className="bookeco-hero-book-placeholder" />}
            </div>
            <div className="bookeco-hero-badge">
              <span>{t("bookeco.home.newest_badge", { defaultValue: "Tựa sách vừa cập nhật" })}</span>
              <strong>{featuredBook?.title || t("bookeco.home.updating", { defaultValue: "Đang cập nhật kho sách" })}</strong>
            </div>
          </div>
        </div>
      </section>

      {currentUser && contextualBooks.length > 0 ? (
        <section className="bookeco-personalized-section bookeco-personalized-section-contextual">
          <div className="bookeco-section-header">
            <div className="bookeco-section-header-copy">
              {contextualKicker ? <span className="bookeco-kicker">{contextualKicker}</span> : null}
              <h2>{contextualLabel}</h2>
            </div>
          </div>

          <div className="bookeco-contextual-spotlight">
            <SpotlightRecommendation book={contextualLeadBook} t={t} />
            <div className="bookeco-contextual-side-stack">
              {contextualSideBooks.map((book, index) => (
                <ContextualSwapTile
                  key={`contextual-${book._id}`}
                  book={book}
                  active={book._id === selectedContextualLeadId}
                  onSelect={setSelectedContextualLeadId}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {currentUser && personalizedBooks.length > 0 ? (
        <section className="bookeco-personalized-section bookeco-personalized-section-personal">
          <div className="bookeco-section-header">
            <div className="bookeco-section-header-copy">
              <span className="bookeco-kicker">{t("bookeco.home.for_you", { defaultValue: "Dành cho bạn" })}</span>
              <h2>{t("bookeco.home.personalized_title", { defaultValue: "Những lựa chọn hợp với gu đọc của bạn" })}</h2>
            </div>
            {Array.isArray(collaborativeData?.data) && collaborativeData.data.length > visiblePersonalizedCount ? (
              <button type="button" className="bookeco-inline-text-button" onClick={() => setVisiblePersonalizedCount((count) => count + 4)}>
                {t("bookeco.home.show_more_suggestions", { defaultValue: "Xem thêm gợi ý" })}
                <ChevronRight size={16} />
              </button>
            ) : null}
          </div>

          <div className="bookeco-personalized-track">
            {personalizedBooks.map((book, index) => (
              <BookTile
                key={book._id}
                book={book}
                className={index === 0 ? "bookeco-book-tile-heroic" : index === 1 ? "bookeco-book-tile-atmospheric" : ""}
                t={t}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bookeco-curated-section">
        <div className="bookeco-section-header">
          <div>
            <span className="bookeco-kicker">{t("common.collections", { defaultValue: "Tuyển chọn" })}</span>
            <h2>{t("bookeco.home.curated_title", { defaultValue: "Những tựa sách được yêu thích nhất" })}</h2>
          </div>
          <Link to="/product?sort=rating" className="bookeco-header-link">
            {t("common.view_all", { defaultValue: "Xem toàn bộ sản phẩm" })}
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="bookeco-curated-grid">
          <article className="bookeco-feature-card ">
            <div className="bookeco-feature-image">
              {curatedFeaturedBook?.coverImage ? <img src={curatedFeaturedBook.coverImage} alt={curatedFeaturedBook.title} /> : <div className="bookeco-image-placeholder" />}
            </div>
            <div className="bookeco-feature-copy">
              <div>
                <h3>{curatedFeaturedBook?.title || t("bookeco.home.updating", { defaultValue: "Đang cập nhật" })}</h3>
                <p>{curatedFeaturedBook?.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
              </div>
              <div className="bookeco-feature-footer">
                <span>{formatPrice(getBookPrice(curatedFeaturedBook))}</span>
                <Link to={curatedFeaturedBook ? `/books/${curatedFeaturedBook._id}` : "/product?sort=rating"} className="bookeco-icon-button">
                  <ShoppingBag size={16} />
                </Link>
              </div>
            </div>
          </article>

          <div className="bookeco-curated-side-grid">
            {curatedSideBooks.map((book) => <BookTile key={book._id} book={book} compact t={t} />)}
          </div>
        </div>
      </section>

      <section className="bookeco-archived-section">
        <div className="bookeco-archived-heading">
          <span className="bookeco-kicker">{t("common.new_arrivals", { defaultValue: "Mới cập nhật" })}</span>
          <h2>{t("bookeco.home.latest_title", { defaultValue: "Sách vừa có mặt trên kệ" })}</h2>
        </div>

        <div className="bookeco-archived-row">
          {latestBooks.map((book) => (
            <Link key={book._id} to={`/books/${book._id}`} className="bookeco-archived-card">
              <div className="bookeco-archived-image">
                <img src={book.coverImage} alt={book.title} loading="lazy" />
              </div>
              <div className="bookeco-archived-copy">
                <h3>{book.title}</h3>
                <p>{book.author?.name || t("books.author", { defaultValue: "Tác giả" })}</p>
                <span>{formatPrice(getBookPrice(book))}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {categoryCards.length > 0 ? (
        <section className="bookeco-categories-section">
          <div className="bookeco-section-header">
            <div>
              <span className="bookeco-kicker">{t("bookeco.home.categories_label", { defaultValue: "Duyệt theo danh mục" })}</span>
              <h2>{t("bookeco.home.categories_title", { defaultValue: "Tìm sách theo mối quan tâm của bạn" })}</h2>
            </div>
          </div>

          <div className="bookeco-categories-grid">
            <div className="bookeco-category-column bookeco-category-column-left">
              <CategoryCard category={categoryCards[0]} t={t} />
            </div>
            <div className="bookeco-category-column bookeco-category-column-middle">
              <CategoryCard category={categoryCards[1]} t={t} />
              <CategoryCard category={categoryCards[2]} t={t} />
            </div>
            <div className="bookeco-category-column bookeco-category-column-right">
              <CategoryCard category={categoryCards[3]} featured t={t} />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Home;
