"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaFilter,
  FaSearch,
  FaSort,
  FaThLarge,
  FaList,
  FaTh,
  FaHeart,
  FaShoppingCart,
  FaStar,
  FaBookOpen,
  FaLanguage,
  FaUser,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import { RiBookOpenLine, RiPriceTag3Line } from "react-icons/ri";
import BookCard from "./../pages/books/BookCart";
import { useGetBooksQuery } from "../redux/features/books/booksApi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../styles/gridBook.css";
import { t } from "i18next";

gsap.registerPlugin(ScrollTrigger);

const EnhancedGridBooks = ({ genre }) => {
  const { data: books = [], isLoading, error } = useGetBooksQuery();

  const [filteredBooks, setFilteredBooks] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    sortBy: "",
  });

  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const booksRef = useRef([]);
  const containerRef = useRef(null);

  // Enhanced animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power1.out" }
      );
    }

    if (filtersRef.current) {
      gsap.fromTo(
        filtersRef.current.children,
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "power1.out",
          delay: 0.1,
        }
      );
    }
  }, []);

  useEffect(() => {
    booksRef.current.forEach((book, index) => {
      if (book) {
        gsap.fromTo(
          book,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            scrollTrigger: {
              trigger: book,
              start: "top bottom-=100",
              toggleActions: "play none none reverse",
            },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.3,
            delay: index * 0.02,
            ease: "power1.out",
          }
        );
      }
    });
  }, [filteredBooks]);

  // Enhanced filtering logic
  useEffect(() => {
    if (books.length > 0) {
      let result = books;

      // Filter by genre
      if (genre !== "full") {
        result = result.filter(
          (book) => book.category?.name?.toLowerCase() === genre.toLowerCase()
        );
      }

      // Apply search filter
      if (searchQuery) {
        result = result.filter(
          (book) =>
            book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            book.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply price range filter
      result = result.filter((book) => {
        const price = book.price?.newPrice || 0;
        return price >= filters.minPrice && price <= filters.maxPrice;
      });

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price_asc":
            result.sort(
              (a, b) => (a.price?.newPrice || 0) - (b.price?.newPrice || 0)
            );
            break;
          case "price_desc":
            result.sort(
              (a, b) => (b.price?.newPrice || 0) - (a.price?.newPrice || 0)
            );
            break;
          case "newest":
            result.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            break;
          case "trending":
            result.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
            break;
          case "rating":
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case "title":
            result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
            break;
          default:
            break;
        }
      }

      setFilteredBooks(result);
    }
  }, [books, genre, filters, searchQuery]);

  // Add pagination logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Add pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Add pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
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
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t bg-white/50 backdrop-blur-sm rounded-b-3xl">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredBooks.length)} of {filteredBooks.length}{" "}
            results
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e.target.value)}
            className="px-3 py-1 border rounded-lg bg-white"
          >
            <option value="12">12 per page</option>
            <option value="24">24 per page</option>
            <option value="36">36 per page</option>
            <option value="48">48 per page</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..."}
              className={`px-3 py-1 border rounded-lg ${
                page === currentPage
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const sortOptions = [
    { value: "", label: t("filter.default"), icon: FaSort },
    {
      value: "price_asc",
      label: t("filter.priceLowToHigh"),
      icon: RiPriceTag3Line,
    },
    {
      value: "price_desc",
      label: t("filter.priceHighToLow"),
      icon: RiPriceTag3Line,
    },
    { value: "newest", label: t("filter.newest"), icon: FaCalendarAlt },
    { value: "trending", label: t("filter.trending"), icon: FaChartLine },
    { value: "rating", label: t("filter.highestRated"), icon: FaStar },
    { value: "title", label: t("filter.titleAZ"), icon: FaBookOpen },
  ];


  const viewModes = [
    { mode: "grid", icon: FaThLarge, label: "Grid" },
    { mode: "list", icon: FaList, label: "List" },
    { mode: "compact", icon: FaTh, label: "Compact" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-xl font-semibold text-gray-700">
            {t("filter.loadingBooks")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            {t("filter.errorLoadingBooks")}
          </h2>
          <p className="text-gray-600">{t("filter.pleaseTryAgainLater")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative z-10 flex gap-4 max-w-[1920px] mx-auto px-4 py-8"
      >
        {/* Sidebar Filter */}
        <div
          ref={filtersRef}
          className={`${
            showFilters ? "block" : "hidden"
          } lg:block w-64 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 h-fit sticky top-8`}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaFilter className="text-white text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {t("filter.filters")}
              </h3>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("filter.searchBooks")}
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("filter.searchBooksPlaceholder")}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("filter.priceRange")}:{" "}
                  {filters.minPrice.toLocaleString("vi-VN")}đ -{" "}
                  {filters.maxPrice.toLocaleString("vi-VN")}đ
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600">
                      {t("filter.minPrice")}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          minPrice: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0đ</span>
                      <span>1.000.000đ</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      {t("filter.maxPrice")}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange({
                          ...filters,
                          maxPrice: Number.parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0đ</span>
                      <span>1.000.000đ</span>
                    </div>
                  </div>
                </div>
              </div>


              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaSort className="inline mr-2" />
                  {t("filter.sortBy")}
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilters({
                    minPrice: 0,
                    maxPrice: 1000000,
                    sortBy: "",
                  });
                  setSearchQuery("");
                }}
                className="w-full bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors duration-200 font-semibold text-sm"
              >
                {t("filter.clearAllFilters")}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div
            ref={headerRef}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <RiBookOpenLine className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                    {genre === "full" ? t("filter.allBooks") : `${genre} Books`}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {filteredBooks.length} {t("filter.booksFound")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl"
                >
                  <FaFilter />
                  {t("filter.filters")}
                </button>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {viewModes.map((mode) => (
                    <button
                      key={mode.mode}
                      onClick={() => setViewMode(mode.mode)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === mode.mode
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-gray-600 hover:text-blue-500"
                      }`}
                      title={mode.label}
                    >
                      <mode.icon />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
              <div className="text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {t("filter.noBooksFound")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("filter.tryAdjustingSearchOrFilterCriteria")}
              </p>
              <button
                onClick={() => {
                  setFilters({
                    minPrice: 0,
                    maxPrice: 1000000,
                    language: "",
                    author: "",
                    sortBy: "",
                  });
                  setSearchQuery("");
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                {t("filter.clearFilters")}
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-10"
                  : viewMode === "list"
                  ? "space-y-4"
                  : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
              }
            >
              {currentBooks.map((book, index) => (
                <div
                  key={book._id || index}
                  ref={(el) => (booksRef.current[index] = el)}
                  className="group w-full"
                >
                  {viewMode === "list" ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            book.coverImage ||
                            "/placeholder.svg?height=80&width=60"
                          }
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded-lg shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">
                            {book.title}
                          </h3>
                          {book.author && (
                            <p className="text-gray-600 text-sm mb-2">
                              {typeof book.author === "object"
                                ? book.author.name
                                : book.author}
                            </p>
                          )}
                          {book.rating && (
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`text-xs ${
                                    i < Math.floor(book.rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">
                                ({book.rating})
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              {book.price?.newPrice?.toLocaleString("vi-VN")}đ
                            </span>
                            {book.price?.oldPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {book.price.oldPrice.toLocaleString("vi-VN")}đ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <BookCard book={book} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add pagination component */}
          {filteredBooks.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  );
};

export default EnhancedGridBooks;
