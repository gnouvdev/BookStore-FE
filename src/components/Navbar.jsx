import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { History, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import avatarImg from "../assets/avatar.png";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  useAddSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useGetSearchHistoryQuery,
  useGetSearchSuggestionsQuery,
} from "../redux/features/search/searchApi";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const cartItems = useSelector((state) => state.cart.cartItems || []);
  const [query, setQuery] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const searchRef = useRef(null);
  const userRef = useRef(null);

  const primaryLinks = [
    { label: t("common.books", { defaultValue: "Sách" }), href: "/product" },
    { label: t("common.collections", { defaultValue: "Tuyển chọn" }), href: "/product?sort=rating" },
    { label: t("common.account", { defaultValue: "Tài khoản" }), href: "/profile" },
  ];

  const [addSearchHistory] = useAddSearchHistoryMutation();
  const [deleteSearchHistory] = useDeleteSearchHistoryMutation();

  const { data: suggestionsData } = useGetSearchSuggestionsQuery(query, {
    skip: query.trim().length < 2,
  });
  const { data: historyData } = useGetSearchHistoryQuery(undefined, {
    skip: !currentUser || !showPanel || query.trim().length > 0,
  });

  const suggestions = suggestionsData || {};
  const suggestionBooks = suggestions.books || [];
  const suggestionAuthors = suggestions.authors || [];
  const suggestionCategories = suggestions.categories || [];
  const suggestionTags = suggestions.tags || [];
  const hasSuggestions =
    suggestionBooks.length > 0 ||
    suggestionAuthors.length > 0 ||
    suggestionCategories.length > 0 ||
    suggestionTags.length > 0;
  const historyItems = historyData?.data || [];
  const uniqueHistoryItems = historyItems.filter((item, index, array) => {
    const normalized = item.query?.trim().toLowerCase();
    return (
      array.findIndex(
        (entry) => entry.query?.trim().toLowerCase() === normalized
      ) === index
    );
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowPanel(false);
      if (userRef.current && !userRef.current.contains(event.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatar = useMemo(() => {
    if (currentUser?.photoURL) return currentUser.photoURL;
    const stored = localStorage.getItem("user");
    if (!stored) return avatarImg;
    try {
      return JSON.parse(stored).photoURL || avatarImg;
    } catch {
      return avatarImg;
    }
  }, [currentUser]);

  const displayName = useMemo(() => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.fullName) return currentUser.fullName;
    return t("common.account", { defaultValue: "Tài khoản" });
  }, [currentUser, t]);

  const submitSearch = async (value) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    if (currentUser) {
      try {
        await addSearchHistory({ query: cleaned }).unwrap();
      } catch {}
    }
    setShowPanel(false);
    setIsMobileOpen(false);
    navigate(`/search?query=${encodeURIComponent(cleaned)}`);
  };

  const handleOpenBookDetail = async (book) => {
    if (!book?._id) return;
    if (currentUser && book.title) {
      try {
        await addSearchHistory({ query: book.title }).unwrap();
      } catch {}
    }
    setShowPanel(false);
    setIsMobileOpen(false);
    setQuery(book.title || "");
    navigate(`/books/${book._id}`);
  };

  const handleLogout = async () => {
    await logout?.();
    setShowUserMenu(false);
    navigate("/");
  };

  const isLinkActive = (href) => {
    const [targetPath, targetSearch = ""] = href.split("?");
    const currentSearch = location.search.startsWith("?") ? location.search.slice(1) : "";

    if (location.pathname !== targetPath) return false;
    if (!targetSearch) return currentSearch.length === 0;

    return currentSearch === targetSearch;
  };

  return (
    <header className="bookeco-topbar">
      <div className="bookeco-topbar-inner">
        <Link to="/" className="bookeco-brand">BookEco</Link>

        <nav className="bookeco-nav-links">
          {primaryLinks.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link key={item.href} to={item.href} className={`bookeco-nav-link ${active ? "is-active" : ""}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="bookeco-search-wrap" ref={searchRef}>
          <div className="bookeco-search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setShowPanel(true)}
              onKeyDown={(event) => event.key === "Enter" && submitSearch(query)}
              placeholder={t("search.search_placeholder", { defaultValue: "Tìm theo tên sách hoặc tác giả" })}
            />
            {query ? <button type="button" onClick={() => setQuery("")}><X size={16} /></button> : null}
          </div>

          {showPanel && (hasSuggestions || historyItems.length > 0) ? (
            <div className="bookeco-search-panel">
              {query.trim().length >= 2 && hasSuggestions ? (
                <section className="bookeco-search-section">
                  <h4 className="bookeco-search-section-title">{t("search.suggestions", { defaultValue: "Gợi ý tìm kiếm" })}</h4>
                  {suggestionBooks.length > 0 ? (
                    <div className="bookeco-search-book-grid">
                      {suggestionBooks.slice(0, 4).map((item) => (
                        <button
                          key={item._id || item.title}
                          type="button"
                          className="bookeco-search-book-card"
                          onClick={() => handleOpenBookDetail(item)}
                        >
                          <div className="bookeco-search-book-cover">
                            {item.coverImage ? (
                              <img src={item.coverImage} alt={item.title} />
                            ) : (
                              <div className="bookeco-search-book-cover-fallback" />
                            )}
                          </div>
                          <div className="bookeco-search-book-copy">
                            <strong title={item.title}>{item.title}</strong>
                            <span>{item.author?.name || t("search.book_match", { defaultValue: "Sách phù hợp" })}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {suggestionAuthors.slice(0, 3).map((item) => (
                    <button key={item._id || item.name} type="button" className="bookeco-search-item" onClick={() => submitSearch(item.name)}>
                      <strong>{item.name}</strong>
                      <span>{t("search.author_match", { defaultValue: "Tác giả liên quan" })}</span>
                    </button>
                  ))}
                  {suggestionCategories.slice(0, 3).map((item) => (
                    <button key={item._id || item.name} type="button" className="bookeco-search-item" onClick={() => submitSearch(item.name)}>
                      <strong>{item.name}</strong>
                      <span>{t("search.category_match", { defaultValue: "Danh mục liên quan" })}</span>
                    </button>
                  ))}
                  {suggestionTags.slice(0, 4).map((item) => (
                    <button key={item} type="button" className="bookeco-search-item" onClick={() => submitSearch(item)}>
                      <strong>#{item}</strong>
                      <span>{t("search.tag_match", { defaultValue: "Từ khóa được gợi ý" })}</span>
                    </button>
                  ))}
                </section>
              ) : null}

              {query.trim().length === 0 && historyItems.length > 0 ? (
                <section className="bookeco-search-section">
                  <h4 className="bookeco-search-section-title">{t("search.recent", { defaultValue: "Lịch sử gần đây" })}</h4>
                  {uniqueHistoryItems.slice(0, 4).map((item) => (
                    <div key={item._id} className="bookeco-search-item bookeco-search-item-row">
                      <button type="button" onClick={() => submitSearch(item.query)} className="bookeco-search-history-button">
                        <strong><History size={14} /> {item.query}</strong>
                      </button>
                      <button type="button" onClick={() => deleteSearchHistory(item._id)} className="bookeco-search-clear-button"><X size={14} /></button>
                    </div>
                  ))}
                </section>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="bookeco-topbar-actions">
          <LanguageSwitcher />
          <Link to="/cart" className="bookeco-action-link" aria-label={t("common.cart", { defaultValue: "Giỏ hàng" })}>
            <ShoppingBag size={18} />
            {cartItems.length ? <span className="bookeco-action-badge">{cartItems.length}</span> : null}
          </Link>
          {currentUser ? (
            <div className="bookeco-user-menu" ref={userRef}>
              <button type="button" className="bookeco-user-trigger" onClick={() => setShowUserMenu((prev) => !prev)}>
                <img src={avatar} alt={displayName} className="bookeco-user-avatar" />
              </button>
              {showUserMenu ? (
                <div className="bookeco-user-dropdown">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}>{displayName}</Link>
                  <Link to="/orders" onClick={() => setShowUserMenu(false)}>{t("common.orders", { defaultValue: "Đơn hàng" })}</Link>
                  <Link to="/notifications" onClick={() => setShowUserMenu(false)}>{t("common.notifications", { defaultValue: "Thông báo" })}</Link>
                  <button type="button" onClick={handleLogout}>{t("common.logout", { defaultValue: "Đăng xuất" })}</button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" className="bookeco-action-link" aria-label={t("common.login", { defaultValue: "Đăng nhập" })}><User size={18} /></Link>
          )}
          <button type="button" className="bookeco-action-link bookeco-mobile-toggle" onClick={() => setIsMobileOpen((prev) => !prev)} aria-label="Open menu"><Menu size={18} /></button>
        </div>
      </div>

      <div className={`bookeco-mobile-nav ${isMobileOpen ? "is-open" : ""}`}>
        <div className="bookeco-mobile-nav-links">
          {primaryLinks.map((item) => (
            <Link key={item.href} to={item.href} onClick={() => setIsMobileOpen(false)}>{item.label}</Link>
          ))}
          {!currentUser ? <Link to="/login" onClick={() => setIsMobileOpen(false)}>{t("common.login", { defaultValue: "Đăng nhập" })}</Link> : null}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
