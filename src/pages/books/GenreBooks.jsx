/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FaFilter, FaSearch, FaGrid3X3, FaList, FaHeart, FaShoppingCart, FaStar } from "react-icons/fa"
import { RiBookOpenLine, RiPriceTag3Line, RiCalendarLine } from "react-icons/ri"
import { useGetBooksQuery } from "../../redux/features/books/booksApi"
import { useTranslation } from "react-i18next"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const EnhancedGenreBooks = () => {
  const { genre } = useParams()
  const { t } = useTranslation()
  const { data: books = [], isLoading, isError } = useGetBooksQuery()

  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredBook, setHoveredBook] = useState(null)

  const headerRef = useRef(null)
  const filtersRef = useRef(null)
  const booksRef = useRef([])
  const containerRef = useRef(null)

  // Enhanced animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
    }

    if (filtersRef.current) {
      gsap.fromTo(
        filtersRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.3 },
      )
    }
  }, [])

  useEffect(() => {
    booksRef.current.forEach((book, index) => {
      if (book) {
        gsap.fromTo(
          book,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            scrollTrigger: {
              trigger: book,
              start: "top bottom-=100",
              toggleActions: "play none none reverse",
            },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: index * 0.05,
            ease: "power2.out",
          },
        )
      }
    })
  }, [books, sortBy, searchQuery])

  // Filter and sort books
  const filteredBooks = books
    .filter((book) => {
      const matchesGenre = book.category === genre
      const matchesSearch =
        searchQuery === "" ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPrice = book.price?.newPrice >= priceRange[0] && book.price?.newPrice <= priceRange[1]

      return matchesGenre && matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case t("filter.priceLow"):
          return (a.price?.newPrice || 0) - (b.price?.newPrice || 0)
        case t("filter.priceHigh"):
          return (b.price?.newPrice || 0) - (a.price?.newPrice || 0)
        case t("filter.newest"):
          return new Date(b.createdAt) - new Date(a.createdAt)
        case t("filter.oldest"):
          return new Date(a.createdAt) - new Date(b.createdAt)
        case t("filter.rating"):
          return (b.rating || 0) - (a.rating || 0)
        case t("filter.title")  :
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const sortOptions = [
    { value: t("filter.newest"), label: t("filter.newestFirst"), icon: RiCalendarLine },
    { value: t("filter.oldest"), label: t("filter.oldestFirst"), icon: RiCalendarLine },
    { value: t("filter.priceLow"), label: t("filter.priceLowToHigh"), icon: RiPriceTag3Line },
    { value: t("filter.priceHigh"), label: t("filter.priceHighToLow"), icon: RiPriceTag3Line },
    { value: t("filter.rating"), label: t("filter.highestRated"), icon: FaStar },
    { value: t("filter.title"), label: t("filter.titleAZ"), icon: RiBookOpenLine },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-xl font-semibold text-gray-700">
            {t("filter.loading")} {genre} {t("filter.books")}...
          </p>
        </motion.div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4"
        >
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            {t("filter.errorLoadingBooks")}
          </h2>
          <p className="text-gray-600">{t("filter.pleaseTryAgainLater")}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
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
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <RiBookOpenLine className="text-white text-2xl" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                  {genre} {t("filter.books")}
                </h1>
                <p className="text-gray-600 mt-1">{filteredBooks.length} {t("filter.booksFound")}</p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <motion.button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaGrid3X3 />
              </motion.button>
              <motion.button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaList />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          ref={filtersRef}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 mb-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {t("filter.filters")} & {t("filter.search")}
            </h2>
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter />
              {showFilters ? t("filter.hideFilters") : t("filter.showFilters")}
            </motion.button>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${showFilters ? "block" : "hidden lg:grid"}`}>
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

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("filter.sortBy")}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("filter.priceRange")}: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number.parseInt(e.target.value), priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-blue-50 rounded-xl p-3 w-full">
                <p className="text-sm text-gray-600">{t("filter.results")}</p>
                <p className="text-2xl font-bold text-blue-600">{filteredBooks.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Books Grid/List */}
        <AnimatePresence>
          {filteredBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-8xl mb-6"
              >
                📚
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {t("filter.noBooksFound")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("filter.tryAdjustingYourSearchOrFilterCriteria")}
              </p>
              <motion.button
                onClick={() => {
                  setSearchQuery("")
                  setPriceRange([0, 1000])
                  setSortBy("newest")
                }}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                  {t("filter.clearFilters")}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  : "space-y-4"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book._id}
                  ref={(el) => (booksRef.current[index] = el)}
                  className={
                    viewMode === "grid"
                      ? "group"
                      : "bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-300"
                  }
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onHoverStart={() => setHoveredBook(book._id)}
                  onHoverEnd={() => setHoveredBook(null)}
                  whileHover={{ scale: viewMode === "grid" ? 1.02 : 1.01 }}
                >
                  {viewMode === "grid" ? (
                    <Link
                      to={`/books/${book._id}`}
                      className="block bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-white/20"
                    >
                      {/* Book Image */}
                      <div className="relative overflow-hidden h-64">
                        <img
                          src={book.coverImage || "/placeholder.svg?height=256&width=192"}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Action Buttons */}
                        <motion.div
                          className="absolute bottom-4 left-4 right-4 flex justify-center gap-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: hoveredBook === book._id ? 1 : 0, y: hoveredBook === book._id ? 0 : 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.button
                            className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white hover:text-red-500 transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaHeart />
                          </motion.button>
                          <motion.button
                            className="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white hover:text-blue-500 transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaShoppingCart />
                          </motion.button>
                        </motion.div>

                        {/* Discount Badge */}
                        {book.price?.oldPrice && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.3, type: "spring" }}
                            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold"
                          >
                            -{Math.round(((book.price.oldPrice - book.price.newPrice) / book.price.oldPrice) * 100)}%
                          </motion.div>
                        )}
                      </div>

                      {/* Book Details */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                          {book.title}
                        </h3>

                        {book.author && <p className="text-gray-600 text-sm mb-2">{book.author}</p>}

                        {/* Rating */}
                        {book.rating && (
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(book.rating) ? "text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({book.rating})</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-blue-600">${book.price?.newPrice?.toFixed(2)}</span>
                            {book.price?.oldPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                ${book.price.oldPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      to={`/books/${book._id}`}
                      className="flex items-center gap-4 hover:bg-gray-50 transition-colors duration-200 rounded-xl p-2"
                    >
                      <img
                        src={book.coverImage || "/placeholder.svg?height=80&width=60"}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{book.title}</h3>
                        {book.author && <p className="text-gray-600 text-sm mb-2">{book.author}</p>}

                        {book.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(book.rating) ? "text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({book.rating})</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">${book.price?.newPrice?.toFixed(2)}</span>
                          {book.price?.oldPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${book.price.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <motion.button
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaShoppingCart />
                        </motion.button>
                        <motion.button
                          className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaHeart />
                        </motion.button>
                      </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default EnhancedGenreBooks
